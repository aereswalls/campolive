import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import Navbar from '@/components/Navbar'
import InviteCollaborator from '@/components/tournaments/InviteCollaborator'
import { Users, Crown, UserCheck, Settings } from 'lucide-react'

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
  
  // Solo l'owner può gestire i co-organizzatori
  if (!isOwner) {
    redirect(`/tournaments/${params.id}`)
  }
  
  const { data: collaborators } = await supabase
    .from('tournament_collaborators')
    .select(`
      *,
      user_profiles!tournament_collaborators_user_id_fkey (
        email,
        full_name,
        username
      )
    `)
    .eq('tournament_id', params.id)
    .order('created_at', { ascending: false })
  
  const acceptedCollaborators = collaborators?.filter(c => c.status === 'accepted') || []
  const pendingCollaborators = collaborators?.filter(c => c.status === 'pending') || []
  
  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar userEmail={user.email} />
      
      <main className="container mx-auto px-4 py-8 max-w-4xl">
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
        
        <div className="grid md:grid-cols-2 gap-8">
          <div>
            <InviteCollaborator 
              tournamentId={params.id}
              existingCollaborators={acceptedCollaborators}
            />
          </div>
          
          <div className="space-y-6">
            {/* Inviti in sospeso */}
            {pendingCollaborators.length > 0 && (
              <div className="bg-yellow-50 rounded-lg border border-yellow-200 p-6">
                <h3 className="font-semibold mb-3 text-yellow-900">
                  Inviti in attesa ({pendingCollaborators.length})
                </h3>
                <div className="space-y-2">
                  {pendingCollaborators.map((collab) => (
                    <div key={collab.id} className="flex items-center justify-between p-2 bg-white rounded">
                      <span className="text-sm">
                        {collab.user_profiles?.email}
                      </span>
                      <span className="text-xs text-yellow-600">In attesa</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
            
            {/* Info */}
            <div className="bg-blue-50 rounded-lg border border-blue-200 p-6">
              <h3 className="font-semibold mb-3 text-blue-900">
                Permessi Co-organizzatori
              </h3>
              <ul className="space-y-2 text-sm text-blue-800">
                <li>✓ Vedere il torneo e tutti i dettagli</li>
                <li>✓ Gestire squadre e giocatori</li>
                <li>✓ Inserire risultati partite</li>
                <li>✓ Modificare calendario</li>
                <li>✗ Eliminare il torneo</li>
                <li>✗ Invitare altri co-organizzatori</li>
              </ul>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
