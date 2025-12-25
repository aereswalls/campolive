import { useState, useEffect, useCallback } from 'react'
import { supabase } from '@/lib/supabase'
import { useAuthStore } from '@/store/authStore'
import type { TournamentMatch, TournamentTeam } from '@/types'

export function useMatches(tournamentId: string) {
  const [matches, setMatches] = useState<TournamentMatch[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchMatches = useCallback(async () => {
    if (!tournamentId) {
      setLoading(false)
      return
    }

    setLoading(true)
    setError(null)

    try {
      const { data, error: fetchError } = await supabase
        .from('tournament_matches')
        .select(`
          *,
          home_team:teams!tournament_matches_home_team_id_fkey(*),
          away_team:teams!tournament_matches_away_team_id_fkey(*)
        `)
        .eq('tournament_id', tournamentId)
        .order('match_date', { ascending: true })

      if (fetchError) throw fetchError

      setMatches(data || [])
    } catch (err: any) {
      console.error('Error fetching matches:', err)
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }, [tournamentId])

  useEffect(() => {
    fetchMatches()
  }, [fetchMatches])

  const updateScore = async (matchId: string, homeScore: number, awayScore: number) => {
    try {
      const { error: updateError } = await supabase
        .from('tournament_matches')
        .update({
          home_team_score: homeScore,
          away_team_score: awayScore,
        })
        .eq('id', matchId)

      if (updateError) throw updateError

      await fetchMatches()
      return {}
    } catch (err: any) {
      return { error: err.message }
    }
  }

  const completeMatch = async (matchId: string, homeScore: number, awayScore: number) => {
    try {
      const { error: updateError } = await supabase
        .from('tournament_matches')
        .update({
          home_team_score: homeScore,
          away_team_score: awayScore,
          is_completed: true,
        })
        .eq('id', matchId)

      if (updateError) throw updateError

      await fetchMatches()
      return {}
    } catch (err: any) {
      return { error: err.message }
    }
  }

  return {
    matches,
    loading,
    error,
    refresh: fetchMatches,
    updateScore,
    completeMatch,
    upcomingMatches: matches.filter(m => !m.is_completed),
    completedMatches: matches.filter(m => m.is_completed),
    todayMatches: matches.filter(m => {
      if (!m.match_date) return false
      const matchDate = new Date(m.match_date).toDateString()
      const today = new Date().toDateString()
      return matchDate === today
    }),
  }
}

export function useStandings(tournamentId: string) {
  const [standings, setStandings] = useState<TournamentTeam[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchStandings = useCallback(async () => {
    if (!tournamentId) {
      setLoading(false)
      return
    }

    setLoading(true)
    setError(null)

    try {
      const { data, error: fetchError } = await supabase
        .from('tournament_teams')
        .select(`
          *,
          team:teams(*)
        `)
        .eq('tournament_id', tournamentId)
        .eq('registration_status', 'approved')
        .order('points', { ascending: false })
        .order('goals_for', { ascending: false })

      if (fetchError) throw fetchError

      setStandings(data || [])
    } catch (err: any) {
      console.error('Error fetching standings:', err)
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }, [tournamentId])

  useEffect(() => {
    fetchStandings()
  }, [fetchStandings])

  return {
    standings,
    loading,
    error,
    refresh: fetchStandings,
  }
}
