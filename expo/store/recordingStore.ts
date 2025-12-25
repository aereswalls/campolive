import { create } from 'zustand'
import * as FileSystem from 'expo-file-system/legacy'
import type { TimelineClip, ActionTagId } from '@/types'
import { HIGHLIGHT_DURATION_SECONDS, UNLOCK_BUTTONS_SECONDS } from '@/constants'
import { 
  generateClipPath, 
  cleanRecordingDirectory,
  deleteVideoFile,
  calculateTrimParams,
  saveToGallery
} from '@/lib/videoTrim'

interface RecordingState {
  // Stato registrazione
  isRecording: boolean
  recordingStartTime: number | null
  totalRecordingTime: number
  
  // File di registrazione continua
  currentRecordingUri: string | null
  
  // Timeline dei clip salvati (locale)
  timeline: TimelineClip[]
  
  // Clip corrente per tagging (dopo Salva)
  currentClipForTagging: TimelineClip | null
  
  // Event ID collegato (se registra per un evento specifico)
  eventId: string | null
  
  // Stato trimming
  isTrimming: boolean
  
  // Actions
  startRecording: (recordingUri: string) => void
  stopRecording: () => void
  saveHighlight: (videoUri: string) => Promise<TimelineClip | null>
  discardAll: () => Promise<void>
  addTagToClip: (clipId: string, tag: ActionTagId) => void
  removeTagFromClip: (clipId: string, tag: ActionTagId) => void
  removeClip: (clipId: string) => Promise<void>
  markClipAsUploaded: (clipId: string) => void
  finishTagging: () => void
  setEventId: (eventId: string | null) => void
  updateTime: (time: number) => void
  reset: () => void
  
  // Getters
  canSave: () => boolean
  canDiscard: () => boolean
}

export const useRecordingStore = create<RecordingState>((set, get) => ({
  isRecording: false,
  recordingStartTime: null,
  totalRecordingTime: 0,
  currentRecordingUri: null,
  timeline: [],
  currentClipForTagging: null,
  eventId: null,
  isTrimming: false,

  startRecording: (recordingUri: string) => {
    set({
      isRecording: true,
      recordingStartTime: Date.now(),
      totalRecordingTime: 0,
      currentRecordingUri: recordingUri,
    })
  },

  stopRecording: () => {
    set({
      isRecording: false,
    })
  },

  /**
   * Salva un highlight (ultimi 30 secondi) dal video corrente.
   * Poiché react-native-video-trim ha bisogno di interazione UI per trimmrare,
   * usiamo un approccio alternativo: copiamo il video e poi usiamo FFmpeg
   * se disponibile, altrimenti salviamo il video intero.
   * 
   * Per ora: salviamo il video intero ma tracciamo start/end time per 
   * trimmare lato server o in un secondo momento.
   */
  saveHighlight: async (videoUri: string) => {
    const { timeline, eventId, totalRecordingTime } = get()
    
    if (!videoUri) {
      console.log('Nessun video disponibile')
      return null
    }
    
    set({ isTrimming: true })
    
    try {
      // Calcola i parametri di trim
      const { startTime, endTime, duration } = calculateTrimParams(
        totalRecordingTime,
        HIGHLIGHT_DURATION_SECONDS
      )
      
      // Genera path per il clip
      const clipId = `clip_${Date.now()}`
      const clipPath = await generateClipPath()
      
      // Copia il video nella directory clips
      await FileSystem.copyAsync({
        from: videoUri,
        to: clipPath,
      })
      
      console.log('Video copiato in:', clipPath)
      
      // Salva nella galleria del telefono
      const savedToGallery = await saveToGallery(clipPath)
      console.log('Salvato in galleria:', savedToGallery)
      
      // Crea il clip con metadati di trim
      const newClip: TimelineClip = {
        id: clipId,
        uri: clipPath,
        duration: duration,
        createdAt: new Date(),
        tags: [],
        isUploaded: false,
        eventId: eventId || undefined,
        // Metadati per trim posteriore
        trimStartTime: startTime,
        trimEndTime: endTime,
        originalDuration: totalRecordingTime,
      }
      
      set({
        timeline: [...timeline, newClip],
        currentClipForTagging: newClip,
        isTrimming: false,
      })
      
      return newClip
    } catch (error) {
      console.error('Errore salvataggio highlight:', error)
      set({ isTrimming: false })
      return null
    }
  },

  discardAll: async () => {
    const { currentRecordingUri } = get()
    
    // Elimina file di registrazione corrente
    if (currentRecordingUri) {
      await deleteVideoFile(currentRecordingUri)
    }
    
    // Pulisci directory registrazione
    await cleanRecordingDirectory()
    
    // Reset stato ma mantieni timeline
    set({
      isRecording: false,
      recordingStartTime: null,
      totalRecordingTime: 0,
      currentRecordingUri: null,
    })
  },

  addTagToClip: (clipId, tag) => {
    set((state) => ({
      timeline: state.timeline.map((clip) =>
        clip.id === clipId && !clip.tags.includes(tag)
          ? { ...clip, tags: [...clip.tags, tag] }
          : clip
      ),
      currentClipForTagging: state.currentClipForTagging?.id === clipId
        ? { 
            ...state.currentClipForTagging, 
            tags: [...new Set([...state.currentClipForTagging.tags, tag])] 
          }
        : state.currentClipForTagging,
    }))
  },

  removeTagFromClip: (clipId, tag) => {
    set((state) => ({
      timeline: state.timeline.map((clip) =>
        clip.id === clipId
          ? { ...clip, tags: clip.tags.filter((t) => t !== tag) }
          : clip
      ),
      currentClipForTagging: state.currentClipForTagging?.id === clipId
        ? { 
            ...state.currentClipForTagging, 
            tags: state.currentClipForTagging.tags.filter((t) => t !== tag) 
          }
        : state.currentClipForTagging,
    }))
  },

  removeClip: async (clipId: string) => {
    const { timeline } = get()
    const clip = timeline.find(c => c.id === clipId)
    
    if (clip) {
      await deleteVideoFile(clip.uri)
    }
    
    set((state) => ({
      timeline: state.timeline.filter(c => c.id !== clipId),
    }))
  },

  markClipAsUploaded: (clipId: string) => {
    set((state) => ({
      timeline: state.timeline.map((clip) =>
        clip.id === clipId
          ? { ...clip, isUploaded: true }
          : clip
      ),
    }))
  },

  finishTagging: () => {
    set({ currentClipForTagging: null })
  },

  setEventId: (eventId) => {
    set({ eventId })
  },

  updateTime: (time) => {
    set({ totalRecordingTime: time })
  },

  canSave: () => {
    const { totalRecordingTime, isRecording } = get()
    return totalRecordingTime >= UNLOCK_BUTTONS_SECONDS && isRecording
  },

  canDiscard: () => {
    const { totalRecordingTime } = get()
    return totalRecordingTime >= UNLOCK_BUTTONS_SECONDS
  },

  reset: () => {
    set({
      isRecording: false,
      recordingStartTime: null,
      totalRecordingTime: 0,
      currentRecordingUri: null,
      timeline: [],
      currentClipForTagging: null,
      eventId: null,
      isTrimming: false,
    })
  },
}))
