import React from 'react'
import { View, Text, TouchableOpacity } from 'react-native'
import { useRouter } from 'expo-router'
import { Users, MapPin, Shield } from 'lucide-react-native'
import { Card, Badge } from '@/components/ui'
import type { Team } from '@/types'

interface TeamCardProps {
  team: Team
}

export function TeamCard({ team }: TeamCardProps) {
  const router = useRouter()

  const getRoleLabel = () => {
    switch (team.role) {
      case 'owner': return 'Proprietario'
      case 'manager': return 'Manager'
      case 'player': return 'Giocatore'
      default: return ''
    }
  }

  const getRoleVariant = (): 'success' | 'info' | 'default' => {
    switch (team.role) {
      case 'owner': return 'success'
      case 'manager': return 'info'
      default: return 'default'
    }
  }

  return (
    <TouchableOpacity
      onPress={() => router.push(`/team/${team.id}`)}
      activeOpacity={0.7}
    >
      <Card className="mb-3">
        <View className="flex-row justify-between items-start mb-3">
          <View 
            className="w-12 h-12 rounded-full items-center justify-center"
            style={{ backgroundColor: team.primary_color || '#16a34a' }}
          >
            <Shield size={24} color="#fff" />
          </View>
          {team.role && (
            <Badge text={getRoleLabel()} variant={getRoleVariant()} />
          )}
        </View>
        
        <Text className="text-lg font-semibold text-gray-900 mb-1">
          {team.name}
        </Text>
        
        {team.city && (
          <View className="flex-row items-center mb-2">
            <MapPin size={14} color="#6b7280" />
            <Text className="text-sm text-gray-600 ml-1">
              {team.city}{team.province ? `, ${team.province}` : ''}
            </Text>
          </View>
        )}
        
        <View className="mt-2 pt-2 border-t border-gray-100 flex-row justify-between">
          <Text className="text-xs text-gray-500">
            {team.sport_type?.replace(/_/g, ' ')}
          </Text>
          <Text className="text-xs text-gray-500">
            {team.level}
          </Text>
        </View>
      </Card>
    </TouchableOpacity>
  )
}
