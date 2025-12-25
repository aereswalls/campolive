import React, { useState, useEffect } from 'react'
import { View, Text, ScrollView, TouchableOpacity, Alert, RefreshControl } from 'react-native'
import { useLocalSearchParams, router, Stack } from 'expo-router'
import { 
  Trophy, 
  Calendar, 
  MapPin, 
  Users, 
  Settings,
  Play,
  BarChart3,
  List,
  Edit,
  ChevronRight
} from 'lucide-react-native'
import { Card, Badge, Button, Loading, EmptyState } from '@/components/ui'
import { MatchCard, StandingsTable } from '@/components/tournaments'
import { useTournament } from '@/hooks/useTournaments'
import { useMatches } from '@/hooks/useMatches'
import { SPORTS } from '@/constants'

export default function TournamentDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>()
  const { tournament, permissions, loading, error, refetch } = useTournament(id || '')
  const { matches, standings, loading: loadingMatches, refetch: refetchMatches, updateScore } = useMatches(id || '')
  const [refreshing, setRefreshing] = useState(false)
  const [activeTab, setActiveTab] = useState<'matches' | 'standings' | 'teams'>('matches')

  const onRefresh = async () => {
    setRefreshing(true)
    await Promise.all([refetch(), refetchMatches()])
    setRefreshing(false)
  }

  if (loading) {
    return <Loading message="Caricamento torneo..." />
  }

  if (!tournament) {
    return (
      <EmptyState
        icon={<Trophy size={48} color="#d1d5db" />}
        title="Torneo non trovato"
        description="Il torneo richiesto non esiste o non hai i permessi per visualizzarlo."
        action={
          <Button title="Torna ai Tornei" onPress={() => router.back()} />
        }
      />
    )
  }

  const sportEmoji = SPORTS.find(s => s.value === tournament.sport)?.emoji || '⚽'

  const statusColors: Record<string, 'info' | 'success' | 'warning' | 'danger'> = {
    'draft': 'info',
    'registration_open': 'warning',
    'in_progress': 'success',
    'completed': 'danger',
  }

  const statusLabels: Record<string, string> = {
    'draft': 'Bozza',
    'registration_open': 'Iscrizioni Aperte',
    'in_progress': 'In Corso',
    'completed': 'Completato',
  }

  const tabs = [
    { id: 'matches', label: 'Partite', icon: Play },
    { id: 'standings', label: 'Classifica', icon: BarChart3 },
    { id: 'teams', label: 'Squadre', icon: Users },
  ]

  // Prossima partita
  const nextMatch = matches?.find(m => !m.is_completed)

  return (
    <>
      <Stack.Screen 
        options={{ 
          title: tournament.name,
          headerRight: () => permissions?.canEdit ? (
            <TouchableOpacity 
              onPress={() => router.push(`/tournament/${id}/edit`)}
              className="mr-4"
            >
              <Edit size={20} color="#fff" />
            </TouchableOpacity>
          ) : null
        }} 
      />
      
      <ScrollView 
        className="flex-1 bg-gray-100"
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {/* Header */}
        <View className="bg-green-600 p-6 pb-8">
          <View className="flex-row items-center">
            <Text className="text-4xl mr-3">{sportEmoji}</Text>
            <View className="flex-1">
              <Text className="text-white text-xl font-bold">{tournament.name}</Text>
              <Badge 
                variant={statusColors[tournament.status]} 
                size="sm"
                className="mt-1 self-start"
              >
                {statusLabels[tournament.status]}
              </Badge>
            </View>
          </View>

          <View className="flex-row mt-4 space-x-4">
            {tournament.start_date && (
              <View className="flex-row items-center">
                <Calendar size={14} color="#fff" />
                <Text className="text-white/90 ml-1 text-sm">
                  {new Date(tournament.start_date).toLocaleDateString('it-IT')}
                </Text>
              </View>
            )}
            {tournament.location && (
              <View className="flex-row items-center">
                <MapPin size={14} color="#fff" />
                <Text className="text-white/90 ml-1 text-sm">{tournament.location}</Text>
              </View>
            )}
          </View>
        </View>

        <View className="p-4 -mt-4">
          {/* Quick Stats */}
          <Card className="mb-4">
            <View className="flex-row divide-x divide-gray-100">
              <View className="flex-1 items-center py-4">
                <Text className="text-2xl font-bold text-gray-900">
                  {tournament.tournament_teams?.length || 0}
                </Text>
                <Text className="text-sm text-gray-500">Squadre</Text>
              </View>
              <View className="flex-1 items-center py-4">
                <Text className="text-2xl font-bold text-gray-900">
                  {matches?.filter(m => m.is_completed).length || 0}
                </Text>
                <Text className="text-sm text-gray-500">Partite Giocate</Text>
              </View>
              <View className="flex-1 items-center py-4">
                <Text className="text-2xl font-bold text-gray-900">
                  {matches?.filter(m => !m.is_completed).length || 0}
                </Text>
                <Text className="text-sm text-gray-500">Da Giocare</Text>
              </View>
            </View>
          </Card>

          {/* Next Match */}
          {nextMatch && (
            <View className="mb-4">
              <Text className="text-lg font-semibold text-gray-900 mb-2">Prossima Partita</Text>
              <MatchCard
                match={nextMatch}
                canEdit={permissions?.canManageMatches}
                onScoreUpdate={(homeScore, awayScore) => {
                  updateScore(nextMatch.id, homeScore, awayScore)
                }}
              />
            </View>
          )}

          {/* Tabs */}
          <View className="flex-row mb-4 bg-gray-200 rounded-lg p-1">
            {tabs.map(tab => (
              <TouchableOpacity
                key={tab.id}
                onPress={() => setActiveTab(tab.id as any)}
                className={`flex-1 flex-row items-center justify-center py-2 rounded-md ${
                  activeTab === tab.id ? 'bg-white' : ''
                }`}
              >
                <tab.icon 
                  size={16} 
                  color={activeTab === tab.id ? '#16a34a' : '#9ca3af'} 
                />
                <Text className={`ml-1 text-sm font-medium ${
                  activeTab === tab.id ? 'text-green-600' : 'text-gray-500'
                }`}>
                  {tab.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          {/* Tab Content */}
          {activeTab === 'matches' && (
            <View>
              {loadingMatches ? (
                <Loading message="Caricamento partite..." />
              ) : matches && matches.length > 0 ? (
                matches.map(match => (
                  <MatchCard
                    key={match.id}
                    match={match}
                    canEdit={permissions?.canManageMatches}
                    onScoreUpdate={(home, away) => updateScore(match.id, home, away)}
                  />
                ))
              ) : (
                <EmptyState
                  icon={<Play size={48} color="#d1d5db" />}
                  title="Nessuna partita"
                  description="Le partite verranno generate dopo l'aggiunta delle squadre."
                />
              )}
            </View>
          )}

          {activeTab === 'standings' && (
            <View>
              {standings && standings.length > 0 ? (
                <StandingsTable standings={standings} />
              ) : (
                <EmptyState
                  icon={<BarChart3 size={48} color="#d1d5db" />}
                  title="Classifica non disponibile"
                  description="La classifica sarà disponibile dopo le prime partite."
                />
              )}
            </View>
          )}

          {activeTab === 'teams' && (
            <View>
              {tournament.tournament_teams && tournament.tournament_teams.length > 0 ? (
                tournament.tournament_teams.map((tt: any) => (
                  <Card key={tt.id} className="mb-2 p-4">
                    <View className="flex-row items-center">
                      <View className="w-10 h-10 bg-gray-100 rounded-full items-center justify-center mr-3">
                        <Users size={20} color="#6b7280" />
                      </View>
                      <View className="flex-1">
                        <Text className="font-semibold text-gray-900">
                          {tt.teams?.name || 'Squadra'}
                        </Text>
                        <Text className="text-sm text-gray-500">
                          Aggiunta il {new Date(tt.added_at).toLocaleDateString('it-IT')}
                        </Text>
                      </View>
                      <ChevronRight size={20} color="#9ca3af" />
                    </View>
                  </Card>
                ))
              ) : (
                <EmptyState
                  icon={<Users size={48} color="#d1d5db" />}
                  title="Nessuna squadra"
                  description="Aggiungi squadre al torneo per iniziare."
                  action={
                    permissions?.canManageTeams ? (
                      <Button 
                        title="Aggiungi Squadra" 
                        size="sm"
                        onPress={() => {}}
                      />
                    ) : undefined
                  }
                />
              )}
            </View>
          )}
        </View>
      </ScrollView>
    </>
  )
}
