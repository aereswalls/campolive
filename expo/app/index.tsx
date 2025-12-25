import { useEffect } from 'react'
import { router } from 'expo-router'
import { useAuthStore } from '@/store/authStore'
import { Loading } from '@/components/ui'

export default function Index() {
  const { user, isLoading, initialize } = useAuthStore()

  useEffect(() => {
    initialize()
  }, [])

  useEffect(() => {
    if (!isLoading) {
      if (user) {
        router.replace('/(tabs)')
      } else {
        router.replace('/(auth)/login')
      }
    }
  }, [user, isLoading])

  return <Loading message="Caricamento..." />
}
