import { useState, useEffect, useCallback } from 'react'
import { supabase } from '@/lib/supabase'
import { useAuthStore } from '@/store/authStore'
import type { Tournament } from '@/types'

export function useTournaments() {
  const { user } = useAuthStore()
  const [tournaments, setTournaments] = useState<Tournament[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchTournaments = useCallback(async () => {
    if (!user) {
      setTournaments([])
      setLoading(false)
      return
    }

    setLoading(true)
    setError(null)

    try {
      // Tornei dove sono owner
      const { data: ownTournaments, error: ownError } = await supabase
        .from('tournaments')
        .select('*')
        .eq('created_by', user.id)
        .order('created_at', { ascending: false })

      if (ownError) throw ownError

      // Tornei dove sono collaboratore
      const { data: collaborations } = await supabase
        .from('tournament_collaborators')
        .select('tournament_id')
        .eq('user_id', user.id)
        .eq('status', 'accepted')

      let collaboratedTournaments: Tournament[] = []
      if (collaborations && collaborations.length > 0) {
        const ids = collaborations.map(c => c.tournament_id)
        const { data } = await supabase
          .from('tournaments')
          .select('*')
          .in('id', ids)
          .order('created_at', { ascending: false })
        
        collaboratedTournaments = data || []
      }

      // Combina e deduplica
      const tournamentMap = new Map<string, Tournament>()
      
      ownTournaments?.forEach(t => {
        tournamentMap.set(t.id, { ...t, isOwner: true, isCollaborator: false })
      })
      
      collaboratedTournaments.forEach(t => {
        if (!tournamentMap.has(t.id)) {
          tournamentMap.set(t.id, { ...t, isOwner: false, isCollaborator: true })
        }
      })

      setTournaments(Array.from(tournamentMap.values()))
    } catch (err: any) {
      console.error('Error fetching tournaments:', err)
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }, [user])

  useEffect(() => {
    fetchTournaments()
  }, [fetchTournaments])

  return {
    tournaments,
    loading,
    error,
    refresh: fetchTournaments,
    activeTournaments: tournaments.filter(t => 
      ['registration_open', 'in_progress'].includes(t.status)
    ),
  }
}

export function useTournament(id: string) {
  const { user } = useAuthStore()
  const [tournament, setTournament] = useState<Tournament | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [canManage, setCanManage] = useState(false)
  const [isOwner, setIsOwner] = useState(false)

  const fetchTournament = useCallback(async () => {
    if (!id || !user) {
      setLoading(false)
      return
    }

    setLoading(true)
    setError(null)

    try {
      const { data, error: fetchError } = await supabase
        .from('tournaments')
        .select('*')
        .eq('id', id)
        .single()

      if (fetchError) throw fetchError

      const ownerCheck = data.created_by === user.id
      setIsOwner(ownerCheck)

      // Check collaborator status
      const { data: collab } = await supabase
        .from('tournament_collaborators')
        .select('*')
        .eq('tournament_id', id)
        .eq('user_id', user.id)
        .eq('status', 'accepted')
        .single()

      const isCollaborator = !!collab
      setCanManage(ownerCheck || isCollaborator)
      
      setTournament({
        ...data,
        isOwner: ownerCheck,
        isCollaborator,
      })
    } catch (err: any) {
      console.error('Error fetching tournament:', err)
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }, [id, user])

  useEffect(() => {
    fetchTournament()
  }, [fetchTournament])

  return {
    tournament,
    loading,
    error,
    canManage,
    isOwner,
    refresh: fetchTournament,
  }
}
