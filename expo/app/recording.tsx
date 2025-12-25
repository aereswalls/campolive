import React from 'react'
import { View, StatusBar } from 'react-native'
import { router } from 'expo-router'
import { RecordingCamera } from '@/components/recording'

export default function RecordingScreen() {
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
      <StatusBar barStyle="light-content" backgroundColor="#000" />
      <RecordingCamera
        onClose={handleClose}
        onRecordingComplete={handleRecordingComplete}
      />
    </View>
  )
}
