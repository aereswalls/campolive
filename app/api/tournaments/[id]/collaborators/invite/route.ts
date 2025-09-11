import { createClient } from '@/utils/supabase/server'
import { NextResponse } from 'next/server'

export async function POST(
  request: Request,
  { params }: { params: { id: string } }
) {
  const supabase = createClient()
  
  try {
    const { data: { user } } = await supabase.auth.getUser()
    
    if (!user) {
      return NextResponse.json(
        { error: 'Non autorizzato' },
        { status: 401 }
      )
    }
    
    const { email, role } = await request.json()
    const normalizedEmail = email.trim().toLowerCase()
    
    // Verifica che l'utente sia il proprietario del torneo
    const { data: tournament } = await supabase
      .from('tournaments')
      .select('created_by, name')
      .eq('id', params.id)
      .single()
    
    if (!tournament || tournament.created_by !== user.id) {
      return NextResponse.json(
        { error: 'Non sei autorizzato a invitare co-organizzatori' },
        { status: 403 }
      )
    }
    
    // Controlla se esiste già un invito per questa email
    const { data: existingInvite } = await supabase
      .from('tournament_collaborators')
      .select('id, status')
      .eq('tournament_id', params.id)
      .eq('invited_email', normalizedEmail)
      .single()
    
    if (existingInvite) {
      if (existingInvite.status === 'accepted') {
        return NextResponse.json(
          { error: 'Questo utente è già un co-organizzatore' },
          { status: 400 }
        )
      }
      return NextResponse.json(
        { error: 'Invito già inviato a questa email' },
        { status: 400 }
      )
    }
    
    // Cerca se l'utente esiste già nel sistema
    const { data: existingUser } = await supabase
      .from('user_profiles')
      .select('id')
      .eq('email', normalizedEmail)
      .single()
    
    // Crea l'invito
    const { error: insertError } = await supabase
      .from('tournament_collaborators')
      .insert({
        tournament_id: params.id,
        user_id: existingUser?.id || null,
        invited_by: user.id,
        invited_email: normalizedEmail,
        role: role || 'co_organizer',
        status: existingUser ? 'accepted' : 'pending'
      })
    
    if (insertError) {
      console.error('Errore inserimento:', insertError)
      throw insertError
    }
    
    if (existingUser) {
      return NextResponse.json({
        success: true,
        message: `${normalizedEmail} è ora co-organizzatore del torneo!`
      })
    } else {
      return NextResponse.json({
        success: true,
        message: `Invito inviato a ${normalizedEmail}. Potrà accedere al torneo dopo la registrazione.`
      })
    }
    
  } catch (error: any) {
    console.error('Errore invito collaboratore:', error)
    return NextResponse.json(
      { error: error.message || 'Errore durante l\'invito' },
      { status: 500 }
    )
  }
}
