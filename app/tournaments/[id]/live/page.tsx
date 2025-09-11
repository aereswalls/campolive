import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import Navbar from '@/components/Navbar'
import LiveMatchCard from '@/components/tournaments/LiveMatchCard'
import { 
  Trophy, Calendar, Users, Clock, Activity, 
  TrendingUp, Award, Target, BarChart3, ChevronLeft,
  Play, Pause, AlertCircle
} from 'lucide-react'

interface PageProps {
  params: {
    id: string
  }
}

export default async function TournamentLivePage({ params }: PageProps) {
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
  
  // Recupera le partite di oggi
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const tomorrow = new Date(today)
  tomorrow.setDate(tomorrow.getDate() + 1)
  
  const { data: todayMatches } = await supabase
    .from('tournament_matches')
    .select(`
      *,
      home_team:teams!tournament_matches_home_team_id_fkey(*),
      away_team:teams!tournament_matches_away_team_id_fkey(*)
    `)
    .eq('tournament_id', params.id)
    .gte('match_date', today.toISOString())
    .lt('match_date', tomorrow.toISOString())
    .order('match_date', { ascending: true })
  
  // Partite in corso (non completate di oggi)
  const liveMatches = todayMatches?.filter(m => !m.is_completed) || []
  const completedToday = todayMatches?.filter(m => m.is_completed) || []
  
  // Classifica aggiornata
  const { data: standings } = await supabase
    .from('tournament_teams')
    .select(`
      *,
      team:teams(*)
    `)
    .eq('tournament_id', params.id)
    .order('points', { ascending: false })
    .order('goals_for', { ascending: false })
    .limit(5)
  
  // Statistiche del torneo
  const { data: allMatches } = await supabase
    .from('tournament_matches')
    .select('*')
    .eq('tournament_id', params.id)
  
  const totalMatches = allMatches?.length || 0
  const completedMatches = allMatches?.filter(m => m.is_completed).length || 0
  const totalGoals = allMatches?.reduce((sum, m) => 
    sum + (m.home_team_score || 0) + (m.away_team_score || 0), 0) || 0
  const avgGoalsPerMatch = completedMatches > 0 ? (totalGoals / completedMatches).toFixed(1) : '0'
  
  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar userEmail={user.email} />
      
      <main className="container mx-auto px-4 py-8 max-w-7xl">
        <div className="mb-6">
          <Link 
            href={`/tournaments/${params.id}`}
            className="text-gray-600 hover:text-gray-900 flex items-center space-x-1"
          >
            <ChevronLeft className="w-4 h-4" />
            <span>Torna al Torneo</span>
          </Link>
        </div>
        
        {/* Header Live */}
        <div className="bg-gradient-to-r from-red-600 to-red-700 rounded-lg shadow-lg text-white p-8 mb-8">
          <div className="flex justify-between items-start">
            <div>
              <div className="flex items-center space-x-3 mb-3">
                <Activity className="w-10 h-10 text-white animate-pulse" />
                <div>
                  <h1 className="text-3xl font-bold">Live Dashboard</h1>
                  <p className="text-red-100">{tournament.name}</p>
                </div>
              </div>
              <p className="text-red-100">
                Monitora in tempo reale l'andamento del torneo
              </p>
            </div>
            <div className="flex items-center space-x-2 bg-white/20 px-4 py-2 rounded-full">
              <div className="w-3 h-3 bg-green-400 rounded-full animate-pulse"></div>
              <span className="text-sm font-medium">LIVE</span>
            </div>
          </div>
        </div>
        
        {/* Statistiche Rapide */}
        <div className="grid md:grid-cols-4 gap-4 mb-8">
          <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-2xl font-bold text-gray-900">{liveMatches.length}</p>
                <p className="text-sm text-gray-600">Partite Live</p>
              </div>
              <Play className="w-8 h-8 text-green-500" />
            </div>
          </div>
          
          <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-2xl font-bold text-gray-900">{completedToday.length}</p>
                <p className="text-sm text-gray-600">Completate Oggi</p>
              </div>
              <Clock className="w-8 h-8 text-blue-500" />
            </div>
          </div>
          
          <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-2xl font-bold text-gray-900">{totalGoals}</p>
                <p className="text-sm text-gray-600">Goal Totali</p>
              </div>
              <Target className="w-8 h-8 text-purple-500" />
            </div>
          </div>
          
          <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-2xl font-bold text-gray-900">{avgGoalsPerMatch}</p>
                <p className="text-sm text-gray-600">Media Goal</p>
              </div>
              <TrendingUp className="w-8 h-8 text-orange-500" />
            </div>
          </div>
        </div>
        
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Colonna Partite Live */}
          <div className="lg:col-span-2 space-y-6">
            {/* Partite in corso */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h2 className="text-lg font-bold mb-4 flex items-center space-x-2">
                <Activity className="w-5 h-5 text-red-500 animate-pulse" />
                <span>Partite in Corso</span>
              </h2>
              
              {liveMatches.length > 0 ? (
                <div className="space-y-4">
                  {liveMatches.map((match) => (
                    <LiveMatchCard 
                      key={match.id} 
                      match={match}
                      tournamentId={params.id}
                      canManage={canManage}
                    />
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500">
                  <AlertCircle className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                  <p>Nessuna partita in corso</p>
                  <p className="text-sm mt-1">Le partite di oggi verranno mostrate qui</p>
                </div>
              )}
            </div>
            
            {/* Partite completate oggi */}
            {completedToday.length > 0 && (
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <h2 className="text-lg font-bold mb-4">Risultati di Oggi</h2>
                <div className="space-y-3">
                  {completedToday.map((match) => (
                    <div key={match.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div className="flex items-center space-x-4">
                        <div className="text-right">
                          <p className="font-medium">{match.home_team.name}</p>
                        </div>
                        <div className="flex items-center space-x-2 bg-white px-3 py-1 rounded">
                          <span className="font-bold text-lg">{match.home_team_score}</span>
                          <span className="text-gray-400">-</span>
                          <span className="font-bold text-lg">{match.away_team_score}</span>
                        </div>
                        <div>
                          <p className="font-medium">{match.away_team.name}</p>
                        </div>
                      </div>
                      <span className="text-xs text-green-600 bg-green-100 px-2 py-1 rounded">
                        Terminata
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
          
          {/* Colonna Classifica Live */}
          <div className="space-y-6">
            {/* Top 5 Classifica */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h2 className="text-lg font-bold mb-4 flex items-center space-x-2">
                <Trophy className="w-5 h-5 text-yellow-500" />
                <span>Classifica Live</span>
              </h2>
              
              {standings && standings.length > 0 ? (
                <div className="space-y-2">
                  {standings.map((team, index) => (
                    <div key={team.id} className="flex items-center justify-between p-2 hover:bg-gray-50 rounded">
                      <div className="flex items-center space-x-3">
                        <span className={`font-bold w-6 text-center ${
                          index === 0 ? 'text-yellow-500' :
                          index === 1 ? 'text-gray-400' :
                          index === 2 ? 'text-orange-600' :
                          'text-gray-600'
                        }`}>
                          {index + 1}
                        </span>
                        <div>
                          <p className="font-medium text-sm">{team.team?.name}</p>
                          <p className="text-xs text-gray-500">
                            P: {team.matches_played} | V: {team.matches_won} | S: {team.matches_lost}
                          </p>
                        </div>
                      </div>
                      <span className="font-bold text-lg">{team.points}</span>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-center text-gray-500 py-4">
                  Nessuna classifica disponibile
                </p>
              )}
              
              <Link 
                href={`/tournaments/${params.id}/standings`}
                className="block mt-4 text-center text-sm text-blue-600 hover:text-blue-700"
              >
                Vedi classifica completa →
              </Link>
            </div>
            
            {/* Statistiche Live */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h2 className="text-lg font-bold mb-4 flex items-center space-x-2">
                <BarChart3 className="w-5 h-5 text-blue-500" />
                <span>Statistiche Torneo</span>
              </h2>
              
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Completamento</span>
                  <span className="font-medium">{completedMatches}/{totalMatches}</span>
                </div>
                
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-green-600 h-2 rounded-full transition-all"
                    style={{ width: `${(completedMatches / totalMatches) * 100}%` }}
                  ></div>
                </div>
                
                <div className="pt-2 space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Partite Giocate</span>
                    <span className="font-medium">{completedMatches}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Partite Rimanenti</span>
                    <span className="font-medium">{totalMatches - completedMatches}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Goal Segnati</span>
                    <span className="font-medium">{totalGoals}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
