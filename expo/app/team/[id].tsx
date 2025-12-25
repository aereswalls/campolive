import React, { useState, useEffect } from 'react'
import { View, Text, ScrollView, TouchableOpacity, Alert, RefreshControl } from 'react-native'
import { useLocalSearchParams, router, Stack } from 'expo-router'
import { 
  Users, 
  MapPin, 
  Star,
  Trophy,
  Edit,
  ChevronRight,
  Shield
} from 'lucide-react-native'
import { Card, Badge, Button, Loading, EmptyState } from '@/components/ui'
import { useTeams } from '@/hooks/useTeams'
import { TEAM_LEVELS } from '@/constants'

export default function TeamDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>()
  const { teams, loading, refetch } = useTeams()
  const [refreshing, setRefreshing] = useState(false)

  const team = teams?.find(t => t.id === id)

  const onRefresh = async () => {
    setRefreshing(true)
    await refetch()
    setRefreshing(false)
  }

  if (loading) {
    return <Loading message="Caricamento squadra..." />
  }

  if (!team) {
    return (
      <EmptyState
        icon={<Users size={48} color="#d1d5db" />}
        title="Squadra non trovata"
        description="La squadra richiesta non esiste."
        action={
          <Button title="Torna alle Squadre" onPress={() => router.back()} />
        }
      />
    )
  }

  const levelInfo = TEAM_LEVELS.find(l => l.value === team.level)

  return (
    <>
      <Stack.Screen 
        options={{ 
          title: team.name,
          headerRight: () => (
            <TouchableOpacity 
              onPress={() => router.push(`/team/${id}/edit`)}
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
        <View className="bg-blue-600 p-6 pb-8 items-center">
          <View className="w-24 h-24 bg-white rounded-full items-center justify-center mb-4">
            {team.logo_url ? (
              <Text className="text-4xl">⚽</Text>
            ) : (
              <Shield size={48} color="#2563eb" />
            )}
          </View>
          <Text className="text-white text-2xl font-bold text-center">{team.name}</Text>
          {team.city && (
            <View className="flex-row items-center mt-2">
              <MapPin size={14} color="#fff" />
              <Text className="text-white/90 ml-1">{team.city}</Text>
            </View>
          )}
          {levelInfo && (
            <Badge variant="info" className="mt-2">
              {levelInfo.label}
            </Badge>
          )}
        </View>

        <View className="p-4 -mt-4">
          {/* Stats */}
          <Card className="mb-4">
            <View className="flex-row divide-x divide-gray-100">
              <View className="flex-1 items-center py-4">
                <Text className="text-2xl font-bold text-gray-900">
                  {team.players?.length || 0}
                </Text>
                <Text className="text-sm text-gray-500">Giocatori</Text>
              </View>
              <View className="flex-1 items-center py-4">
                <Text className="text-2xl font-bold text-gray-900">0</Text>
                <Text className="text-sm text-gray-500">Tornei</Text>
              </View>
              <View className="flex-1 items-center py-4">
                <Text className="text-2xl font-bold text-gray-900">0</Text>
                <Text className="text-sm text-gray-500">Vittorie</Text>
              </View>
            </View>
          </Card>

          {/* Description */}
          {team.description && (
            <Card className="mb-4 p-4">
              <Text className="text-lg font-semibold text-gray-900 mb-2">Descrizione</Text>
              <Text className="text-gray-600">{team.description}</Text>
            </Card>
          )}

          {/* Actions */}
          <Card className="mb-4">
            <TouchableOpacity className="flex-row items-center p-4 border-b border-gray-100">
              <View className="w-10 h-10 bg-green-100 rounded-full items-center justify-center mr-3">
                <Users size={20} color="#16a34a" />
              </View>
              <View className="flex-1">
                <Text className="font-semibold text-gray-900">Gestisci Giocatori</Text>
                <Text className="text-sm text-gray-500">
                  {team.players?.length || 0} giocatori in rosa
                </Text>
              </View>
              <ChevronRight size={20} color="#9ca3af" />
            </TouchableOpacity>

            <TouchableOpacity className="flex-row items-center p-4">
              <View className="w-10 h-10 bg-yellow-100 rounded-full items-center justify-center mr-3">
                <Trophy size={20} color="#ca8a04" />
              </View>
              <View className="flex-1">
                <Text className="font-semibold text-gray-900">Tornei Partecipati</Text>
                <Text className="text-sm text-gray-500">
                  Visualizza storico tornei
                </Text>
              </View>
              <ChevronRight size={20} color="#9ca3af" />
            </TouchableOpacity>
          </Card>

          {/* Players Preview */}
          {team.players && team.players.length > 0 && (
            <>
              <View className="flex-row justify-between items-center mb-3">
                <Text className="text-lg font-semibold text-gray-900">Giocatori</Text>
                <TouchableOpacity>
                  <Text className="text-green-600 font-medium">Vedi tutti</Text>
                </TouchableOpacity>
              </View>
              
              {team.players.slice(0, 5).map((player: any) => (
                <Card key={player.id} className="mb-2 p-4">
                  <View className="flex-row items-center">
                    <View className="w-10 h-10 bg-gray-100 rounded-full items-center justify-center mr-3">
                      <Text className="text-lg font-bold text-gray-600">
                        {player.jersey_number || '?'}
                      </Text>
                    </View>
                    <View className="flex-1">
                      <Text className="font-semibold text-gray-900">
                        {player.first_name} {player.last_name}
                      </Text>
                      {player.position && (
                        <Text className="text-sm text-gray-500">{player.position}</Text>
                      )}
                    </View>
                  </View>
                </Card>
              ))}
            </>
          )}
        </View>
      </ScrollView>
    </>
  )
}
