import React from 'react'
import { View, Text, TouchableOpacity } from 'react-native'
import { useRouter } from 'expo-router'
import { Trophy, Calendar, MapPin, Users, Crown, UserCheck } from 'lucide-react-native'
import { Card, Badge } from '@/components/ui'
import { TOURNAMENT_STATUSES } from '@/constants'
import type { Tournament } from '@/types'

interface TournamentCardProps {
  tournament: Tournament
}

export function TournamentCard({ tournament }: TournamentCardProps) {
  const router = useRouter()
  
  const status = TOURNAMENT_STATUSES[tournament.status]
  
  const getStatusVariant = () => {
    switch (tournament.status) {
      case 'draft': return 'default'
      case 'registration_open': return 'info'
      case 'in_progress': return 'success'
      case 'completed': return 'default'
      case 'cancelled': return 'danger'
      default: return 'default'
    }
  }

  return (
    <TouchableOpacity
      onPress={() => router.push(`/tournament/${tournament.id}`)}
      activeOpacity={0.7}
    >
      <Card className="mb-3">
        <View className="flex-row justify-between items-start mb-3">
          <Trophy size={24} color="#eab308" />
          <View className="flex-row items-center space-x-2">
            {tournament.isOwner && (
              <View className="flex-row items-center bg-yellow-100 px-2 py-1 rounded">
                <Crown size={12} color="#ca8a04" />
                <Text className="text-xs text-yellow-700 ml-1">Owner</Text>
              </View>
            )}
            {tournament.isCollaborator && (
              <View className="flex-row items-center bg-blue-100 px-2 py-1 rounded">
                <UserCheck size={12} color="#2563eb" />
                <Text className="text-xs text-blue-700 ml-1">Co-org</Text>
              </View>
            )}
            <Badge text={status.label} variant={getStatusVariant()} />
          </View>
        </View>
        
        <Text className="text-lg font-semibold text-gray-900 mb-2">
          {tournament.name}
        </Text>
        
        <View className="space-y-1">
          <View className="flex-row items-center">
            <Calendar size={14} color="#6b7280" />
            <Text className="text-sm text-gray-600 ml-2">
              {tournament.start_date 
                ? new Date(tournament.start_date).toLocaleDateString('it-IT')
                : 'Data da definire'}
            </Text>
          </View>
          
          <View className="flex-row items-center">
            <MapPin size={14} color="#6b7280" />
            <Text className="text-sm text-gray-600 ml-2">
              {tournament.city || 'Località da definire'}
            </Text>
          </View>
          
          <View className="flex-row items-center">
            <Users size={14} color="#6b7280" />
            <Text className="text-sm text-gray-600 ml-2">
              {tournament.max_teams} squadre max
            </Text>
          </View>
        </View>
        
        <View className="mt-3 pt-3 border-t border-gray-100">
          <Text className="text-xs text-gray-500">
            Sport: {tournament.sport?.replace(/_/g, ' ')}
          </Text>
        </View>
      </Card>
    </TouchableOpacity>
  )
}
