import React, { useState } from 'react'
import { View, Text, FlatList, TouchableOpacity, RefreshControl } from 'react-native'
import { router } from 'expo-router'
import { Plus, Users } from 'lucide-react-native'
import { Loading, EmptyState, Button } from '@/components/ui'
import { TeamCard } from '@/components/teams'
import { useTeams } from '@/hooks/useTeams'

export default function TeamsScreen() {
  const { teams, loading, error, refetch } = useTeams()
  const [refreshing, setRefreshing] = useState(false)

  const onRefresh = async () => {
    setRefreshing(true)
    await refetch()
    setRefreshing(false)
  }

  if (loading && !refreshing) {
    return <Loading message="Caricamento squadre..." />
  }

  return (
    <View className="flex-1 bg-gray-100">
      {/* Header Actions */}
      <View className="p-4 pb-2">
        <Button
          title="Nuova Squadra"
          onPress={() => router.push('/team/new')}
          icon={<Plus size={20} color="#fff" />}
        />
      </View>

      {/* Teams List */}
      <FlatList
        data={teams}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <View className="px-4">
            <TeamCard
              team={item}
              onPress={() => router.push(`/team/${item.id}`)}
            />
          </View>
        )}
        contentContainerStyle={{ paddingBottom: 100 }}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        ListEmptyComponent={
          <EmptyState
            icon={<Users size={48} color="#d1d5db" />}
            title="Nessuna squadra"
            description="Crea la tua prima squadra per iniziare."
            action={
              <Button
                title="Crea Squadra"
                onPress={() => router.push('/team/new')}
                size="sm"
              />
            }
          />
        }
      />
    </View>
  )
}
