import { create } from 'zustand'
import * as FileSystem from 'expo-file-system'
import * as MediaLibrary from 'expo-media-library'
import type { TimelineClip, ActionTagId, RecordingSegment } from '@/types'
import { HIGHLIGHT_DURATION_SECONDS, UNLOCK_BUTTONS_SECONDS } from '@/constants'

interface RecordingState {
  // Stato registrazione
  isRecording: boolean
  recordingStartTime: number | null
  totalRecordingTime: number
  
  // Segmenti video temporanei (buffer degli ultimi ~60 sec)
  segments: RecordingSegment[]
  currentSegmentUri: string | null
  
  // Timeline dei clip salvati (locale)
  timeline: TimelineClip[]
  
  // Clip corrente per tagging (dopo Salva)
  currentClipForTagging: TimelineClip | null
  
  // Event ID collegato (se registra per un evento specifico)
  eventId: string | null
  
  // Actions
  startRecording: () => void
  stopRecording: () => void
  onSegmentComplete: (uri: string, duration: number) => void
  saveClip: () => Promise<TimelineClip | null>
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
  segments: [],
  currentSegmentUri: null,
  timeline: [],
  currentClipForTagging: null,
  eventId: null,

  startRecording: () => {
    set({
      isRecording: true,
      recordingStartTime: Date.now(),
      totalRecordingTime: 0,
      segments: [],
      currentSegmentUri: null,
    })
  },

  stopRecording: () => {
    set({
      isRecording: false,
    })
  },

  onSegmentComplete: (uri, duration) => {
    const { segments } = get()
    const now = Date.now()
    
    const newSegment: RecordingSegment = {
      uri,
      startTime: now - (duration * 1000),
      endTime: now,
      duration,
    }
    
    // Mantieni solo gli ultimi segmenti necessari per ~60 secondi (2x highlight)
    const allSegments = [...segments, newSegment]
    let totalDuration = allSegments.reduce((sum, seg) => sum + seg.duration, 0)
    
    // Rimuovi segmenti vecchi se necessario
    while (totalDuration > HIGHLIGHT_DURATION_SECONDS * 2 && allSegments.length > 1) {
      const removed = allSegments.shift()
      if (removed) {
        totalDuration -= removed.duration
        // Elimina il file del segmento rimosso
        FileSystem.deleteAsync(removed.uri, { idempotent: true }).catch(() => {})
      }
    }
    
    set({
      segments: allSegments,
      currentSegmentUri: null,
    })
  },

  saveClip: async () => {
    const { segments, timeline, eventId, totalRecordingTime } = get()
    
    if (segments.length === 0) {
      console.log('Nessun segmento disponibile')
      return null
    }
    
    try {
      // Prendi l'ultimo segmento completato (contiene gli ultimi ~30 sec)
      const lastSegment = segments[segments.length - 1]
      
      // Genera ID e path per il clip
      const clipId = `clip_${Date.now()}`
      const clipsDir = `${FileSystem.documentDirectory}clips/`
      const clipPath = `${clipsDir}${clipId}.mp4`
      
      // Crea directory se non esiste
      const dirInfo = await FileSystem.getInfoAsync(clipsDir)
      if (!dirInfo.exists) {
        await FileSystem.makeDirectoryAsync(clipsDir, { intermediates: true })
      }
      
      // Copia il file nella directory clips
      await FileSystem.copyAsync({
        from: lastSegment.uri,
        to: clipPath,
      })
      
      // Salva anche nella galleria del telefono
      try {
        const { status } = await MediaLibrary.requestPermissionsAsync()
        if (status === 'granted') {
          const asset = await MediaLibrary.createAssetAsync(clipPath)
          let album = await MediaLibrary.getAlbumAsync('CampoLive')
          if (!album) {
            album = await MediaLibrary.createAlbumAsync('CampoLive', asset, false)
          } else {
            await MediaLibrary.addAssetsToAlbumAsync([asset], album, false)
          }
        }
      } catch (mediaError) {
        console.log('Errore salvataggio in galleria:', mediaError)
        // Non bloccare se fallisce il salvataggio in galleria
      }
      
      // Crea il clip
      const newClip: TimelineClip = {
        id: clipId,
        uri: clipPath,
        duration: Math.min(lastSegment.duration, HIGHLIGHT_DURATION_SECONDS),
        createdAt: new Date(),
        tags: [],
        isUploaded: false,
        eventId: eventId || undefined,
      }
      
      set({
        timeline: [...timeline, newClip],
        currentClipForTagging: newClip,
      })
      
      return newClip
    } catch (error) {
      console.error('Errore salvataggio clip:', error)
      return null
    }
  },

  discardAll: async () => {
    const { segments, currentSegmentUri } = get()
    
    // Elimina tutti i segmenti temporanei
    for (const segment of segments) {
      try {
        await FileSystem.deleteAsync(segment.uri, { idempotent: true })
      } catch (e) {
        console.log('Errore eliminazione segmento:', e)
      }
    }
    
    // Elimina segmento corrente se esiste
    if (currentSegmentUri) {
      try {
        await FileSystem.deleteAsync(currentSegmentUri, { idempotent: true })
      } catch (e) {
        console.log('Errore eliminazione segmento corrente:', e)
      }
    }
    
    // Reset registrazione ma mantieni timeline esistente
    set({
      isRecording: false,
      recordingStartTime: null,
      totalRecordingTime: 0,
      segments: [],
      currentSegmentUri: null,
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
      // Elimina il file
      try {
        await FileSystem.deleteAsync(clip.uri, { idempotent: true })
      } catch (e) {
        console.log('Errore eliminazione file clip:', e)
      }
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
    const { totalRecordingTime, segments } = get()
    return totalRecordingTime >= UNLOCK_BUTTONS_SECONDS && segments.length > 0
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
      segments: [],
      currentSegmentUri: null,
      timeline: [],
      currentClipForTagging: null,
      eventId: null,
    })
  },
}))
