import { createClient } from '@/utils/supabase/server'
import { NextResponse } from 'next/server'

export async function DELETE(
  request: Request,
  { params }: { params: { id: string, collaboratorId: string } }
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
    
    // Verifica che l'utente sia il proprietario del torneo
    const { data: tournament } = await supabase
      .from('tournaments')
      .select('created_by')
      .eq('id', params.id)
      .single()
    
    if (!tournament || tournament.created_by !== user.id) {
      return NextResponse.json(
        { error: 'Non sei autorizzato a rimuovere co-organizzatori' },
        { status: 403 }
      )
    }
    
    // Rimuovi il collaboratore
    const { error } = await supabase
      .from('tournament_collaborators')
      .delete()
      .eq('id', params.collaboratorId)
      .eq('tournament_id', params.id)
    
    if (error) throw error
    
    return NextResponse.json({ success: true })
    
  } catch (error: any) {
    console.error('Errore rimozione collaboratore:', error)
    return NextResponse.json(
      { error: error.message || 'Errore durante la rimozione' },
      { status: 500 }
    )
  }
}
