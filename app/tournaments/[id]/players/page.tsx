import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import Navbar from '@/components/Navbar'
import { Users, UserPlus, Search, Filter, Trophy, Shield } from 'lucide-react'

interface PageProps {
  params: {
    id: string
  }
}

export default async function TournamentAllPlayersPage({ params }: PageProps) {
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
  
  // Verifica permessi
  const isOwner = tournament.created_by === user.id
  const { data: collaboration } = await supabase
    .from('tournament_collaborators')
    .select('*')
    .eq('tournament_id', params.id)
    .eq('user_id', user.id)
    .eq('status', 'accepted')
    .single()
  
  const canManage = isOwner || !!collaboration
  
  if (!canManage) {
    redirect('/tournaments')
  }
  
  // Recupera tutte le squadre del torneo con i loro giocatori
  const { data: tournamentTeams } = await supabase
    .from('tournament_teams')
    .select(`
      *,
      team:teams(
        *,
        players(*)
      )
    `)
    .eq('tournament_id', params.id)
    .eq('registration_status', 'approved')
  
  // Estrai tutti i giocatori da tutte le squadre
  const allPlayers = tournamentTeams?.flatMap(tt => 
    (tt.team?.players || []).map(player => ({
      ...player,
      team_name: tt.team?.name,
      team_id: tt.team?.id,
      team_city: tt.team?.city
    }))
  ) || []
  
  // Conta totali
  const totalPlayers = allPlayers.length
  const totalTeams = tournamentTeams?.length || 0
  
  // Raggruppa giocatori per ruolo
  const playersByPosition = allPlayers.reduce((acc, player) => {
    const position = player.position || 'non_specificato'
    if (!acc[position]) acc[position] = []
    acc[position].push(player)
    return acc
  }, {} as Record<string, typeof allPlayers>)
  
  const getPositionLabel = (position: string) => {
    const labels: Record<string, string> = {
      'portiere': 'Portieri',
      'difensore_centrale': 'Difensori Centrali',
      'terzino_destro': 'Terzini Destri',
      'terzino_sinistro': 'Terzini Sinistri',
      'centrocampista_centrale': 'Centrocampisti Centrali',
      'centrocampista_difensivo': 'Mediani',
      'centrocampista_offensivo': 'Trequartisti',
      'ala_destra': 'Ali Destre',
      'ala_sinistra': 'Ali Sinistre',
      'attaccante_centrale': 'Attaccanti',
      'seconda_punta': 'Seconde Punte',
      'non_specificato': 'Ruolo non specificato'
    }
    return labels[position] || position
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
          <div className="flex justify-between items-start">
            <div>
              <h1 className="text-3xl font-bold mb-2">Tutti i Giocatori</h1>
              <p className="text-gray-600">{tournament.name}</p>
            </div>
            <Users className="w-8 h-8 text-blue-500" />
          </div>
          
          <div className="grid md:grid-cols-4 gap-4 mt-6">
            <div className="bg-blue-50 rounded-lg p-4">
              <div className="text-2xl font-bold text-blue-700">{totalPlayers}</div>
              <div className="text-sm text-blue-600">Giocatori Totali</div>
            </div>
            <div className="bg-green-50 rounded-lg p-4">
              <div className="text-2xl font-bold text-green-700">{totalTeams}</div>
              <div className="text-sm text-green-600">Squadre</div>
            </div>
            <div className="bg-yellow-50 rounded-lg p-4">
              <div className="text-2xl font-bold text-yellow-700">
                {totalTeams > 0 ? Math.round(totalPlayers / totalTeams) : 0}
              </div>
              <div className="text-sm text-yellow-600">Media per Squadra</div>
            </div>
            <div className="bg-purple-50 rounded-lg p-4">
              <div className="text-2xl font-bold text-purple-700">
                {Object.keys(playersByPosition).length}
              </div>
              <div className="text-sm text-purple-600">Ruoli Diversi</div>
            </div>
          </div>
        </div>
        
        {totalPlayers > 0 ? (
          <div className="space-y-8">
            {/* Lista per squadra */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h2 className="text-xl font-bold mb-4">Giocatori per Squadra</h2>
              <div className="grid md:grid-cols-2 gap-6">
                {tournamentTeams?.map((tt) => (
                  <div key={tt.id} className="border rounded-lg p-4">
                    <h3 className="font-semibold text-lg mb-3 text-gray-800">
                      {tt.team?.name}
                      <span className="text-sm text-gray-500 ml-2">
                        ({tt.team?.players?.length || 0} giocatori)
                      </span>
                    </h3>
                    {tt.team?.players && tt.team.players.length > 0 ? (
                      <div className="space-y-2">
                        {tt.team.players
                          .sort((a, b) => (a.jersey_number || 99) - (b.jersey_number || 99))
                          .map((player) => (
                            <div key={player.id} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                              <div className="flex items-center space-x-3">
                                <span className="font-bold text-gray-700 w-8">
                                  {player.jersey_number || '-'}
                                </span>
                                <div>
                                  <span className="font-medium">
                                    {player.first_name} {player.last_name}
                                  </span>
                                  <span className="text-xs text-gray-500 ml-2">
                                    {getPositionLabel(player.position || '')}
                                  </span>
                                </div>
                              </div>
                              <Link
                                href={`/teams/${tt.team.id}`}
                                className="text-xs text-blue-600 hover:text-blue-700"
                              >
                                Dettagli →
                              </Link>
                            </div>
                          ))}
                      </div>
                    ) : (
                      <div className="text-gray-500 text-sm text-center py-4">
                        Nessun giocatore registrato
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
            
            {/* Lista per ruolo */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h2 className="text-xl font-bold mb-4">Giocatori per Ruolo</h2>
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                {Object.entries(playersByPosition)
                  .sort(([a], [b]) => a.localeCompare(b))
                  .map(([position, players]) => (
                    <div key={position} className="border rounded-lg p-4">
                      <h3 className="font-semibold mb-2 flex items-center justify-between">
                        <span>{getPositionLabel(position)}</span>
                        <span className="text-sm text-gray-500">({players.length})</span>
                      </h3>
                      <div className="space-y-1 max-h-48 overflow-y-auto">
                        {players.map((player) => (
                          <div key={player.id} className="text-sm p-1 hover:bg-gray-50 rounded">
                            <span className="font-medium">
                              {player.first_name} {player.last_name}
                            </span>
                            <span className="text-gray-500 text-xs ml-1">
                              ({player.team_name})
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
              </div>
            </div>
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-12 text-center">
            <Users className="w-16 h-16 mx-auto mb-4 text-gray-300" />
            <h2 className="text-xl font-semibold mb-2">Nessun giocatore registrato</h2>
            <p className="text-gray-600">
              Le squadre devono ancora registrare i loro giocatori
            </p>
          </div>
        )}
      </main>
    </div>
  )
}
