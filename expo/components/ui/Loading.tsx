import React from 'react'
import { View, Text, ActivityIndicator } from 'react-native'

interface LoadingProps {
  message?: string
  fullScreen?: boolean
}

export function Loading({ message = 'Caricamento...', fullScreen = false }: LoadingProps) {
  if (fullScreen) {
    return (
      <View className="flex-1 items-center justify-center bg-gray-50">
        <ActivityIndicator size="large" color="#16a34a" />
        <Text className="mt-4 text-gray-600">{message}</Text>
      </View>
    )
  }

  return (
    <View className="p-4 items-center">
      <ActivityIndicator size="small" color="#16a34a" />
      <Text className="mt-2 text-gray-600 text-sm">{message}</Text>
    </View>
  )
}
