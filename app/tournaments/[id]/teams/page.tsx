import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import Navbar from '@/components/Navbar'
import { Users, Trash2, CheckCircle, XCircle, Plus } from 'lucide-react'

interface PageProps {
  params: {
    id: string
  }
}

export default async function TournamentTeamsPage({ params }: PageProps) {
  const supabase = createClient()
  
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) {
    redirect('/login')
  }
  
  // Get tournament
  const { data: tournament } = await supabase
    .from('tournaments')
    .select('*')
    .eq('id', params.id)
    .single()
  
  if (!tournament) {
    redirect('/tournaments')
  }
  
  const isOwner = tournament.created_by === user.id
  
  // Check if user is collaborator
  const { data: collaboration } = await supabase
    .from('tournament_collaborators')
    .select('*')
    .eq('tournament_id', params.id)
    .eq('user_id', user.id)
    .eq('status', 'accepted')
    .single()
  
  const canManage = isOwner || !!collaboration
  
  if (!canManage) {
    redirect(`/tournaments/${params.id}`)
  }
  
  // Get teams in tournament
  const { data: tournamentTeams } = await supabase
    .from('tournament_teams')
    .select(`
      *,
      team:teams(*)
    `)
    .eq('tournament_id', params.id)
    .order('created_at', { ascending: false })
  
  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar userEmail={user.email} />
      
      <main className="container mx-auto px-4 py-8 max-w-7xl">
        <div className="mb-6">
          <Link 
            href={`/tournaments/${params.id}`}
            className="text-gray-600 hover:text-gray-900"
          >
            ← Torna al Torneo
          </Link>
        </div>
        
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8 mb-8">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold mb-2">Gestione Squadre</h1>
              <p className="text-gray-600">{tournament.name}</p>
              <p className="text-sm text-gray-500 mt-2">
                {tournamentTeams?.length || 0} di {tournament.max_teams} squadre iscritte
              </p>
            </div>
            <Link
              href={`/tournaments/${params.id}/teams/add`}
              className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 flex items-center space-x-2"
            >
              <Plus className="w-4 h-4" />
              <span>Aggiungi Squadre</span>
            </Link>
          </div>
        </div>
        
        {tournamentTeams && tournamentTeams.length > 0 ? (
          <div className="grid gap-4">
            {tournamentTeams.map((entry) => (
              <div key={entry.id} className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold mb-2">
                      {entry.team?.name}
                    </h3>
                    <div className="grid md:grid-cols-3 gap-4 text-sm text-gray-600">
                      <div>
                        <span className="font-medium">Città:</span> {entry.team?.city || 'N/D'}
                      </div>
                      <div>
                        <span className="font-medium">Sport:</span> {entry.team?.sport_type || tournament.sport}
                      </div>
                      <div>
                        <span className="font-medium">Iscrizione:</span> {new Date(entry.registration_date).toLocaleDateString('it-IT')}
                      </div>
                    </div>
                    
                    {entry.group_name && (
                      <div className="mt-2">
                        <span className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded">
                          Girone {entry.group_name}
                        </span>
                      </div>
                    )}
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    {entry.registration_status === 'approved' ? (
                      <span className="flex items-center text-green-600 text-sm">
                        <CheckCircle className="w-4 h-4 mr-1" />
                        Approvata
                      </span>
                    ) : entry.registration_status === 'rejected' ? (
                      <span className="flex items-center text-red-600 text-sm">
                        <XCircle className="w-4 h-4 mr-1" />
                        Rifiutata
                      </span>
                    ) : (
                      <span className="text-yellow-600 text-sm">
                        In attesa
                      </span>
                    )}
                  </div>
                </div>
                
                <div className="mt-4 pt-4 border-t flex justify-between items-center">
                  <div className="grid grid-cols-4 gap-4 text-sm">
                    <div>
                      <span className="text-gray-500">Partite:</span> {entry.matches_played}
                    </div>
                    <div>
                      <span className="text-gray-500">Vinte:</span> {entry.matches_won}
                    </div>
                    <div>
                      <span className="text-gray-500">Perse:</span> {entry.matches_lost}
                    </div>
                    <div>
                      <span className="text-gray-500">Punti:</span> <strong>{entry.points}</strong>
                    </div>
                  </div>
                  
                  {canManage && (
                    <button className="text-red-600 hover:text-red-700 p-2">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-12 text-center">
            <Users className="w-16 h-16 mx-auto mb-4 text-gray-300" />
            <h2 className="text-xl font-semibold mb-2">Nessuna squadra iscritta</h2>
            <p className="text-gray-600 mb-6">
              Aggiungi le prime squadre al torneo
            </p>
            <Link
              href={`/tournaments/${params.id}/teams/add`}
              className="inline-block px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700"
            >
              Aggiungi Squadre
            </Link>
          </div>
        )}
      </main>
    </div>
  )
}
