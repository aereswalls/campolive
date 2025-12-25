import React, { useEffect } from 'react'
import { Stack } from 'expo-router'
import { StatusBar } from 'expo-status-bar'
import { useAuthStore } from '@/store/authStore'
import '../global.css'

export default function RootLayout() {
  const { initialize, isLoading } = useAuthStore()

  useEffect(() => {
    initialize()
  }, [])

  return (
    <>
      <StatusBar style="auto" />
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="(auth)" />
        <Stack.Screen name="(tabs)" />
        <Stack.Screen 
          name="recording" 
          options={{ 
            presentation: 'fullScreenModal',
            animation: 'fade',
          }} 
        />
        <Stack.Screen 
          name="tournament/[id]" 
          options={{ 
            headerShown: true,
            title: 'Torneo',
          }} 
        />
        <Stack.Screen 
          name="team/[id]" 
          options={{ 
            headerShown: true,
            title: 'Squadra',
          }} 
        />
        <Stack.Screen 
          name="event/[id]" 
          options={{ 
            headerShown: true,
            title: 'Evento',
          }} 
        />
      </Stack>
    </>
  )
}
