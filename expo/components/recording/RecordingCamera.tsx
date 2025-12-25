import React, { useRef, useState, useEffect, useCallback } from 'react'
import { View, Text, TouchableOpacity, Alert, Vibration, StyleSheet, Modal, ScrollView } from 'react-native'
import { CameraView, CameraType, useCameraPermissions, useMicrophonePermissions } from 'expo-camera'
import * as MediaLibrary from 'expo-media-library'
import { router } from 'expo-router'
import { 
  Save, 
  Trash2, 
  RotateCcw, 
  X,
  Check,
  Clock,
  Video,
  Square,
  Tag,
  List
} from 'lucide-react-native'
import { useRecordingStore } from '@/store/recordingStore'
import { HIGHLIGHT_DURATION_SECONDS, UNLOCK_BUTTONS_SECONDS } from '@/constants'
import { ACTION_TAGS, ActionTagId } from '@/types'

interface RecordingCameraProps {
  eventId?: string
  onClose: () => void
  onRecordingComplete?: (timeline: any[]) => void
}

export function RecordingCamera({ eventId, onClose, onRecordingComplete }: RecordingCameraProps) {
  const cameraRef = useRef<CameraView>(null)
  const segmentIntervalRef = useRef<NodeJS.Timeout | null>(null)
  const [facing, setFacing] = useState<CameraType>('back')
  const [cameraPermission, requestCameraPermission] = useCameraPermissions()
  const [micPermission, requestMicPermission] = useMicrophonePermissions()
  const [recordingTime, setRecordingTime] = useState(0)
  const [isSaving, setIsSaving] = useState(false)
  const [isActivelyRecording, setIsActivelyRecording] = useState(false)
  const [showTagModal, setShowTagModal] = useState(false)
  
  const {
    isRecording,
    timeline,
    currentClipForTagging,
    startRecording,
    stopRecording,
    onSegmentComplete,
    saveClip,
    discardAll,
    addTagToClip,
    removeTagFromClip,
    finishTagging,
    setEventId,
    updateTime,
    reset,
  } = useRecordingStore()

  // Set event ID se fornito
  useEffect(() => {
    if (eventId) {
      setEventId(eventId)
    }
  }, [eventId])

  // Timer per durata registrazione
  useEffect(() => {
    let interval: NodeJS.Timeout
    if (isRecording) {
      interval = setInterval(() => {
        setRecordingTime(prev => {
          const newTime = prev + 1
          updateTime(newTime)
          return newTime
        })
      }, 1000)
    }
    return () => clearInterval(interval)
  }, [isRecording])

  // Mostra modal tag quando c'è un clip da taggare
  useEffect(() => {
    if (currentClipForTagging) {
      setShowTagModal(true)
    }
  }, [currentClipForTagging])

  const formatTime = (seconds: number) => {
    const hrs = Math.floor(seconds / 3600)
    const mins = Math.floor((seconds % 3600) / 60)
    const secs = seconds % 60
    
    if (hrs > 0) {
      return `${hrs}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
    }
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
  }

  // Avvia registrazione continua in segmenti
  const handleStartRecording = async () => {
    if (!cameraRef.current || isActivelyRecording) return

    setIsActivelyRecording(true)
    startRecording()
    startSegmentRecording()
  }

  // Registra un segmento di ~30 secondi
  const startSegmentRecording = async () => {
    if (!cameraRef.current) return

    try {
      const video = await cameraRef.current.recordAsync({
        maxDuration: HIGHLIGHT_DURATION_SECONDS,
      })
      
      if (video) {
        // Segmento completato, salvalo nel buffer
        onSegmentComplete(video.uri, HIGHLIGHT_DURATION_SECONDS)
        
        // Se ancora in recording, avvia nuovo segmento
        if (useRecordingStore.getState().isRecording) {
          startSegmentRecording()
        }
      }
    } catch (error) {
      console.error('Errore segmento registrazione:', error)
    }
  }

  // Stop registrazione
  const handleStopRecording = async () => {
    if (!cameraRef.current) return
    
    try {
      cameraRef.current.stopRecording()
      stopRecording()
      setIsActivelyRecording(false)
    } catch (error) {
      console.error('Errore stop registrazione:', error)
    }
  }

  // Salva clip (ultimi 30 sec)
  const handleSaveClip = async () => {
    if (recordingTime < UNLOCK_BUTTONS_SECONDS) return
    
    setIsSaving(true)
    Vibration.vibrate(100)
    
    // Ferma registrazione corrente per salvare il segmento
    if (cameraRef.current && isActivelyRecording) {
      cameraRef.current.stopRecording()
    }
    
    try {
      const clip = await saveClip()
      
      if (clip) {
        Vibration.vibrate([0, 100, 100, 100])
        // Il modal tag si aprirà automaticamente grazie all'useEffect
      } else {
        Alert.alert('Errore', 'Impossibile salvare il clip')
      }
    } catch (error) {
      console.error('Errore salvataggio clip:', error)
      Alert.alert('Errore', 'Si è verificato un errore nel salvataggio')
    } finally {
      setIsSaving(false)
      
      // Riprendi registrazione
      if (isRecording) {
        startSegmentRecording()
      }
    }
  }

  // Scarta tutto e ricomincia
  const handleDiscard = () => {
    Alert.alert(
      '🗑️ Scarta Registrazione',
      'Vuoi scartare tutta la registrazione corrente e ricominciare da zero?',
      [
        { text: 'Annulla', style: 'cancel' },
        { 
          text: 'Scarta', 
          style: 'destructive',
          onPress: async () => {
            if (cameraRef.current && isActivelyRecording) {
              cameraRef.current.stopRecording()
            }
            await discardAll()
            setRecordingTime(0)
            setIsActivelyRecording(false)
            Vibration.vibrate(200)
          }
        },
      ]
    )
  }

  // Termina sessione
  const handleFinish = () => {
    Alert.alert(
      'Termina Registrazione',
      `Hai ${timeline.length} clip nella timeline. Vuoi terminare la sessione?`,
      [
        { text: 'Continua', style: 'cancel' },
        {
          text: 'Termina',
          onPress: async () => {
            if (cameraRef.current && isActivelyRecording) {
              cameraRef.current.stopRecording()
            }
            stopRecording()
            onRecordingComplete?.(timeline)
            reset()
            onClose()
          }
        },
      ]
    )
  }

  // Toggle tag su clip corrente
  const handleTagToggle = (tagId: ActionTagId) => {
    if (!currentClipForTagging) return
    
    if (currentClipForTagging.tags.includes(tagId)) {
      removeTagFromClip(currentClipForTagging.id, tagId)
    } else {
      addTagToClip(currentClipForTagging.id, tagId)
    }
    Vibration.vibrate(50)
  }

  // Chiudi modal tag e continua
  const handleFinishTagging = () => {
    finishTagging()
    setShowTagModal(false)
  }

  const toggleCameraFacing = () => {
    setFacing(current => (current === 'back' ? 'front' : 'back'))
  }

  const buttonsUnlocked = recordingTime >= UNLOCK_BUTTONS_SECONDS

  // Verifica permessi
  if (!cameraPermission || !micPermission) {
    return (
      <View style={styles.container}>
        <Text style={styles.permissionText}>Caricamento permessi...</Text>
      </View>
    )
  }

  if (!cameraPermission.granted || !micPermission.granted) {
    return (
      <View style={styles.container}>
        <Text style={styles.permissionText}>
          Per registrare video, CampoLive ha bisogno di accedere alla fotocamera e al microfono.
        </Text>
        <TouchableOpacity
          onPress={async () => {
            await requestCameraPermission()
            await requestMicPermission()
          }}
          style={styles.permissionButton}
        >
          <Text style={styles.permissionButtonText}>Concedi Permessi</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={onClose} style={styles.cancelButton}>
          <Text style={styles.cancelButtonText}>Annulla</Text>
        </TouchableOpacity>
      </View>
    )
  }

  return (
    <View style={styles.container}>
      {/* Camera Layer */}
      <CameraView
        ref={cameraRef}
        style={StyleSheet.absoluteFill}
        facing={facing}
        mode="video"
      />
      
      {/* Overlay Layer */}
      <View style={styles.overlay} pointerEvents="box-none">
        {/* Header - Top bar */}
        <View style={styles.header}>
          <TouchableOpacity onPress={onClose} style={styles.iconButton}>
            <X size={28} color="#fff" />
          </TouchableOpacity>
          
          {/* Timer */}
          <View style={styles.timerContainer}>
            {isRecording && (
              <View style={styles.recIndicator} />
            )}
            <Clock size={18} color="#fff" />
            <Text style={styles.timerText}>{formatTime(recordingTime)}</Text>
          </View>
          
          <TouchableOpacity onPress={toggleCameraFacing} style={styles.iconButton}>
            <RotateCcw size={28} color="#fff" />
          </TouchableOpacity>
        </View>

        {/* Timeline counter - cliccabile per vedere timeline */}
        {timeline.length > 0 && (
          <TouchableOpacity 
            onPress={() => router.push({
              pathname: '/timeline',
              params: eventId ? { eventId } : {}
            })}
            style={styles.timelineCounter}
          >
            <List size={16} color="#fff" />
            <Text style={styles.timelineCounterText}>{timeline.length} clip</Text>
          </TouchableOpacity>
        )}

        {/* Recording indicator */}
        {isRecording && (
          <View style={styles.recBadge}>
            <View style={styles.recDot} />
            <Text style={styles.recText}>REC</Text>
          </View>
        )}

        {/* Bottom Controls */}
        <View style={styles.bottomControls}>
          {/* Info Text */}
          <View style={styles.infoContainer}>
            {!isRecording && recordingTime === 0 && (
              <Text style={styles.infoText}>
                Premi il pulsante rosso per iniziare
              </Text>
            )}
            {isRecording && !buttonsUnlocked && (
              <Text style={styles.infoTextYellow}>
                Ancora {UNLOCK_BUTTONS_SECONDS - recordingTime}s per sbloccare i controlli
              </Text>
            )}
            {isRecording && buttonsUnlocked && (
              <Text style={styles.infoTextGreen}>
                Salva per catturare gli ultimi {HIGHLIGHT_DURATION_SECONDS}s
              </Text>
            )}
          </View>

          {/* Main Controls Row */}
          <View style={styles.controlsRow}>
            {/* Scarta Button */}
            <TouchableOpacity
              onPress={handleDiscard}
              disabled={!buttonsUnlocked}
              style={styles.controlItem}
            >
              <View style={[
                styles.sideButton, 
                styles.discardButton,
                !buttonsUnlocked && styles.buttonDisabled
              ]}>
                <Trash2 size={24} color="#fff" />
              </View>
              <Text style={styles.controlLabel}>Scarta</Text>
            </TouchableOpacity>

            {/* Record / Stop Button */}
            <TouchableOpacity
              onPress={isRecording ? handleStopRecording : handleStartRecording}
              style={styles.controlItem}
            >
              <View style={[
                styles.recordButton,
                isRecording && styles.recordButtonActive
              ]}>
                {!isRecording ? (
                  <View style={styles.recordButtonInner} />
                ) : (
                  <Square size={32} color="#fff" fill="#fff" />
                )}
              </View>
              <Text style={styles.controlLabel}>
                {isRecording ? 'Stop' : 'Avvia'}
              </Text>
            </TouchableOpacity>

            {/* Salva Button */}
            <TouchableOpacity
              onPress={handleSaveClip}
              disabled={!buttonsUnlocked || isSaving}
              style={styles.controlItem}
            >
              <View style={[
                styles.sideButton, 
                styles.saveButton,
                (!buttonsUnlocked || isSaving) && styles.buttonDisabled
              ]}>
                {isSaving ? (
                  <Text style={styles.savingText}>...</Text>
                ) : (
                  <Save size={24} color="#fff" />
                )}
              </View>
              <Text style={styles.controlLabel}>Salva</Text>
            </TouchableOpacity>
          </View>

          {/* Finish Button */}
          {timeline.length > 0 && (
            <TouchableOpacity onPress={handleFinish} style={styles.finishButton}>
              <Check size={20} color="#fff" />
              <Text style={styles.finishButtonText}>
                Termina ({timeline.length} clip salvati)
              </Text>
            </TouchableOpacity>
          )}
        </View>
      </View>

      {/* Tag Selection Modal */}
      <Modal
        visible={showTagModal}
        transparent
        animationType="slide"
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>
              <Tag size={20} color="#22c55e" /> Tagga l'azione
            </Text>
            <Text style={styles.modalSubtitle}>
              Seleziona uno o più tag per questo clip
            </Text>
            
            <ScrollView style={styles.tagsContainer}>
              <View style={styles.tagsGrid}>
                {ACTION_TAGS.map((tag) => {
                  const isSelected = currentClipForTagging?.tags.includes(tag.id)
                  return (
                    <TouchableOpacity
                      key={tag.id}
                      onPress={() => handleTagToggle(tag.id)}
                      style={[
                        styles.tagButton,
                        { borderColor: tag.color },
                        isSelected && { backgroundColor: tag.color }
                      ]}
                    >
                      <Text style={styles.tagEmoji}>{tag.emoji}</Text>
                      <Text style={[
                        styles.tagLabel,
                        isSelected && styles.tagLabelSelected
                      ]}>
                        {tag.label}
                      </Text>
                    </TouchableOpacity>
                  )
                })}
              </View>
            </ScrollView>
            
            <TouchableOpacity 
              onPress={handleFinishTagging}
              style={styles.modalDoneButton}
            >
              <Check size={20} color="#fff" />
              <Text style={styles.modalDoneText}>Continua</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  overlay: {
    flex: 1,
  },
  header: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 16,
    paddingHorizontal: 16,
    paddingBottom: 12,
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  iconButton: {
    padding: 8,
  },
  timerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.6)',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    gap: 8,
  },
  recIndicator: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#ef4444',
  },
  timerText: {
    color: '#fff',
    fontFamily: 'monospace',
    fontSize: 18,
    fontWeight: '600',
  },
  timelineCounter: {
    position: 'absolute',
    top: 80,
    right: 16,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#22c55e',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    gap: 6,
  },
  timelineCounterText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 14,
  },
  recBadge: {
    position: 'absolute',
    top: 80,
    left: 16,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  recDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#ef4444',
  },
  recText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 14,
  },
  bottomControls: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    paddingBottom: 24,
    paddingTop: 16,
    backgroundColor: 'rgba(0,0,0,0.6)',
  },
  infoContainer: {
    alignItems: 'center',
    paddingHorizontal: 16,
    marginBottom: 16,
  },
  infoText: {
    color: '#9ca3af',
    fontSize: 14,
    textAlign: 'center',
  },
  infoTextYellow: {
    color: '#fbbf24',
    fontSize: 14,
    textAlign: 'center',
  },
  infoTextGreen: {
    color: '#4ade80',
    fontSize: 14,
    textAlign: 'center',
  },
  controlsRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 32,
    marginBottom: 16,
  },
  controlItem: {
    alignItems: 'center',
  },
  sideButton: {
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
  },
  discardButton: {
    backgroundColor: 'rgba(239, 68, 68, 0.8)',
  },
  saveButton: {
    backgroundColor: '#22c55e',
  },
  buttonDisabled: {
    opacity: 0.3,
  },
  recordButton: {
    width: 80,
    height: 80,
    borderRadius: 40,
    borderWidth: 4,
    borderColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255,255,255,0.2)',
  },
  recordButtonActive: {
    backgroundColor: '#ef4444',
  },
  recordButtonInner: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#ef4444',
  },
  controlLabel: {
    color: '#fff',
    fontSize: 12,
    marginTop: 4,
  },
  savingText: {
    color: '#fff',
    fontSize: 18,
  },
  finishButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#22c55e',
    marginHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 8,
    gap: 8,
  },
  finishButtonText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 16,
  },
  permissionText: {
    color: '#fff',
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 20,
    paddingHorizontal: 20,
  },
  permissionButton: {
    backgroundColor: '#22c55e',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  permissionButtonText: {
    color: '#fff',
    fontWeight: '600',
  },
  cancelButton: {
    marginTop: 16,
  },
  cancelButtonText: {
    color: '#9ca3af',
  },
  // Modal styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.8)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#1f2937',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 24,
    maxHeight: '70%',
  },
  modalTitle: {
    color: '#fff',
    fontSize: 20,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 4,
  },
  modalSubtitle: {
    color: '#9ca3af',
    fontSize: 14,
    textAlign: 'center',
    marginBottom: 20,
  },
  tagsContainer: {
    maxHeight: 300,
  },
  tagsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: 12,
  },
  tagButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 12,
    borderWidth: 2,
    backgroundColor: 'rgba(255,255,255,0.1)',
    gap: 8,
    minWidth: '45%',
    justifyContent: 'center',
  },
  tagEmoji: {
    fontSize: 20,
  },
  tagLabel: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '500',
  },
  tagLabelSelected: {
    fontWeight: 'bold',
  },
  modalDoneButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#22c55e',
    paddingVertical: 14,
    borderRadius: 12,
    marginTop: 20,
    gap: 8,
  },
  modalDoneText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
})
