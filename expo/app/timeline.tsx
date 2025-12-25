import React, { useState } from 'react'
import { View, Text, StyleSheet, TouchableOpacity, Alert, Share } from 'react-native'
import { router, useLocalSearchParams } from 'expo-router'
import { SafeAreaView } from 'react-native-safe-area-context'
import { ArrowLeft, Upload, Video } from 'lucide-react-native'
import { useRecordingStore } from '@/store/recordingStore'
import { TimelineList } from '@/components/recording'
import { TimelineClip } from '@/types'
import { supabase } from '@/lib/supabase'

export default function TimelineScreen() {
  const { eventId } = useLocalSearchParams<{ eventId?: string }>()
  const { timeline, removeClip, markClipAsUploaded } = useRecordingStore()
  const [uploading, setUploading] = useState(false)

  const handleBack = () => {
    if (timeline.length > 0) {
      Alert.alert(
        'Clip non caricati',
        'Hai dei clip non ancora caricati. Vuoi uscire comunque?',
        [
          { text: 'Rimani', style: 'cancel' },
          { text: 'Esci', style: 'destructive', onPress: () => router.back() }
        ]
      )
    } else {
      router.back()
    }
  }

  const handlePlay = (clip: TimelineClip) => {
    // Naviga al player video
    router.push({
      pathname: '/video-player',
      params: { uri: clip.uri }
    })
  }

  const handleShare = async (clip: TimelineClip) => {
    try {
      await Share.share({
        url: clip.uri,
        message: `Clip da CampoLive - ${clip.tags.join(', ')}`,
      })
    } catch (error) {
      console.error('Errore condivisione:', error)
    }
  }

  const handleDelete = (clipId: string) => {
    Alert.alert(
      'Elimina Clip',
      'Sei sicuro di voler eliminare questo clip?',
      [
        { text: 'Annulla', style: 'cancel' },
        {
          text: 'Elimina',
          style: 'destructive',
          onPress: () => removeClip(clipId)
        }
      ]
    )
  }

  const handleUpload = async (clip: TimelineClip) => {
    if (!eventId) {
      Alert.alert('Errore', 'Nessun evento selezionato per il caricamento')
      return
    }

    setUploading(true)
    
    try {
      // Leggi il file
      const fileInfo = await FileSystem.getInfoAsync(clip.uri)
      if (!fileInfo.exists) {
        throw new Error('File non trovato')
      }

      // Upload su Supabase Storage
      const fileName = `${eventId}/${clip.id}.mp4`
      const { data: { user } } = await supabase.auth.getUser()
      
      if (!user) {
        throw new Error('Utente non autenticato')
      }

      const filePath = `${user.id}/${fileName}`
      
      // Per ora mostriamo solo un messaggio - l'upload vero richiede 
      // la conversione del file in base64 o blob
      Alert.alert(
        'Upload',
        'Il caricamento su cloud verrà implementato nella versione completa dell\'app.',
        [{ text: 'OK' }]
      )
      
    } catch (error) {
      console.error('Errore upload:', error)
      Alert.alert('Errore', 'Impossibile caricare il clip')
    } finally {
      setUploading(false)
    }
  }

  const handleUploadAll = () => {
    const notUploaded = timeline.filter(c => !c.isUploaded)
    if (notUploaded.length === 0) {
      Alert.alert('Info', 'Tutti i clip sono già stati caricati')
      return
    }

    Alert.alert(
      'Carica Tutti',
      `Vuoi caricare ${notUploaded.length} clip su cloud?`,
      [
        { text: 'Annulla', style: 'cancel' },
        {
          text: 'Carica',
          onPress: async () => {
            for (const clip of notUploaded) {
              await handleUpload(clip)
            }
          }
        }
      ]
    )
  }

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={handleBack} style={styles.backButton}>
          <ArrowLeft size={24} color="#111827" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Timeline</Text>
        {timeline.length > 0 && (
          <TouchableOpacity onPress={handleUploadAll} style={styles.uploadAllButton}>
            <Upload size={20} color="#fff" />
            <Text style={styles.uploadAllText}>Carica</Text>
          </TouchableOpacity>
        )}
      </View>

      {/* Stats */}
      {timeline.length > 0 && (
        <View style={styles.statsBar}>
          <View style={styles.statItem}>
            <Video size={16} color="#6b7280" />
            <Text style={styles.statText}>{timeline.length} clip</Text>
          </View>
          <View style={styles.statItem}>
            <Upload size={16} color="#22c55e" />
            <Text style={styles.statText}>
              {timeline.filter(c => c.isUploaded).length} caricati
            </Text>
          </View>
        </View>
      )}

      {/* Timeline List */}
      <TimelineList
        clips={timeline}
        onPlay={handlePlay}
        onShare={handleShare}
        onDelete={handleDelete}
        onUpload={eventId ? handleUpload : undefined}
      />
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f3f4f6',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#111827',
  },
  uploadAllButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#22c55e',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    gap: 4,
  },
  uploadAllText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 14,
  },
  statsBar: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 24,
    paddingVertical: 12,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  statItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  statText: {
    color: '#6b7280',
    fontSize: 14,
  },
})
