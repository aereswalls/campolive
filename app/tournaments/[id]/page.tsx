import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import Navbar from '@/components/Navbar'
import { Trophy, Users, Calendar, MapPin, Plus, BarChart } from 'lucide-react'

interface PageProps {
  params: {
    id: string
  }
}

export default async function TournamentDetailPage({ params }: PageProps) {
  const supabase = createClient()
  
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) {
    redirect('/login')
  }
  
  // Verifica che l'ID sia valido
  if (!params.id) {
    redirect('/tournaments')
  }
  
  const { data: tournament, error } = await supabase
    .from('tournaments')
    .select(`
      *,
      tournament_teams (
        *,
        team:teams (*)
      )
    `)
    .eq('id', params.id)
    .single()
  
  if (error || !tournament) {
    redirect('/tournaments')
  }
  
  const isOwner = tournament.created_by === user.id
  const approvedTeams = tournament.tournament_teams?.filter((tt: any) => tt.registration_status === 'approved') || []
  
  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar userEmail={user.email} />
      
      <main className="container mx-auto px-4 py-8 max-w-7xl">
        <div className="mb-6">
          <Link 
            href="/tournaments" 
            className="text-gray-600 hover:text-gray-900"
          >
            ← Torna ai Tornei
          </Link>
        </div>
        
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8 mb-8">
          <div className="flex justify-between items-start mb-6">
            <div>
              <h1 className="text-3xl font-bold mb-2">{tournament.name}</h1>
              {tournament.description && (
                <p className="text-gray-600">{tournament.description}</p>
              )}
            </div>
            <div className="flex items-center space-x-2">
              <Trophy className="w-8 h-8 text-yellow-500" />
              <span className="text-lg font-medium capitalize">
                {tournament.sport?.replace(/_/g, ' ') || 'Sport'}
              </span>
            </div>
          </div>
          
          <div className="grid md:grid-cols-4 gap-4 mb-6">
            <div className="flex items-center space-x-2 text-gray-600">
              <Calendar className="w-5 h-5" />
              <span>
                {tournament.start_date 
                  ? new Date(tournament.start_date).toLocaleDateString('it-IT') 
                  : 'Da definire'}
              </span>
            </div>
            <div className="flex items-center space-x-2 text-gray-600">
              <MapPin className="w-5 h-5" />
              <span>{tournament.city || 'Non specificato'}</span>
            </div>
            <div className="flex items-center space-x-2 text-gray-600">
              <Users className="w-5 h-5" />
              <span>{approvedTeams.length}/{tournament.max_teams || 16} squadre</span>
            </div>
            <div>
              <span className={`px-3 py-1 rounded-full text-sm ${
                tournament.status === 'draft' ? 'bg-gray-100 text-gray-700' :
                tournament.status === 'registration_open' ? 'bg-blue-100 text-blue-700' :
                tournament.status === 'in_progress' ? 'bg-green-100 text-green-700' :
                tournament.status === 'completed' ? 'bg-purple-100 text-purple-700' :
                'bg-red-100 text-red-700'
              }`}>
                {tournament.status === 'draft' ? 'Bozza' :
                 tournament.status === 'registration_open' ? 'Iscrizioni Aperte' :
                 tournament.status === 'in_progress' ? 'In Corso' :
                 tournament.status === 'completed' ? 'Completato' :
                 'Cancellato'}
              </span>
            </div>
          </div>
          
          <div className="flex flex-wrap gap-3">
            <Link
              href={`/tournaments/${params.id}/standings`}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center space-x-2"
            >
              <BarChart className="w-4 h-4" />
              <span>Classifica</span>
            </Link>
            <Link
              href={`/tournaments/${params.id}/matches`}
              className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 flex items-center space-x-2"
            >
              <Calendar className="w-4 h-4" />
              <span>Calendario Partite</span>
            </Link>
            {isOwner && (
              <Link
                href={`/tournaments/${params.id}/teams`}
                className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 flex items-center space-x-2"
              >
                <Users className="w-4 h-4" />
                <span>Gestisci Squadre</span>
              </Link>
            )}
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-bold">
              Squadre Iscritte ({approvedTeams.length})
            </h2>
          </div>
          
          {tournament.tournament_teams && tournament.tournament_teams.length > 0 ? (
            <div className="grid md:grid-cols-2 gap-4">
              {tournament.tournament_teams.map((tt: any) => (
                <Link
                  key={tt.id}
                  href={`/teams/${tt.team?.id || ''}`}
                  className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition"
                >
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="font-semibold text-lg">
                      {tt.team?.name || 'Squadra'}
                    </h3>
                    <span className={`px-2 py-1 rounded text-xs ${
                      tt.registration_status === 'approved' 
                        ? 'bg-green-100 text-green-700' 
                        : tt.registration_status === 'pending'
                        ? 'bg-yellow-100 text-yellow-700'
                        : 'bg-red-100 text-red-700'
                    }`}>
                      {tt.registration_status === 'approved' ? 'Confermata' :
                       tt.registration_status === 'pending' ? 'In Attesa' :
                       'Rifiutata'}
                    </span>
                  </div>
                  <div className="text-sm text-gray-600">
                    <p>{tt.team?.city || 'Città non specificata'}</p>
                    {tt.registration_status === 'approved' && (
                      <div className="mt-2 flex space-x-4">
                        <span>P: {tt.matches_played || 0}</span>
                        <span>V: {tt.matches_won || 0}</span>
                        <span>N: {tt.matches_drawn || 0}</span>
                        <span>S: {tt.matches_lost || 0}</span>
                        <span className="font-bold">Pts: {tt.points || 0}</span>
                      </div>
                    )}
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <div className="text-center py-12 text-gray-500">
              <Users className="w-12 h-12 mx-auto mb-3 text-gray-300" />
              <p>Nessuna squadra iscritta</p>
              {tournament.status === 'registration_open' && (
                <p className="text-sm mt-2">Le iscrizioni sono aperte!</p>
              )}
            </div>
          )}
        </div>
      </main>
    </div>
  )
}
