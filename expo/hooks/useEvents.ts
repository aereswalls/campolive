import { useState, useEffect, useCallback } from 'react'
import { supabase } from '@/lib/supabase'
import { useAuthStore } from '@/store/authStore'
import type { Event } from '@/types'

export function useEvents() {
  const { user } = useAuthStore()
  const [events, setEvents] = useState<Event[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchEvents = useCallback(async () => {
    if (!user) {
      setEvents([])
      setLoading(false)
      return
    }

    setLoading(true)
    setError(null)

    try {
      const { data, error: fetchError } = await supabase
        .from('events')
        .select(`
          *,
          home_team:teams!home_team_id(*),
          away_team:teams!away_team_id(*)
        `)
        .eq('created_by', user.id)
        .order('scheduled_at', { ascending: false })

      if (fetchError) throw fetchError

      setEvents(data || [])
    } catch (err: any) {
      console.error('Error fetching events:', err)
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }, [user])

  useEffect(() => {
    fetchEvents()
  }, [fetchEvents])

  const createEvent = async (eventData: Partial<Event>) => {
    if (!user) return { error: 'Non autenticato' }

    try {
      const { data, error: createError } = await supabase
        .from('events')
        .insert({
          ...eventData,
          created_by: user.id,
          status: 'scheduled',
        })
        .select()
        .single()

      if (createError) throw createError

      await fetchEvents()
      return { data }
    } catch (err: any) {
      return { error: err.message }
    }
  }

  return {
    events,
    loading,
    error,
    refresh: fetchEvents,
    createEvent,
    upcomingEvents: events.filter(e => e.status === 'scheduled'),
    liveEvents: events.filter(e => e.status === 'live'),
  }
}

export function useEvent(id: string) {
  const { user } = useAuthStore()
  const [event, setEvent] = useState<Event | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchEvent = useCallback(async () => {
    if (!id) {
      setLoading(false)
      return
    }

    setLoading(true)
    setError(null)

    try {
      const { data, error: fetchError } = await supabase
        .from('events')
        .select(`
          *,
          home_team:teams!home_team_id(*),
          away_team:teams!away_team_id(*)
        `)
        .eq('id', id)
        .single()

      if (fetchError) throw fetchError

      setEvent(data)
    } catch (err: any) {
      console.error('Error fetching event:', err)
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }, [id])

  useEffect(() => {
    fetchEvent()
  }, [fetchEvent])

  const updateStatus = async (status: Event['status']) => {
    if (!event) return { error: 'Evento non trovato' }

    try {
      const { error: updateError } = await supabase
        .from('events')
        .update({ status })
        .eq('id', event.id)

      if (updateError) throw updateError

      setEvent(prev => prev ? { ...prev, status } : null)
      return {}
    } catch (err: any) {
      return { error: err.message }
    }
  }

  return {
    event,
    loading,
    error,
    refresh: fetchEvent,
    updateStatus,
    isOwner: event?.created_by === user?.id,
  }
}
