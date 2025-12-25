/**
 * Video Trimming utilities
 * Estrae gli ultimi N secondi da un video
 */

import * as FileSystem from 'expo-file-system/legacy'
import * as MediaLibrary from 'expo-media-library'

export interface TrimResult {
  uri: string
  duration: number
  startTime: number
  endTime: number
}

/**
 * Calcola i parametri di trim per estrarre gli ultimi N secondi
 */
export function calculateTrimParams(
  videoDuration: number,
  highlightDuration: number = 30
): { startTime: number; endTime: number; duration: number } {
  const startTime = Math.max(0, videoDuration - highlightDuration)
  const endTime = videoDuration
  const duration = endTime - startTime
  
  return { startTime, endTime, duration }
}

/**
 * Genera il path di output per un clip
 */
export async function generateClipPath(): Promise<string> {
  const outputDir = `${FileSystem.documentDirectory}clips/`
  
  // Crea directory se non esiste
  const dirInfo = await FileSystem.getInfoAsync(outputDir)
  if (!dirInfo.exists) {
    await FileSystem.makeDirectoryAsync(outputDir, { intermediates: true })
  }
  
  return `${outputDir}clip_${Date.now()}.mp4`
}

/**
 * Copia un file video in una nuova posizione
 */
export async function copyVideoFile(
  sourceUri: string,
  destUri: string
): Promise<void> {
  await FileSystem.copyAsync({
    from: sourceUri,
    to: destUri,
  })
}

/**
 * Elimina un file video
 */
export async function deleteVideoFile(uri: string): Promise<void> {
  try {
    await FileSystem.deleteAsync(uri, { idempotent: true })
  } catch (error) {
    console.log('Error deleting video file:', error)
  }
}

/**
 * Genera il path per il file di registrazione continua
 */
export async function generateRecordingPath(): Promise<string> {
  const recordingDir = `${FileSystem.documentDirectory}recording/`
  
  // Crea directory se non esiste
  const dirInfo = await FileSystem.getInfoAsync(recordingDir)
  if (!dirInfo.exists) {
    await FileSystem.makeDirectoryAsync(recordingDir, { intermediates: true })
  }
  
  return `${recordingDir}continuous_${Date.now()}.mp4`
}

/**
 * Pulisce la directory di registrazione temporanea
 */
export async function cleanRecordingDirectory(): Promise<void> {
  const recordingDir = `${FileSystem.documentDirectory}recording/`
  
  try {
    const dirInfo = await FileSystem.getInfoAsync(recordingDir)
    if (dirInfo.exists) {
      await FileSystem.deleteAsync(recordingDir, { idempotent: true })
      await FileSystem.makeDirectoryAsync(recordingDir, { intermediates: true })
    }
  } catch (error) {
    console.log('Error cleaning recording directory:', error)
  }
}

/**
 * Salva un video nella galleria del dispositivo
 */
export async function saveToGallery(videoUri: string): Promise<boolean> {
  try {
    const { status } = await MediaLibrary.requestPermissionsAsync()
    if (status !== 'granted') {
      console.log('Permesso galleria non concesso')
      return false
    }
    
    const asset = await MediaLibrary.createAssetAsync(videoUri)
    let album = await MediaLibrary.getAlbumAsync('CampoLive')
    
    if (!album) {
      album = await MediaLibrary.createAlbumAsync('CampoLive', asset, false)
    } else {
      await MediaLibrary.addAssetsToAlbumAsync([asset], album, false)
    }
    
    console.log('Video salvato nella galleria:', asset.uri)
    return true
  } catch (error) {
    console.log('Errore salvataggio in galleria:', error)
    return false
  }
}
