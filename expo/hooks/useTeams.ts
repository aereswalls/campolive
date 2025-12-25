import { useState, useEffect, useCallback } from 'react'
import { supabase } from '@/lib/supabase'
import { useAuthStore } from '@/store/authStore'
import type { Team } from '@/types'

export function useTeams() {
  const { user } = useAuthStore()
  const [teams, setTeams] = useState<Team[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchTeams = useCallback(async () => {
    if (!user) {
      setTeams([])
      setLoading(false)
      return
    }

    setLoading(true)
    setError(null)

    try {
      const { data, error: fetchError } = await supabase
        .from('team_members')
        .select(`
          role,
          team:teams(*)
        `)
        .eq('user_id', user.id)
        .eq('is_active', true)

      if (fetchError) throw fetchError

      const teamsData = data?.map(item => ({
        ...(item.team as any),
        role: item.role,
      })) || []

      setTeams(teamsData)
    } catch (err: any) {
      console.error('Error fetching teams:', err)
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }, [user])

  useEffect(() => {
    fetchTeams()
  }, [fetchTeams])

  const createTeam = async (teamData: Partial<Team>) => {
    if (!user) return { error: 'Non autenticato' }

    try {
      // Crea slug
      const slug = teamData.name?.toLowerCase()
        .replace(/[àáäâ]/g, 'a')
        .replace(/[èéëê]/g, 'e')
        .replace(/[ìíïî]/g, 'i')
        .replace(/[òóöô]/g, 'o')
        .replace(/[ùúüû]/g, 'u')
        .replace(/[^\w\s-]/g, '')
        .replace(/\s+/g, '-')
        .replace(/-+/g, '-') || 'team'

      const { data, error: createError } = await supabase
        .from('teams')
        .insert({
          ...teamData,
          slug,
          created_by: user.id,
        })
        .select()
        .single()

      if (createError) throw createError

      // Aggiungi utente come owner
      await supabase
        .from('team_members')
        .insert({
          team_id: data.id,
          user_id: user.id,
          role: 'owner',
          position: 'Fondatore',
          joined_at: new Date().toISOString(),
          is_active: true,
        })

      await fetchTeams()
      return { data }
    } catch (err: any) {
      return { error: err.message }
    }
  }

  return {
    teams,
    loading,
    error,
    refresh: fetchTeams,
    createTeam,
  }
}

export function useTeam(id: string) {
  const { user } = useAuthStore()
  const [team, setTeam] = useState<Team | null>(null)
  const [members, setMembers] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchTeam = useCallback(async () => {
    if (!id) {
      setLoading(false)
      return
    }

    setLoading(true)
    setError(null)

    try {
      const { data: teamData, error: teamError } = await supabase
        .from('teams')
        .select('*')
        .eq('id', id)
        .single()

      if (teamError) throw teamError

      // Get members
      const { data: membersData } = await supabase
        .from('team_members')
        .select(`
          *,
          user:user_profiles(*)
        `)
        .eq('team_id', id)
        .eq('is_active', true)

      // Check user role
      const userMember = membersData?.find(m => m.user_id === user?.id)

      setTeam({
        ...teamData,
        role: userMember?.role,
      })
      setMembers(membersData || [])
    } catch (err: any) {
      console.error('Error fetching team:', err)
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }, [id, user])

  useEffect(() => {
    fetchTeam()
  }, [fetchTeam])

  return {
    team,
    members,
    loading,
    error,
    refresh: fetchTeam,
  }
}
