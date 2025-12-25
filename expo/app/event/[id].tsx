import React, { useState, useEffect } from 'react'
import { View, Text, ScrollView, TouchableOpacity, Alert, RefreshControl } from 'react-native'
import { useLocalSearchParams, router, Stack } from 'expo-router'
import { 
  Calendar, 
  MapPin, 
  Clock,
  Video,
  Play,
  Edit,
  ChevronRight,
  Users,
  Zap
} from 'lucide-react-native'
import { Card, Badge, Button, Loading, EmptyState } from '@/components/ui'
import { useEvents } from '@/hooks/useEvents'
import { EVENT_TYPES } from '@/constants'

export default function EventDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>()
  const { events, loading, refetch, updateStatus } = useEvents()
  const [refreshing, setRefreshing] = useState(false)

  const event = events?.find(e => e.id === id)

  const onRefresh = async () => {
    setRefreshing(true)
    await refetch()
    setRefreshing(false)
  }

  if (loading) {
    return <Loading message="Caricamento evento..." />
  }

  if (!event) {
    return (
      <EmptyState
        icon={<Calendar size={48} color="#d1d5db" />}
        title="Evento non trovato"
        description="L'evento richiesto non esiste."
        action={
          <Button title="Torna agli Eventi" onPress={() => router.back()} />
        }
      />
    )
  }

  const eventType = EVENT_TYPES.find(t => t.value === event.event_type)

  const statusColors: Record<string, 'info' | 'success' | 'warning' | 'danger'> = {
    'draft': 'info',
    'scheduled': 'warning',
    'live': 'danger',
    'completed': 'success',
    'cancelled': 'info',
  }

  const statusLabels: Record<string, string> = {
    'draft': 'Bozza',
    'scheduled': 'Programmato',
    'live': '🔴 LIVE',
    'completed': 'Completato',
    'cancelled': 'Annullato',
  }

  const handleStartLive = () => {
    Alert.alert(
      'Avvia Diretta',
      'Vuoi avviare la diretta per questo evento?',
      [
        { text: 'Annulla', style: 'cancel' },
        {
          text: 'Avvia',
          onPress: async () => {
            await updateStatus(event.id, 'live')
            router.push('/recording')
          }
        }
      ]
    )
  }

  const handleEndLive = () => {
    Alert.alert(
      'Termina Diretta',
      'Vuoi terminare la diretta?',
      [
        { text: 'Annulla', style: 'cancel' },
        {
          text: 'Termina',
          style: 'destructive',
          onPress: () => updateStatus(event.id, 'completed')
        }
      ]
    )
  }

  return (
    <>
      <Stack.Screen 
        options={{ 
          title: event.name,
          headerRight: () => (
            <TouchableOpacity 
              onPress={() => router.push(`/event/${id}/edit`)}
              className="mr-4"
            >
              <Edit size={20} color="#fff" />
            </TouchableOpacity>
          )
        }} 
      />
      
      <ScrollView 
        className="flex-1 bg-gray-100"
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {/* Header */}
        <View className={`p-6 pb-8 ${event.status === 'live' ? 'bg-red-600' : 'bg-purple-600'}`}>
          <View className="flex-row items-center justify-between mb-4">
            <Badge 
              variant={statusColors[event.status]} 
              size="lg"
            >
              {statusLabels[event.status]}
            </Badge>
            {eventType && (
              <Badge variant="info">{eventType.label}</Badge>
            )}
          </View>
          
          <Text className="text-white text-2xl font-bold">{event.name}</Text>
          
          <View className="flex-row flex-wrap mt-4 gap-4">
            {event.date && (
              <View className="flex-row items-center">
                <Calendar size={14} color="#fff" />
                <Text className="text-white/90 ml-1 text-sm">
                  {new Date(event.date).toLocaleDateString('it-IT')}
                </Text>
              </View>
            )}
            {event.time && (
              <View className="flex-row items-center">
                <Clock size={14} color="#fff" />
                <Text className="text-white/90 ml-1 text-sm">{event.time}</Text>
              </View>
            )}
            {event.location && (
              <View className="flex-row items-center">
                <MapPin size={14} color="#fff" />
                <Text className="text-white/90 ml-1 text-sm">{event.location}</Text>
              </View>
            )}
          </View>
        </View>

        <View className="p-4 -mt-4">
          {/* Live Controls */}
          {event.status !== 'completed' && event.status !== 'cancelled' && (
            <Card className="mb-4 p-4">
              {event.status === 'live' ? (
                <View>
                  <View className="flex-row items-center mb-4">
                    <View className="w-3 h-3 bg-red-500 rounded-full mr-2 animate-pulse" />
                    <Text className="text-red-600 font-semibold">Diretta in corso</Text>
                  </View>
                  <View className="flex-row space-x-2">
                    <Button
                      title="Apri Camera"
                      onPress={() => router.push('/recording')}
                      icon={<Video size={20} color="#fff" />}
                      className="flex-1"
                    />
                    <Button
                      title="Termina"
                      variant="danger"
                      onPress={handleEndLive}
                      className="flex-1"
                    />
                  </View>
                </View>
              ) : (
                <Button
                  title="Avvia Diretta"
                  variant="danger"
                  onPress={handleStartLive}
                  icon={<Play size={20} color="#fff" />}
                />
              )}
            </Card>
          )}

          {/* Description */}
          {event.description && (
            <Card className="mb-4 p-4">
              <Text className="text-lg font-semibold text-gray-900 mb-2">Descrizione</Text>
              <Text className="text-gray-600">{event.description}</Text>
            </Card>
          )}

          {/* Stats */}
          <Card className="mb-4">
            <View className="flex-row divide-x divide-gray-100">
              <View className="flex-1 items-center py-4">
                <Text className="text-2xl font-bold text-gray-900">0</Text>
                <Text className="text-sm text-gray-500">Spettatori</Text>
              </View>
              <View className="flex-1 items-center py-4">
                <Text className="text-2xl font-bold text-gray-900">0</Text>
                <Text className="text-sm text-gray-500">Highlights</Text>
              </View>
              <View className="flex-1 items-center py-4">
                <Text className="text-2xl font-bold text-gray-900">0</Text>
                <Text className="text-sm text-gray-500">Durata (min)</Text>
              </View>
            </View>
          </Card>

          {/* Highlights Section */}
          <Card className="mb-4">
            <TouchableOpacity 
              className="flex-row items-center p-4"
              onPress={() => router.push(`/event/${id}/highlights`)}
            >
              <View className="w-10 h-10 bg-yellow-100 rounded-full items-center justify-center mr-3">
                <Zap size={20} color="#ca8a04" />
              </View>
              <View className="flex-1">
                <Text className="font-semibold text-gray-900">Highlights</Text>
                <Text className="text-sm text-gray-500">
                  Visualizza e gestisci gli highlights
                </Text>
              </View>
              <ChevronRight size={20} color="#9ca3af" />
            </TouchableOpacity>
          </Card>

          {/* Related Tournament */}
          {event.tournament && (
            <Card className="mb-4">
              <TouchableOpacity 
                className="flex-row items-center p-4"
                onPress={() => router.push(`/tournament/${event.tournament.id}`)}
              >
                <View className="w-10 h-10 bg-green-100 rounded-full items-center justify-center mr-3">
                  <Users size={20} color="#16a34a" />
                </View>
                <View className="flex-1">
                  <Text className="font-semibold text-gray-900">Torneo Associato</Text>
                  <Text className="text-sm text-gray-500">
                    {event.tournament.name}
                  </Text>
                </View>
                <ChevronRight size={20} color="#9ca3af" />
              </TouchableOpacity>
            </Card>
          )}
        </View>
      </ScrollView>
    </>
  )
}
