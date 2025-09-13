import { useState, useEffect } from 'react'
import { createClient } from '@/utils/supabase/client'

export function useCredits(userId: string | undefined) {
  const [credits, setCredits] = useState<number>(0)
  const [loading, setLoading] = useState(true)
  const supabase = createClient()

  useEffect(() => {
    if (!userId) return

    const fetchCredits = async () => {
      const { data } = await supabase
        .from('user_credits')
        .select('balance')
        .eq('user_id', userId)
        .single()
      
      if (data) {
        setCredits(data.balance)
      }
      setLoading(false)
    }

    fetchCredits()

    const channel = supabase
      .channel(`credits-${userId}`)
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'user_credits',
          filter: `user_id=eq.${userId}`
        },
        (payload) => {
          setCredits(payload.new.balance)
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [userId, supabase])

  const consumeCredits = async (amount: number, eventId: string) => {
    const response = await fetch('/api/user/credits', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ amount, eventId })
    })
    return response.json()
  }

  return { credits, loading, consumeCredits }
}
