import { createClient } from '@/utils/supabase/server'

export async function checkTournamentPermissions(tournamentId: string, userId: string) {
  const supabase = createClient()
  
  // Verifica se è owner
  const { data: tournament } = await supabase
    .from('tournaments')
    .select('created_by')
    .eq('id', tournamentId)
    .single()
  
  const isOwner = tournament?.created_by === userId
  
  // Verifica se è collaboratore
  const { data: collaboration } = await supabase
    .from('tournament_collaborators')
    .select('*')
    .eq('tournament_id', tournamentId)
    .eq('user_id', userId)
    .eq('status', 'accepted')
    .single()
  
  const isCollaborator = !!collaboration
  const canManage = isOwner || isCollaborator
  
  return {
    isOwner,
    isCollaborator,
    canManage,
    canDelete: isOwner, // Solo owner può eliminare
    canInvite: isOwner  // Solo owner può invitare
  }
}
