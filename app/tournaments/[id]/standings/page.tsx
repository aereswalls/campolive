import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import Navbar from '@/components/Navbar'
import { Trophy, Users, AlertCircle } from 'lucide-react'

interface PageProps {
  params: {
    id: string
  }
}

export default async function TournamentStandingsPage({ params }: PageProps) {
  const supabase = createClient()
  
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) {
    redirect('/login')
  }
  
  if (!params.id) {
    redirect('/tournaments')
  }
  
  const { data: tournament, error: tournamentError } = await supabase
    .from('tournaments')
    .select('*')
    .eq('id', params.id)
    .single()
  
  if (tournamentError || !tournament) {
    redirect('/tournaments')
  }
  
  // Recupera TUTTE le squadre registrate al torneo (anche quelle senza partite)
  const { data: standings } = await supabase
    .from('tournament_teams')
    .select(`
      *,
      team:teams (*)
    `)
    .eq('tournament_id', params.id)
    .eq('registration_status', 'approved') // Solo squadre approvate
    .order('points', { ascending: false })
    .order('goals_for', { ascending: false })
  
  const getGoalDifference = (team: any) => {
    return (team.goals_for || 0) - (team.goals_against || 0)
  }
  
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
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-3xl font-bold mb-2">Classifica {tournament.name}</h1>
              <p className="text-gray-600">
                Formato: {tournament.format?.replace(/_/g, ' ') || 'Campionato'}
              </p>
              <p className="text-sm text-gray-500 mt-1">
                {standings?.length || 0} squadre partecipanti
              </p>
            </div>
            <Trophy className="w-12 h-12 text-yellow-500" />
          </div>
          
          {tournament.status === 'draft' && (
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 flex items-start space-x-2">
              <AlertCircle className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" />
              <div className="text-sm text-yellow-800">
                <p className="font-medium">Torneo in bozza</p>
                <p>La classifica sarà attiva quando il torneo inizierà.</p>
              </div>
            </div>
          )}
        </div>
        
        {standings && standings.length > 0 ? (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Pos
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Squadra
                  </th>
                  <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                    P
                  </th>
                  <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                    V
                  </th>
                  <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                    N
                  </th>
                  <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                    S
                  </th>
                  <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                    GF
                  </th>
                  <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                    GS
                  </th>
                  <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                    DR
                  </th>
                  <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Pts
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {standings.map((team: any, index: number) => {
                  const diff = getGoalDifference(team)
                  const hasPlayed = team.matches_played > 0
                  
                  return (
                    <tr 
                      key={team.id} 
                      className={`
                        ${index < 3 && hasPlayed ? 'bg-green-50' : ''}
                        ${!hasPlayed ? 'opacity-60' : ''}
                      `}
                    >
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <span className={`font-bold ${
                            !hasPlayed ? 'text-gray-400' :
                            index === 0 ? 'text-yellow-500' : 
                            index === 1 ? 'text-gray-400' : 
                            index === 2 ? 'text-orange-600' : 
                            'text-gray-700'
                          }`}>
                            {index + 1}
                          </span>
                          {index < 3 && hasPlayed && (
                            <Trophy className={`w-4 h-4 ml-1 ${
                              index === 0 ? 'text-yellow-500' : 
                              index === 1 ? 'text-gray-400' : 
                              'text-orange-600'
                            }`} />
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="font-medium text-gray-900">
                          {team.team?.name || 'Squadra'}
                        </div>
                        <div className="text-sm text-gray-500">
                          {team.team?.city || ''}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-center text-sm text-gray-900">
                        {team.matches_played || 0}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-center text-sm text-green-600 font-medium">
                        {team.matches_won || 0}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-center text-sm text-gray-600">
                        {team.matches_drawn || 0}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-center text-sm text-red-600">
                        {team.matches_lost || 0}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-center text-sm text-gray-900">
                        {team.goals_for || 0}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-center text-sm text-gray-900">
                        {team.goals_against || 0}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-center text-sm">
                        <span className={`font-medium ${
                          diff > 0 ? 'text-green-600' : 
                          diff < 0 ? 'text-red-600' : 
                          'text-gray-600'
                        }`}>
                          {diff > 0 ? '+' : ''}{diff}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-center">
                        <span className="text-lg font-bold text-gray-900">
                          {team.points || 0}
                        </span>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
            
            <div className="bg-gray-50 px-6 py-3 border-t">
              <div className="flex items-center justify-between text-xs text-gray-500">
                <div className="flex items-center space-x-2">
                  <Users className="w-4 h-4" />
                  <span>{standings.length} squadre iscritte</span>
                </div>
                <div>
                  Ultima modifica: {new Date().toLocaleDateString('it-IT')}
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-12">
            <div className="text-center text-gray-500">
              <Trophy className="w-12 h-12 mx-auto mb-3 text-gray-300" />
              <p className="mb-2">Nessuna squadra registrata</p>
              <p className="text-sm mb-4">Aggiungi squadre al torneo per vedere la classifica</p>
              <Link 
                href={`/tournaments/${params.id}/teams/add`}
                className="inline-block px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
              >
                Aggiungi Squadre
              </Link>
            </div>
          </div>
        )}
      </main>
    </div>
  )
}
