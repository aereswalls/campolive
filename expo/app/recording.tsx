import React, { useEffect } from 'react'
import { View, StatusBar } from 'react-native'
import { router } from 'expo-router'
import * as ScreenOrientation from 'expo-screen-orientation'
import { RecordingCamera } from '@/components/recording'

export default function RecordingScreen() {
  // Forza orientamento landscape quando si entra nella schermata
  useEffect(() => {
    const lockOrientation = async () => {
      await ScreenOrientation.lockAsync(
        ScreenOrientation.OrientationLock.LANDSCAPE_RIGHT
      )
    }
    lockOrientation()

    // Ripristina l'orientamento portrait quando si esce
    return () => {
      ScreenOrientation.lockAsync(
        ScreenOrientation.OrientationLock.PORTRAIT_UP
      )
    }
  }, [])

  const handleClose = () => {
    router.back()
  }

  const handleRecordingComplete = (highlights: any[]) => {
    console.log('Recording completed with highlights:', highlights.length)
    // Qui puoi gestire il salvataggio degli highlight su Supabase
    router.back()
  }

  return (
    <View className="flex-1 bg-black">
      <StatusBar hidden />
      <RecordingCamera
        onClose={handleClose}
        onRecordingComplete={handleRecordingComplete}
      />
    </View>
  )
}
