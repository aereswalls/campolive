import { createClient } from '@/utils/supabase/server'
import { NextResponse } from 'next/server'

export async function POST(request: Request) {
  const supabase = createClient()
  const { eventId } = await request.json()
  
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  
  // Verifica crediti
  const { data: credits } = await supabase
    .from('user_credits')
    .select('balance')
    .eq('user_id', user.id)
    .single()
  
  if (!credits || credits.balance < 1) {
    return NextResponse.json({ error: 'Crediti insufficienti' }, { status: 400 })
  }
  
  // Consuma 1 credito atomicamente
  const { data: result } = await supabase.rpc('consume_credits', {
    p_user_id: user.id,
    p_amount: 1,
    p_event_id: eventId
  })
  
  if (!result) {
    return NextResponse.json({ error: 'Errore consumo crediti' }, { status: 400 })
  }
  
  // Crea live stream
  const streamKey = crypto.randomUUID()
  const { data: stream } = await supabase
    .from('live_streams')
    .insert({
      event_id: eventId,
      stream_key: streamKey,
      status: 'live',
      started_at: new Date().toISOString()
    })
    .select()
    .single()
  
  // Aggiorna evento
  await supabase
    .from('events')
    .update({ status: 'live' })
    .eq('id', eventId)
  
  return NextResponse.json({
    streamId: stream.id,
    streamKey: streamKey,
    creditsRemaining: credits.balance - 1
  })
}
