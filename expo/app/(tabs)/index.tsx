import React, { useEffect, useState } from 'react'
import { View, Text, ScrollView, TouchableOpacity, RefreshControl } from 'react-native'
import { router } from 'expo-router'
import { 
  Trophy, 
  Users, 
  Calendar, 
  Video, 
  Star,
  ChevronRight,
  Zap
} from 'lucide-react-native'
import { Card, Badge, Loading } from '@/components/ui'
import { useAuthStore } from '@/store/authStore'
import { useTournaments } from '@/hooks/useTournaments'
import { useEvents } from '@/hooks/useEvents'

export default function DashboardScreen() {
  const { user, credits, refreshCredits } = useAuthStore()
  const { tournaments, loading: loadingTournaments, refetch: refetchTournaments } = useTournaments()
  const { events, loading: loadingEvents, refetch: refetchEvents } = useEvents()
  const [refreshing, setRefreshing] = useState(false)

  const onRefresh = async () => {
    setRefreshing(true)
    await Promise.all([
      refreshCredits(),
      refetchTournaments(),
      refetchEvents()
    ])
    setRefreshing(false)
  }

  // Tornei attivi
  const activeTournaments = tournaments?.filter(t => t.status === 'in_progress') || []
  
  // Eventi live
  const liveEvents = events?.filter(e => e.status === 'live') || []

  // Statistiche
  const stats = [
    { 
      label: 'Tornei Attivi', 
      value: activeTournaments.length,
      icon: Trophy,
      color: 'bg-green-100',
      iconColor: '#16a34a'
    },
    { 
      label: 'Eventi Live', 
      value: liveEvents.length,
      icon: Video,
      color: 'bg-red-100',
      iconColor: '#dc2626'
    },
    { 
      label: 'Crediti', 
      value: credits?.credits || 0,
      icon: Star,
      color: 'bg-yellow-100',
      iconColor: '#ca8a04'
    },
  ]

  if (loadingTournaments || loadingEvents) {
    return <Loading message="Caricamento dashboard..." />
  }

  return (
    <ScrollView 
      className="flex-1 bg-gray-100"
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
      }
    >
      <View className="p-4">
        {/* Welcome */}
        <View className="mb-6">
          <Text className="text-2xl font-bold text-gray-900">
            Ciao, {user?.user_metadata?.full_name || 'Utente'}! 👋
          </Text>
          <Text className="text-gray-500 mt-1">
            Ecco il riepilogo della tua attività
          </Text>
        </View>

        {/* Stats Grid */}
        <View className="flex-row flex-wrap gap-3 mb-6">
          {stats.map((stat, index) => (
            <Card key={index} className="flex-1 min-w-[100px] p-4">
              <View className={`w-10 h-10 rounded-full ${stat.color} items-center justify-center mb-2`}>
                <stat.icon size={20} color={stat.iconColor} />
              </View>
              <Text className="text-2xl font-bold text-gray-900">{stat.value}</Text>
              <Text className="text-sm text-gray-500">{stat.label}</Text>
            </Card>
          ))}
        </View>

        {/* Quick Actions */}
        <Text className="text-lg font-semibold text-gray-900 mb-3">Azioni Rapide</Text>
        <Card className="mb-6">
          <TouchableOpacity 
            onPress={() => router.push('/recording')}
            className="flex-row items-center p-4 border-b border-gray-100"
          >
            <View className="w-10 h-10 bg-red-100 rounded-full items-center justify-center mr-3">
              <Video size={20} color="#dc2626" />
            </View>
            <View className="flex-1">
              <Text className="font-semibold text-gray-900">Registra Evento</Text>
              <Text className="text-sm text-gray-500">Avvia una nuova registrazione</Text>
            </View>
            <ChevronRight size={20} color="#9ca3af" />
          </TouchableOpacity>

          <TouchableOpacity 
            onPress={() => router.push('/(tabs)/tournaments')}
            className="flex-row items-center p-4 border-b border-gray-100"
          >
            <View className="w-10 h-10 bg-green-100 rounded-full items-center justify-center mr-3">
              <Trophy size={20} color="#16a34a" />
            </View>
            <View className="flex-1">
              <Text className="font-semibold text-gray-900">I Miei Tornei</Text>
              <Text className="text-sm text-gray-500">{tournaments?.length || 0} tornei</Text>
            </View>
            <ChevronRight size={20} color="#9ca3af" />
          </TouchableOpacity>

          <TouchableOpacity 
            onPress={() => router.push('/(tabs)/teams')}
            className="flex-row items-center p-4"
          >
            <View className="w-10 h-10 bg-blue-100 rounded-full items-center justify-center mr-3">
              <Users size={20} color="#2563eb" />
            </View>
            <View className="flex-1">
              <Text className="font-semibold text-gray-900">Le Mie Squadre</Text>
              <Text className="text-sm text-gray-500">Gestisci le squadre</Text>
            </View>
            <ChevronRight size={20} color="#9ca3af" />
          </TouchableOpacity>
        </Card>

        {/* Live Events */}
        {liveEvents.length > 0 && (
          <>
            <View className="flex-row items-center mb-3">
              <View className="w-2 h-2 bg-red-500 rounded-full mr-2 animate-pulse" />
              <Text className="text-lg font-semibold text-gray-900">Eventi Live</Text>
            </View>
            {liveEvents.map(event => (
              <TouchableOpacity 
                key={event.id}
                onPress={() => router.push(`/event/${event.id}`)}
              >
                <Card className="mb-3 p-4">
                  <View className="flex-row items-center justify-between">
                    <View className="flex-1">
                      <View className="flex-row items-center mb-1">
                        <Badge variant="danger" size="sm">LIVE</Badge>
                        <Text className="font-semibold text-gray-900 ml-2">{event.name}</Text>
                      </View>
                      <Text className="text-sm text-gray-500">{event.location}</Text>
                    </View>
                    <ChevronRight size={20} color="#9ca3af" />
                  </View>
                </Card>
              </TouchableOpacity>
            ))}
          </>
        )}

        {/* Active Tournaments */}
        {activeTournaments.length > 0 && (
          <>
            <Text className="text-lg font-semibold text-gray-900 mb-3 mt-2">
              Tornei in Corso
            </Text>
            {activeTournaments.slice(0, 3).map(tournament => (
              <TouchableOpacity 
                key={tournament.id}
                onPress={() => router.push(`/tournament/${tournament.id}`)}
              >
                <Card className="mb-3 p-4">
                  <View className="flex-row items-center justify-between">
                    <View className="flex-1">
                      <Text className="font-semibold text-gray-900">{tournament.name}</Text>
                      <Text className="text-sm text-gray-500">
                        {tournament.sport} • {tournament.format}
                      </Text>
                    </View>
                    <Badge variant="success" size="sm">In Corso</Badge>
                  </View>
                </Card>
              </TouchableOpacity>
            ))}
          </>
        )}

        {/* Crediti */}
        <Card className="mt-2 p-4">
          <View className="flex-row items-center justify-between">
            <View className="flex-row items-center">
              <View className="w-10 h-10 bg-yellow-100 rounded-full items-center justify-center mr-3">
                <Zap size={20} color="#ca8a04" />
              </View>
              <View>
                <Text className="font-semibold text-gray-900">I tuoi Crediti</Text>
                <Text className="text-2xl font-bold text-yellow-600">
                  {credits?.credits || 0}
                </Text>
              </View>
            </View>
            <TouchableOpacity 
              onPress={() => router.push('/(tabs)/profile')}
              className="bg-yellow-500 px-4 py-2 rounded-lg"
            >
              <Text className="text-white font-semibold">Acquista</Text>
            </TouchableOpacity>
          </View>
        </Card>
      </View>
    </ScrollView>
  )
}
