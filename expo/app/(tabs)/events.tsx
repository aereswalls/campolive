import React, { useState } from 'react'
import { View, Text, FlatList, TouchableOpacity, RefreshControl } from 'react-native'
import { router } from 'expo-router'
import { Plus, Calendar, Video } from 'lucide-react-native'
import { Loading, EmptyState, Button, Badge } from '@/components/ui'
import { EventCard } from '@/components/events'
import { useEvents } from '@/hooks/useEvents'

export default function EventsScreen() {
  const { events, loading, error, refetch } = useEvents()
  const [refreshing, setRefreshing] = useState(false)

  const onRefresh = async () => {
    setRefreshing(true)
    await refetch()
    setRefreshing(false)
  }

  // Conteggio eventi live
  const liveCount = events?.filter(e => e.status === 'live').length || 0

  if (loading && !refreshing) {
    return <Loading message="Caricamento eventi..." />
  }

  return (
    <View className="flex-1 bg-gray-100">
      {/* Header Actions */}
      <View className="p-4 pb-2">
        <View className="flex-row space-x-2">
          <Button
            title="Registra"
            onPress={() => router.push('/recording')}
            variant="danger"
            className="flex-1"
            icon={<Video size={20} color="#fff" />}
          />
          <Button
            title="Nuovo Evento"
            onPress={() => router.push('/event/new')}
            className="flex-1"
            icon={<Plus size={20} color="#fff" />}
          />
        </View>
        
        {liveCount > 0 && (
          <View className="flex-row items-center mt-3 bg-red-50 p-3 rounded-lg">
            <View className="w-2 h-2 bg-red-500 rounded-full mr-2 animate-pulse" />
            <Text className="text-red-700 font-medium">
              {liveCount} {liveCount === 1 ? 'evento' : 'eventi'} in diretta
            </Text>
          </View>
        )}
      </View>

      {/* Events List */}
      <FlatList
        data={events}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <View className="px-4">
            <EventCard
              event={item}
              onPress={() => router.push(`/event/${item.id}`)}
            />
          </View>
        )}
        contentContainerStyle={{ paddingBottom: 100 }}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        ListEmptyComponent={
          <EmptyState
            icon={<Calendar size={48} color="#d1d5db" />}
            title="Nessun evento"
            description="Crea il tuo primo evento o avvia una registrazione."
            action={
              <View className="space-y-2">
                <Button
                  title="Avvia Registrazione"
                  onPress={() => router.push('/recording')}
                  variant="danger"
                  size="sm"
                />
                <Button
                  title="Crea Evento"
                  onPress={() => router.push('/event/new')}
                  size="sm"
                  variant="outline"
                />
              </View>
            }
          />
        }
      />
    </View>
  )
}
