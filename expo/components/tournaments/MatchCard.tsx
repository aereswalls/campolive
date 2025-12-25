import React, { useState } from 'react'
import { View, Text, TouchableOpacity } from 'react-native'
import { Clock, MapPin, Plus, Minus, Check, X } from 'lucide-react-native'
import { Card } from '@/components/ui'
import type { TournamentMatch } from '@/types'

interface MatchCardProps {
  match: TournamentMatch
  canManage?: boolean
  isLive?: boolean
  onUpdateScore?: (homeScore: number, awayScore: number) => void
  onComplete?: (homeScore: number, awayScore: number) => void
}

export function MatchCard({ 
  match, 
  canManage = false, 
  isLive = false,
  onUpdateScore,
  onComplete,
}: MatchCardProps) {
  const [homeScore, setHomeScore] = useState(match.home_team_score || 0)
  const [awayScore, setAwayScore] = useState(match.away_team_score || 0)
  
  const matchTime = match.match_date ? new Date(match.match_date) : null

  const handleScoreChange = (team: 'home' | 'away', delta: number) => {
    if (team === 'home') {
      const newScore = Math.max(0, homeScore + delta)
      setHomeScore(newScore)
      onUpdateScore?.(newScore, awayScore)
    } else {
      const newScore = Math.max(0, awayScore + delta)
      setAwayScore(newScore)
      onUpdateScore?.(homeScore, newScore)
    }
  }

  return (
    <Card className={`mb-3 ${isLive ? 'border-red-500 border-2' : ''}`}>
      <View className="flex-row justify-between items-center mb-3">
        <View className="flex-row items-center">
          {isLive && (
            <View className="flex-row items-center mr-2">
              <View className="w-2 h-2 bg-red-500 rounded-full mr-1" />
              <Text className="text-xs font-medium text-red-600">LIVE</Text>
            </View>
          )}
          {match.match_round && (
            <Text className="text-sm text-gray-500">{match.match_round}</Text>
          )}
        </View>
        {matchTime && (
          <View className="flex-row items-center">
            <Clock size={12} color="#9ca3af" />
            <Text className="text-xs text-gray-500 ml-1">
              {matchTime.toLocaleTimeString('it-IT', { hour: '2-digit', minute: '2-digit' })}
            </Text>
          </View>
        )}
      </View>

      <View className="flex-row items-center justify-between">
        {/* Home Team */}
        <View className="flex-1 items-end pr-3">
          <Text className="font-semibold text-gray-900" numberOfLines={1}>
            {match.home_team?.name || 'Squadra Casa'}
          </Text>
        </View>

        {/* Score */}
        {canManage && isLive ? (
          <View className="flex-row items-center space-x-2">
            <View className="items-center">
              <TouchableOpacity 
                onPress={() => handleScoreChange('home', 1)}
                className="p-1"
              >
                <Plus size={16} color="#16a34a" />
              </TouchableOpacity>
              <Text className="text-2xl font-bold mx-2">{homeScore}</Text>
              <TouchableOpacity 
                onPress={() => handleScoreChange('home', -1)}
                className="p-1"
                disabled={homeScore === 0}
              >
                <Minus size={16} color={homeScore === 0 ? '#d1d5db' : '#ef4444'} />
              </TouchableOpacity>
            </View>
            
            <Text className="text-xl text-gray-400 mx-2">-</Text>
            
            <View className="items-center">
              <TouchableOpacity 
                onPress={() => handleScoreChange('away', 1)}
                className="p-1"
              >
                <Plus size={16} color="#16a34a" />
              </TouchableOpacity>
              <Text className="text-2xl font-bold mx-2">{awayScore}</Text>
              <TouchableOpacity 
                onPress={() => handleScoreChange('away', -1)}
                className="p-1"
                disabled={awayScore === 0}
              >
                <Minus size={16} color={awayScore === 0 ? '#d1d5db' : '#ef4444'} />
              </TouchableOpacity>
            </View>
          </View>
        ) : (
          <View className="flex-row items-center px-4">
            <Text className="text-2xl font-bold">{match.home_team_score || 0}</Text>
            <Text className="text-xl text-gray-400 mx-2">-</Text>
            <Text className="text-2xl font-bold">{match.away_team_score || 0}</Text>
          </View>
        )}

        {/* Away Team */}
        <View className="flex-1 pl-3">
          <Text className="font-semibold text-gray-900" numberOfLines={1}>
            {match.away_team?.name || 'Squadra Ospite'}
          </Text>
        </View>
      </View>

      {match.venue && (
        <View className="flex-row items-center mt-3 pt-3 border-t border-gray-100">
          <MapPin size={12} color="#9ca3af" />
          <Text className="text-xs text-gray-500 ml-1">{match.venue}</Text>
        </View>
      )}

      {canManage && isLive && onComplete && (
        <View className="flex-row space-x-2 mt-3 pt-3 border-t border-gray-100">
          <TouchableOpacity
            onPress={() => onComplete(homeScore, awayScore)}
            className="flex-1 flex-row items-center justify-center bg-green-600 py-2 rounded-lg"
          >
            <Check size={16} color="#fff" />
            <Text className="text-white font-medium ml-1">Termina</Text>
          </TouchableOpacity>
        </View>
      )}
      
      {match.is_completed && (
        <View className="mt-2 bg-gray-100 rounded px-2 py-1 self-center">
          <Text className="text-xs text-gray-600">Completata</Text>
        </View>
      )}
    </Card>
  )
}
