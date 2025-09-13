import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/utils/supabase/server'

export async function POST(req: NextRequest) {
  try {
    const supabase = createClient()
    
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return NextResponse.json({ error: 'Non autenticato' }, { status: 401 })
    }

    const { streamId, eventId } = await req.json()

    const { data: stream, error: streamError } = await supabase
      .from('live_streams')
      .update({ 
        status: 'ended',
        ended_at: new Date().toISOString(),
        viewer_count: 0
      })
      .eq('id', streamId)
      .eq('event_id', eventId)
      .select()
      .single()

    if (streamError) throw streamError

    await supabase
      .from('events')
      .update({ status: 'completed' })
      .eq('id', eventId)
      .eq('created_by', user.id)

    return NextResponse.json({ 
      success: true, 
      message: 'Streaming terminato con successo',
      stream 
    })
  } catch (error) {
    console.error('Errore terminazione streaming:', error)
    return NextResponse.json(
      { error: 'Errore durante la terminazione dello streaming' },
      { status: 500 }
    )
  }
}
