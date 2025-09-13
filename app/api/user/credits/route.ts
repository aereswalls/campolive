import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/utils/supabase/server'

export async function GET(req: NextRequest) {
  try {
    const supabase = createClient()
    
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return NextResponse.json({ error: 'Non autenticato' }, { status: 401 })
    }

    const { data: credits, error: creditsError } = await supabase
      .from('user_credits')
      .select('*')
      .eq('user_id', user.id)
      .single()

    if (creditsError && creditsError.code !== 'PGRST116') {
      throw creditsError
    }

    if (!credits) {
      const { data: newCredits } = await supabase
        .from('user_credits')
        .insert({
          user_id: user.id,
          balance: 3,
          total_earned: 3,
          total_purchased: 0,
          total_consumed: 0
        })
        .select()
        .single()
      
      return NextResponse.json({
        balance: newCredits?.balance || 3,
        total_purchased: 0,
        total_consumed: 0,
        total_earned: 3,
        transactions: [],
        analytics: {
          avg_consumption_per_month: 0,
          most_used_feature: null,
          credits_expiring_soon: 0
        }
      })
    }

    const { data: transactions } = await supabase
      .from('credit_transactions')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .limit(50)

    const thirtyDaysAgo = new Date()
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)

    const { data: recentConsumption } = await supabase
      .from('credit_transactions')
      .select('amount')
      .eq('user_id', user.id)
      .eq('type', 'consume')
      .gte('created_at', thirtyDaysAgo.toISOString())

    const monthlyConsumption = recentConsumption?.reduce((sum, t) => sum + Math.abs(t.amount), 0) || 0

    return NextResponse.json({
      balance: credits.balance,
      total_purchased: credits.total_purchased,
      total_consumed: credits.total_consumed,
      total_earned: credits.total_earned,
      transactions: transactions || [],
      analytics: {
        avg_consumption_per_month: monthlyConsumption,
        most_used_feature: 'streaming',
        credits_expiring_soon: 0
      }
    })
  } catch (error) {
    console.error('Errore recupero crediti:', error)
    return NextResponse.json(
      { error: 'Errore durante il recupero dei crediti' },
      { status: 500 }
    )
  }
}

export async function POST(req: NextRequest) {
  try {
    const supabase = createClient()
    
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return NextResponse.json({ error: 'Non autenticato' }, { status: 401 })
    }

    const { amount, eventId, description } = await req.json()

    const { data, error } = await supabase.rpc('consume_credits', {
      p_user_id: user.id,
      p_amount: amount,
      p_event_id: eventId
    })

    if (error) throw error

    if (!data) {
      return NextResponse.json(
        { error: 'Crediti insufficienti' },
        { status: 400 }
      )
    }

    return NextResponse.json({ 
      success: true,
      message: `${amount} crediti consumati con successo`
    })
  } catch (error) {
    console.error('Errore consumo crediti:', error)
    return NextResponse.json(
      { error: 'Errore durante il consumo dei crediti' },
      { status: 500 }
    )
  }
}
