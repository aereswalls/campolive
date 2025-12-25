import { create } from 'zustand'
import * as FileSystem from 'expo-file-system'
import * as MediaLibrary from 'expo-media-library'
import type { SavedHighlight, RecordingSegment } from '@/types'
import { HIGHLIGHT_DURATION_SECONDS } from '@/constants'

interface RecordingState {
  isRecording: boolean
  isPaused: boolean
  recordingStartTime: number | null
  currentSegmentUri: string | null
  segments: RecordingSegment[]
  highlights: SavedHighlight[]
  recordingDuration: number
  
  // Actions
  startRecording: (uri: string) => void
  stopRecording: () => void
  pauseRecording: () => void
  resumeRecording: (uri: string) => void
  addSegment: (segment: RecordingSegment) => void
  saveHighlight: () => Promise<SavedHighlight | null>
  discardRecording: () => Promise<void>
  clearHighlights: () => void
  updateDuration: (duration: number) => void
  reset: () => void
}

export const useRecordingStore = create<RecordingState>((set, get) => ({
  isRecording: false,
  isPaused: false,
  recordingStartTime: null,
  currentSegmentUri: null,
  segments: [],
  highlights: [],
  recordingDuration: 0,

  startRecording: (uri) => {
    set({
      isRecording: true,
      isPaused: false,
      recordingStartTime: Date.now(),
      currentSegmentUri: uri,
      segments: [],
    })
  },

  stopRecording: () => {
    const { currentSegmentUri, recordingStartTime, segments } = get()
    
    if (currentSegmentUri && recordingStartTime) {
      const now = Date.now()
      const newSegment: RecordingSegment = {
        uri: currentSegmentUri,
        startTime: recordingStartTime,
        endTime: now,
        duration: (now - recordingStartTime) / 1000,
      }
      
      set({
        isRecording: false,
        isPaused: false,
        segments: [...segments, newSegment],
        currentSegmentUri: null,
      })
    } else {
      set({
        isRecording: false,
        isPaused: false,
        currentSegmentUri: null,
      })
    }
  },

  pauseRecording: () => {
    const { currentSegmentUri, recordingStartTime, segments } = get()
    
    if (currentSegmentUri && recordingStartTime) {
      const now = Date.now()
      const newSegment: RecordingSegment = {
        uri: currentSegmentUri,
        startTime: recordingStartTime,
        endTime: now,
        duration: (now - recordingStartTime) / 1000,
      }
      
      set({
        isPaused: true,
        segments: [...segments, newSegment],
        currentSegmentUri: null,
      })
    }
  },

  resumeRecording: (uri) => {
    set({
      isPaused: false,
      recordingStartTime: Date.now(),
      currentSegmentUri: uri,
    })
  },

  addSegment: (segment) => {
    set((state) => ({
      segments: [...state.segments, segment],
    }))
  },

  saveHighlight: async () => {
    const { segments, currentSegmentUri, recordingStartTime, highlights } = get()
    
    try {
      // Calcola quali segmenti includere per gli ultimi 30 secondi
      const now = Date.now()
      const highlightStartTime = now - (HIGHLIGHT_DURATION_SECONDS * 1000)
      
      // Crea una lista di tutti i segmenti incluso quello corrente
      let allSegments = [...segments]
      
      if (currentSegmentUri && recordingStartTime) {
        allSegments.push({
          uri: currentSegmentUri,
          startTime: recordingStartTime,
          endTime: now,
          duration: (now - recordingStartTime) / 1000,
        })
      }
      
      // Filtra i segmenti che rientrano negli ultimi 30 secondi
      const relevantSegments = allSegments.filter(
        seg => seg.endTime >= highlightStartTime
      )
      
      if (relevantSegments.length === 0) {
        console.log('Nessun segmento disponibile per l\'highlight')
        return null
      }
      
      // Per semplicità, usa l'ultimo segmento disponibile
      // In produzione si dovrebbe fare un merge dei video
      const lastSegment = relevantSegments[relevantSegments.length - 1]
      
      // Genera un nome file univoco
      const highlightId = `highlight_${Date.now()}`
      const highlightDir = `${FileSystem.documentDirectory}highlights/`
      const highlightPath = `${highlightDir}${highlightId}.mp4`
      
      // Crea la directory se non esiste
      const dirInfo = await FileSystem.getInfoAsync(highlightDir)
      if (!dirInfo.exists) {
        await FileSystem.makeDirectoryAsync(highlightDir, { intermediates: true })
      }
      
      // Copia il file
      await FileSystem.copyAsync({
        from: lastSegment.uri,
        to: highlightPath,
      })
      
      // Salva nella galleria
      const { status } = await MediaLibrary.requestPermissionsAsync()
      if (status === 'granted') {
        const asset = await MediaLibrary.createAssetAsync(highlightPath)
        
        // Crea o ottieni l'album CampoLive
        let album = await MediaLibrary.getAlbumAsync('CampoLive Highlights')
        if (!album) {
          album = await MediaLibrary.createAlbumAsync('CampoLive Highlights', asset, false)
        } else {
          await MediaLibrary.addAssetsToAlbumAsync([asset], album, false)
        }
      }
      
      const highlight: SavedHighlight = {
        id: highlightId,
        uri: highlightPath,
        duration: Math.min(lastSegment.duration, HIGHLIGHT_DURATION_SECONDS),
        createdAt: new Date(),
      }
      
      set({ highlights: [...highlights, highlight] })
      
      return highlight
    } catch (error) {
      console.error('Errore nel salvare l\'highlight:', error)
      return null
    }
  },

  discardRecording: async () => {
    const { segments, currentSegmentUri, highlights } = get()
    
    try {
      // Elimina tutti i segmenti registrati (ma NON gli highlights già salvati)
      for (const segment of segments) {
        try {
          const fileInfo = await FileSystem.getInfoAsync(segment.uri)
          if (fileInfo.exists) {
            await FileSystem.deleteAsync(segment.uri, { idempotent: true })
          }
        } catch (e) {
          console.log('Errore eliminazione segmento:', e)
        }
      }
      
      // Elimina anche il segmento corrente se esiste
      if (currentSegmentUri) {
        try {
          const fileInfo = await FileSystem.getInfoAsync(currentSegmentUri)
          if (fileInfo.exists) {
            await FileSystem.deleteAsync(currentSegmentUri, { idempotent: true })
          }
        } catch (e) {
          console.log('Errore eliminazione segmento corrente:', e)
        }
      }
      
      // Reset stato ma mantieni gli highlights
      set({
        isRecording: false,
        isPaused: false,
        recordingStartTime: null,
        currentSegmentUri: null,
        segments: [],
        recordingDuration: 0,
        // highlights rimangono intatti
      })
    } catch (error) {
      console.error('Errore nello scartare la registrazione:', error)
    }
  },

  clearHighlights: () => {
    set({ highlights: [] })
  },

  updateDuration: (duration) => {
    set({ recordingDuration: duration })
  },

  reset: () => {
    set({
      isRecording: false,
      isPaused: false,
      recordingStartTime: null,
      currentSegmentUri: null,
      segments: [],
      highlights: [],
      recordingDuration: 0,
    })
  },
}))
