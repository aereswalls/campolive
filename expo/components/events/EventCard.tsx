import React from 'react'
import { View, Text, TouchableOpacity } from 'react-native'
import { useRouter } from 'expo-router'
import { Calendar, MapPin, Video, Clock } from 'lucide-react-native'
import { Card, Badge } from '@/components/ui'
import { EVENT_STATUSES } from '@/constants'
import type { Event } from '@/types'

interface EventCardProps {
  event: Event
}

export function EventCard({ event }: EventCardProps) {
  const router = useRouter()
  
  const status = EVENT_STATUSES[event.status]
  
  const getStatusVariant = (): 'default' | 'success' | 'warning' | 'danger' | 'info' => {
    switch (event.status) {
      case 'scheduled': return 'info'
      case 'live': return 'danger'
      case 'completed': return 'success'
      case 'cancelled': return 'default'
      default: return 'default'
    }
  }

  const scheduledDate = event.scheduled_at ? new Date(event.scheduled_at) : null

  return (
    <TouchableOpacity
      onPress={() => router.push(`/event/${event.id}`)}
      activeOpacity={0.7}
    >
      <Card className={`mb-3 ${event.status === 'live' ? 'border-red-500 border-2' : ''}`}>
        <View className="flex-row justify-between items-start mb-3">
          <View className="flex-row items-center">
            {event.status === 'live' && (
              <View className="flex-row items-center mr-2">
                <View className="w-2 h-2 bg-red-500 rounded-full mr-1 animate-pulse" />
                <Text className="text-xs font-bold text-red-600">LIVE</Text>
              </View>
            )}
            <Video size={20} color={event.status === 'live' ? '#ef4444' : '#6b7280'} />
          </View>
          <Badge text={status.label} variant={getStatusVariant()} />
        </View>
        
        <Text className="text-lg font-semibold text-gray-900 mb-2">
          {event.title}
        </Text>
        
        {event.home_team && event.away_team && (
          <View className="flex-row items-center justify-center py-2 bg-gray-50 rounded-lg mb-3">
            <Text className="font-medium text-gray-900">{event.home_team.name}</Text>
            <Text className="mx-3 text-gray-400">vs</Text>
            <Text className="font-medium text-gray-900">{event.away_team.name}</Text>
          </View>
        )}
        
        <View className="space-y-1">
          {scheduledDate && (
            <View className="flex-row items-center">
              <Calendar size={14} color="#6b7280" />
              <Text className="text-sm text-gray-600 ml-2">
                {scheduledDate.toLocaleDateString('it-IT')}
              </Text>
              <Clock size={14} color="#6b7280" className="ml-3" />
              <Text className="text-sm text-gray-600 ml-1">
                {scheduledDate.toLocaleTimeString('it-IT', { hour: '2-digit', minute: '2-digit' })}
              </Text>
            </View>
          )}
          
          {event.venue_name && (
            <View className="flex-row items-center">
              <MapPin size={14} color="#6b7280" />
              <Text className="text-sm text-gray-600 ml-2">{event.venue_name}</Text>
            </View>
          )}
        </View>
      </Card>
    </TouchableOpacity>
  )
}
