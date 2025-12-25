import React, { useState } from 'react'
import { View, Text, FlatList, TouchableOpacity, RefreshControl } from 'react-native'
import { router } from 'expo-router'
import { Plus, Trophy } from 'lucide-react-native'
import { Loading, EmptyState, Button } from '@/components/ui'
import { TournamentCard } from '@/components/tournaments'
import { useTournaments } from '@/hooks/useTournaments'

export default function TournamentsScreen() {
  const { tournaments, loading, error, refetch } = useTournaments()
  const [refreshing, setRefreshing] = useState(false)

  const onRefresh = async () => {
    setRefreshing(true)
    await refetch()
    setRefreshing(false)
  }

  if (loading && !refreshing) {
    return <Loading message="Caricamento tornei..." />
  }

  return (
    <View className="flex-1 bg-gray-100">
      {/* Header Actions */}
      <View className="p-4 pb-2">
        <Button
          title="Nuovo Torneo"
          onPress={() => router.push('/tournament/new')}
          icon={<Plus size={20} color="#fff" />}
        />
      </View>

      {/* Tournament List */}
      <FlatList
        data={tournaments}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <View className="px-4">
            <TournamentCard
              tournament={item}
              onPress={() => router.push(`/tournament/${item.id}`)}
            />
          </View>
        )}
        contentContainerStyle={{ paddingBottom: 100 }}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        ListEmptyComponent={
          <EmptyState
            icon={<Trophy size={48} color="#d1d5db" />}
            title="Nessun torneo"
            description="Crea il tuo primo torneo per iniziare a gestire le competizioni."
            action={
              <Button
                title="Crea Torneo"
                onPress={() => router.push('/tournament/new')}
                size="sm"
              />
            }
          />
        }
      />
    </View>
  )
}
