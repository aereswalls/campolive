import React, { useRef, useState, useEffect, useCallback } from 'react'
import { View, Text, TouchableOpacity, Alert, Vibration, Dimensions } from 'react-native'
import { CameraView, CameraType, useCameraPermissions, useMicrophonePermissions } from 'expo-camera'
import * as MediaLibrary from 'expo-media-library'
import { 
  Video, 
  Pause, 
  Play, 
  Star, 
  Trash2, 
  RotateCcw, 
  X,
  Check,
  Clock,
  Zap
} from 'lucide-react-native'
import { useRecordingStore } from '@/store/recordingStore'
import { HIGHLIGHT_DURATION_SECONDS } from '@/constants'

interface RecordingCameraProps {
  eventId?: string
  onClose: () => void
  onRecordingComplete?: (highlights: any[]) => void
}

export function RecordingCamera({ eventId, onClose, onRecordingComplete }: RecordingCameraProps) {
  const cameraRef = useRef<CameraView>(null)
  const [facing, setFacing] = useState<CameraType>('back')
  const [cameraPermission, requestCameraPermission] = useCameraPermissions()
  const [micPermission, requestMicPermission] = useMicrophonePermissions()
  const [mediaPermission, setMediaPermission] = useState(false)
  const [recordingTime, setRecordingTime] = useState(0)
  const [savingHighlight, setSavingHighlight] = useState(false)
  const [isActivelyRecording, setIsActivelyRecording] = useState(false)
  
  const {
    isRecording,
    isPaused,
    highlights,
    startRecording,
    stopRecording,
    pauseRecording,
    resumeRecording,
    saveHighlight,
    discardRecording,
    reset,
  } = useRecordingStore()

  // Timer per durata registrazione
  useEffect(() => {
    let interval: NodeJS.Timeout
    if (isRecording && !isPaused) {
      interval = setInterval(() => {
        setRecordingTime(prev => prev + 1)
      }, 1000)
    }
    return () => clearInterval(interval)
  }, [isRecording, isPaused])

  // Richiedi permessi
  useEffect(() => {
    (async () => {
      const { status } = await MediaLibrary.requestPermissionsAsync()
      setMediaPermission(status === 'granted')
    })()
  }, [])

  const formatTime = (seconds: number) => {
    const hrs = Math.floor(seconds / 3600)
    const mins = Math.floor((seconds % 3600) / 60)
    const secs = seconds % 60
    
    if (hrs > 0) {
      return `${hrs}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
    }
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
  }

  const handleStartRecording = async () => {
    if (!cameraRef.current || isActivelyRecording) return

    setIsActivelyRecording(true)
    startRecording('')
    
    try {
      // recordAsync returns when recording STOPS, not when it starts
      const video = await cameraRef.current.recordAsync({
        maxDuration: 10800, // 3 ore max
      })
      
      // This runs AFTER recording stops
      if (video) {
        stopRecording()
      }
    } catch (error) {
      console.error('Errore avvio registrazione:', error)
      Alert.alert('Errore', 'Impossibile avviare la registrazione')
    } finally {
      setIsActivelyRecording(false)
    }
  }

  const handleStopRecording = async () => {
    if (!cameraRef.current || !isActivelyRecording) return
    
    try {
      cameraRef.current.stopRecording()
      // stopRecording() from store will be called when recordAsync completes
    } catch (error) {
      console.error('Errore stop registrazione:', error)
    }
  }

  const handlePauseResume = async () => {
    if (!cameraRef.current) return
    
    if (isPaused) {
      // Resume: start new recording segment
      if (!isActivelyRecording) {
        setIsActivelyRecording(true)
        resumeRecording('')
        
        try {
          const video = await cameraRef.current.recordAsync({
            maxDuration: 10800,
          })
          if (video) {
            // Recording segment ended
          }
        } catch (error) {
          console.error('Errore ripresa registrazione:', error)
        } finally {
          setIsActivelyRecording(false)
        }
      }
    } else {
      // Pause: stop current recording
      if (isActivelyRecording) {
        pauseRecording()
        cameraRef.current.stopRecording()
      }
    }
  }

  const handleSaveHighlight = async () => {
    if (recordingTime < HIGHLIGHT_DURATION_SECONDS) {
      Alert.alert(
        'Registrazione troppo breve',
        `Devi registrare almeno ${HIGHLIGHT_DURATION_SECONDS} secondi prima di salvare un highlight.`
      )
      return
    }

    setSavingHighlight(true)
    Vibration.vibrate(100) // Feedback tattile
    
    try {
      const highlight = await saveHighlight()
      
      if (highlight) {
        Vibration.vibrate([0, 100, 100, 100]) // Doppia vibrazione di successo
        Alert.alert(
          '✨ Highlight Salvato!',
          `L'highlight degli ultimi ${HIGHLIGHT_DURATION_SECONDS} secondi è stato salvato nella galleria.`,
          [{ text: 'OK' }]
        )
      } else {
        Alert.alert('Errore', 'Impossibile salvare l\'highlight')
      }
    } catch (error) {
      console.error('Errore salvataggio highlight:', error)
      Alert.alert('Errore', 'Si è verificato un errore nel salvataggio')
    } finally {
      setSavingHighlight(false)
    }
  }

  const handleDiscard = () => {
    Alert.alert(
      '🗑️ Scarta Registrazione',
      'Vuoi scartare la registrazione corrente? Gli highlight già salvati rimarranno.',
      [
        { text: 'Annulla', style: 'cancel' },
        { 
          text: 'Scarta', 
          style: 'destructive',
          onPress: async () => {
            if (isRecording && cameraRef.current) {
              cameraRef.current.stopRecording()
            }
            await discardRecording()
            setRecordingTime(0)
            Vibration.vibrate(200)
          }
        },
      ]
    )
  }

  const handleFinish = () => {
    Alert.alert(
      'Termina Registrazione',
      `Hai salvato ${highlights.length} highlight. Vuoi terminare la sessione?`,
      [
        { text: 'Continua', style: 'cancel' },
        {
          text: 'Termina',
          onPress: async () => {
            if (isRecording && cameraRef.current) {
              cameraRef.current.stopRecording()
              stopRecording()
            }
            onRecordingComplete?.(highlights)
            reset()
            onClose()
          }
        },
      ]
    )
  }

  const toggleCameraFacing = () => {
    setFacing(current => (current === 'back' ? 'front' : 'back'))
  }

  // Verifica permessi
  if (!cameraPermission || !micPermission) {
    return (
      <View className="flex-1 bg-black items-center justify-center">
        <Text className="text-white">Caricamento permessi...</Text>
      </View>
    )
  }

  if (!cameraPermission.granted || !micPermission.granted) {
    return (
      <View className="flex-1 bg-black items-center justify-center p-4">
        <Text className="text-white text-lg text-center mb-4">
          Per registrare video, CampoLive ha bisogno di accedere alla fotocamera e al microfono.
        </Text>
        <TouchableOpacity
          onPress={async () => {
            await requestCameraPermission()
            await requestMicPermission()
          }}
          className="bg-green-600 px-6 py-3 rounded-lg"
        >
          <Text className="text-white font-semibold">Concedi Permessi</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={onClose} className="mt-4">
          <Text className="text-gray-400">Annulla</Text>
        </TouchableOpacity>
      </View>
    )
  }

  return (
    <View className="flex-1 bg-black">
      {/* Camera Layer */}
      <CameraView
        ref={cameraRef}
        style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0 }}
        facing={facing}
        mode="video"
      />
      
      {/* Overlay Layer - Above camera */}
      <View style={{ flex: 1 }} pointerEvents="box-none">
        {/* Header */}
        <View className="absolute top-0 left-0 right-0 pt-12 px-4 pb-4 bg-black/50">
          <View className="flex-row justify-between items-center">
            <TouchableOpacity onPress={onClose} className="p-2">
              <X size={28} color="#fff" />
            </TouchableOpacity>
            
            {/* Timer */}
            <View className="flex-row items-center bg-black/60 px-4 py-2 rounded-full">
              {isRecording && !isPaused && (
                <View className="w-3 h-3 bg-red-500 rounded-full mr-2 animate-pulse" />
              )}
              <Clock size={16} color="#fff" />
              <Text className="text-white font-mono text-lg ml-2">
                {formatTime(recordingTime)}
              </Text>
            </View>
            
            <TouchableOpacity onPress={toggleCameraFacing} className="p-2">
              <RotateCcw size={28} color="#fff" />
            </TouchableOpacity>
          </View>
        </View>

        {/* Highlights Counter */}
        {highlights.length > 0 && (
          <View className="absolute top-28 right-4 bg-yellow-500 px-3 py-2 rounded-full flex-row items-center">
            <Star size={16} color="#fff" fill="#fff" />
            <Text className="text-white font-bold ml-1">{highlights.length}</Text>
          </View>
        )}

        {/* Recording Indicator */}
        {isRecording && !isPaused && (
          <View className="absolute top-28 left-4 flex-row items-center">
            <View className="w-4 h-4 bg-red-600 rounded-full mr-2 animate-pulse" />
            <Text className="text-white font-semibold">REC</Text>
          </View>
        )}

        {isPaused && (
          <View className="absolute top-28 left-4 flex-row items-center bg-yellow-500 px-3 py-1 rounded">
            <Pause size={16} color="#fff" />
            <Text className="text-white font-semibold ml-1">PAUSA</Text>
          </View>
        )}

        {/* Bottom Controls */}
        <View className="absolute bottom-0 left-0 right-0 pb-10 pt-6 bg-black/60">
          {/* Main Controls Row */}
          <View className="flex-row items-center justify-center space-x-8 mb-6">
            {/* Discard Button */}
            {(isRecording || recordingTime > 0) && (
              <TouchableOpacity
                onPress={handleDiscard}
                className="items-center"
              >
                <View className="w-14 h-14 rounded-full bg-red-600/80 items-center justify-center">
                  <Trash2 size={24} color="#fff" />
                </View>
                <Text className="text-white text-xs mt-1">Scarta</Text>
              </TouchableOpacity>
            )}

            {/* Record / Pause Button */}
            <TouchableOpacity
              onPress={isRecording ? (isPaused ? handlePauseResume : handlePauseResume) : handleStartRecording}
              className="items-center"
            >
              <View className={`w-20 h-20 rounded-full border-4 border-white items-center justify-center ${
                isRecording && !isPaused ? 'bg-red-600' : 'bg-white/20'
              }`}>
                {!isRecording ? (
                  <View className="w-16 h-16 rounded-full bg-red-600" />
                ) : isPaused ? (
                  <Play size={32} color="#fff" fill="#fff" />
                ) : (
                  <Pause size={32} color="#fff" fill="#fff" />
                )}
              </View>
              <Text className="text-white text-xs mt-1">
                {!isRecording ? 'Avvia' : isPaused ? 'Riprendi' : 'Pausa'}
              </Text>
            </TouchableOpacity>

            {/* Highlight Button */}
            {isRecording && (
              <TouchableOpacity
                onPress={handleSaveHighlight}
                disabled={savingHighlight || recordingTime < HIGHLIGHT_DURATION_SECONDS}
                className="items-center"
              >
                <View className={`w-14 h-14 rounded-full items-center justify-center ${
                  savingHighlight ? 'bg-gray-500' :
                  recordingTime < HIGHLIGHT_DURATION_SECONDS ? 'bg-gray-600' :
                  'bg-yellow-500'
                }`}>
                  {savingHighlight ? (
                    <Text className="text-white">...</Text>
                  ) : (
                    <Zap size={24} color="#fff" fill="#fff" />
                  )}
                </View>
                <Text className="text-white text-xs mt-1">Highlight</Text>
              </TouchableOpacity>
            )}
          </View>

          {/* Info Text */}
          <View className="items-center px-4">
            {!isRecording && recordingTime === 0 && (
              <Text className="text-gray-400 text-center text-sm">
                Premi il pulsante rosso per iniziare a registrare
              </Text>
            )}
            {isRecording && recordingTime < HIGHLIGHT_DURATION_SECONDS && (
              <Text className="text-yellow-400 text-center text-sm">
                Registra ancora {HIGHLIGHT_DURATION_SECONDS - recordingTime}s per salvare un highlight
              </Text>
            )}
            {isRecording && recordingTime >= HIGHLIGHT_DURATION_SECONDS && (
              <Text className="text-green-400 text-center text-sm">
                Premi ⚡ Highlight per salvare gli ultimi {HIGHLIGHT_DURATION_SECONDS} secondi
              </Text>
            )}
          </View>

          {/* Finish Button */}
          {highlights.length > 0 && (
            <TouchableOpacity
              onPress={handleFinish}
              className="mx-4 mt-4 bg-green-600 py-3 rounded-lg flex-row items-center justify-center"
            >
              <Check size={20} color="#fff" />
              <Text className="text-white font-semibold ml-2">
                Termina ({highlights.length} highlight salvati)
              </Text>
            </TouchableOpacity>
          )}
        </View>
      </View>
    </View>
  )
}
