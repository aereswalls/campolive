import React from 'react'
import { View, Text, ScrollView } from 'react-native'
import { Card } from '@/components/ui'
import type { TournamentTeam } from '@/types'

interface StandingsTableProps {
  standings: TournamentTeam[]
}

export function StandingsTable({ standings }: StandingsTableProps) {
  const getGoalDifference = (team: TournamentTeam) => {
    return (team.goals_for || 0) - (team.goals_against || 0)
  }

  return (
    <Card>
      <ScrollView horizontal showsHorizontalScrollIndicator={false}>
        <View>
          {/* Header */}
          <View className="flex-row bg-gray-50 py-2 px-2 rounded-t-lg">
            <Text className="w-8 text-xs font-medium text-gray-500 text-center">#</Text>
            <Text className="w-32 text-xs font-medium text-gray-500">Squadra</Text>
            <Text className="w-8 text-xs font-medium text-gray-500 text-center">P</Text>
            <Text className="w-8 text-xs font-medium text-gray-500 text-center">V</Text>
            <Text className="w-8 text-xs font-medium text-gray-500 text-center">N</Text>
            <Text className="w-8 text-xs font-medium text-gray-500 text-center">S</Text>
            <Text className="w-10 text-xs font-medium text-gray-500 text-center">GF</Text>
            <Text className="w-10 text-xs font-medium text-gray-500 text-center">GS</Text>
            <Text className="w-10 text-xs font-medium text-gray-500 text-center">DR</Text>
            <Text className="w-10 text-xs font-medium text-gray-500 text-center">Pts</Text>
          </View>
          
          {/* Rows */}
          {standings.map((item, index) => {
            const diff = getGoalDifference(item)
            const isTop3 = index < 3 && item.matches_played > 0
            
            return (
              <View 
                key={item.id}
                className={`flex-row py-3 px-2 border-b border-gray-100 ${isTop3 ? 'bg-green-50' : ''}`}
              >
                <Text className={`w-8 text-center font-bold ${
                  index === 0 ? 'text-yellow-500' :
                  index === 1 ? 'text-gray-400' :
                  index === 2 ? 'text-orange-600' :
                  'text-gray-700'
                }`}>
                  {index + 1}
                </Text>
                <Text className="w-32 font-medium text-gray-900" numberOfLines={1}>
                  {item.team?.name || 'Squadra'}
                </Text>
                <Text className="w-8 text-center text-gray-600">{item.matches_played || 0}</Text>
                <Text className="w-8 text-center text-gray-600">{item.wins || 0}</Text>
                <Text className="w-8 text-center text-gray-600">{item.draws || 0}</Text>
                <Text className="w-8 text-center text-gray-600">{item.losses || 0}</Text>
                <Text className="w-10 text-center text-gray-600">{item.goals_for || 0}</Text>
                <Text className="w-10 text-center text-gray-600">{item.goals_against || 0}</Text>
                <Text className={`w-10 text-center ${diff > 0 ? 'text-green-600' : diff < 0 ? 'text-red-600' : 'text-gray-600'}`}>
                  {diff > 0 ? `+${diff}` : diff}
                </Text>
                <Text className="w-10 text-center font-bold text-gray-900">{item.points || 0}</Text>
              </View>
            )
          })}
        </View>
      </ScrollView>
    </Card>
  )
}
