import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import Navbar from '@/components/Navbar'
import InviteCollaborator from '@/components/tournaments/InviteCollaborator'
import CollaboratorActions from '@/components/tournaments/CollaboratorActions'
import { Users, Crown, UserCheck, Mail, Clock } from 'lucide-react'

export default async function TournamentCollaboratorsPage({
  params
}: {
  params: { id: string }
}) {
  const supabase = createClient()
  
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) {
    redirect('/login')
  }
  
  const { data: tournament } = await supabase
    .from('tournaments')
    .select('*')
    .eq('id', params.id)
    .single()
  
  if (!tournament) {
    redirect('/tournaments')
  }
  
  const isOwner = tournament.created_by === user.id
  
  if (!isOwner) {
    redirect(`/tournaments/${params.id}`)
  }
  
  // Query semplificata per i collaboratori
  const { data: collaborators, error } = await supabase
    .from('tournament_collaborators')
    .select('*')
    .eq('tournament_id', params.id)
    .order('invited_at', { ascending: false })
  
  if (error) {
    console.error('Error fetching collaborators:', error)
  }
  
  // Per ogni collaboratore con user_id, recupera i dati del profilo
  const collaboratorsWithProfiles = await Promise.all(
    (collaborators || []).map(async (collab) => {
      let userProfile = null
      
      if (collab.user_id) {
        const { data } = await supabase
          .from('user_profiles')
          .select('email, full_name, username')
          .eq('id', collab.user_id)
          .single()
        
        userProfile = data
      }
      
      return {
        ...collab,
        user_profiles: userProfile
      }
    })
  )
  
  // Separa accettati e pendenti basandosi sullo status
  const acceptedCollaborators = collaboratorsWithProfiles.filter(c => c.status === 'accepted')
  const pendingCollaborators = collaboratorsWithProfiles.filter(c => c.status === 'pending')
  
  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar userEmail={user.email} />
      
      <main className="container mx-auto px-4 py-8 max-w-6xl">
        <div className="mb-6">
          <Link 
            href={`/tournaments/${params.id}`}
            className="text-gray-600 hover:text-gray-900"
          >
            ← Torna al Torneo
          </Link>
        </div>
        
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8 mb-8">
          <div className="flex items-center space-x-2 mb-2">
            <Users className="w-6 h-6 text-gray-600" />
            <h1 className="text-3xl font-bold">Gestione Co-organizzatori</h1>
          </div>
          <p className="text-gray-600">{tournament.name}</p>
        </div>
        
        <div className="grid md:grid-cols-3 gap-8">
          <div className="md:col-span-1">
            <InviteCollaborator 
              tournamentId={params.id}
              existingCollaborators={collaboratorsWithProfiles}
            />
            
            <div className="bg-blue-50 rounded-lg border border-blue-200 p-6 mt-6">
              <h3 className="font-semibold mb-3 text-blue-900">
                Permessi Co-organizzatori
              </h3>
              <ul className="space-y-2 text-sm text-blue-800">
                <li>✓ Vedere il torneo</li>
                <li>✓ Gestire squadre</li>
                <li>✓ Inserire risultati</li>
                <li>✓ Modificare calendario</li>
                <li>✗ Eliminare torneo</li>
                <li>✗ Invitare altri</li>
              </ul>
            </div>
          </div>
          
          <div className="md:col-span-2 space-y-6">
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <h3 className="font-semibold mb-4 flex items-center space-x-2">
                <UserCheck className="w-5 h-5 text-green-600" />
                <span>Co-organizzatori attivi ({acceptedCollaborators.length})</span>
              </h3>
              
              {acceptedCollaborators.length > 0 ? (
                <div className="space-y-3">
                  {acceptedCollaborators.map((collab) => {
                    const displayName = collab.user_profiles?.full_name || 
                                       collab.user_profiles?.email || 
                                       collab.invited_email || 
                                       'Utente'
                    const displayEmail = collab.invited_email || 
                                        collab.user_profiles?.email || 
                                        'Email non disponibile'
                    
                    return (
                      <div key={collab.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <div>
                          <div className="font-medium">{displayName}</div>
                          <div className="text-sm text-gray-500">
                            {displayEmail}
                          </div>
                          <div className="text-xs text-gray-400 mt-1">
                            Aggiunto il {new Date(collab.invited_at).toLocaleDateString('it-IT')}
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          <span className="text-xs px-2 py-1 bg-green-100 text-green-700 rounded">
                            {collab.role === 'co_organizer' ? 'Co-organizzatore' : 'Assistente'}
                          </span>
                          <CollaboratorActions 
                            collaboratorId={collab.id}
                            tournamentId={params.id}
                          />
                        </div>
                      </div>
                    )
                  })}
                </div>
              ) : (
                <div className="text-gray-500 text-center py-8">
                  <UserCheck className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                  <p>Nessun co-organizzatore attivo</p>
                  <p className="text-sm mt-2">
                    Invita altri utenti per collaborare nella gestione del torneo
                  </p>
                </div>
              )}
            </div>
            
            {pendingCollaborators.length > 0 && (
              <div className="bg-yellow-50 rounded-lg border border-yellow-200 p-6">
                <h3 className="font-semibold mb-4 flex items-center space-x-2 text-yellow-900">
                  <Clock className="w-5 h-5" />
                  <span>Inviti in attesa ({pendingCollaborators.length})</span>
                </h3>
                <div className="space-y-3">
                  {pendingCollaborators.map((collab) => (
                    <div key={collab.id} className="flex items-center justify-between p-3 bg-white rounded-lg">
                      <div>
                        <div className="font-medium">
                          {collab.invited_email || 'Email non specificata'}
                        </div>
                        <div className="text-xs text-yellow-600 mt-1">
                          Invitato il {new Date(collab.invited_at).toLocaleDateString('it-IT')}
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Mail className="w-4 h-4 text-yellow-600" />
                        <span className="text-xs text-yellow-600">In attesa</span>
                        <CollaboratorActions 
                          collaboratorId={collab.id}
                          tournamentId={params.id}
                          isPending={true}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  )
}
