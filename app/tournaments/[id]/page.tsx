import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import Navbar from '@/components/Navbar'
import { checkTournamentPermissions } from '@/utils/tournament-permissions'
import { 
  Trophy, Calendar, MapPin, Users, Plus, Edit, Play, 
  ChevronRight, Shield, Clock, Target, Award, 
  BarChart3, Settings, UserPlus
} from 'lucide-react'

interface PageProps {
  params: {
    id: string
  }
}

export default async function TournamentPage({ params }: PageProps) {
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
  
  const permissions = await checkTournamentPermissions(params.id, user.id)
  
  if (!permissions.canManage) {
    redirect('/tournaments')
  }
  
  // Get all data
  const { data: teams } = await supabase
    .from('tournament_teams')
    .select(`
      *,
      team:teams(*)
    `)
    .eq('tournament_id', params.id)
    .eq('registration_status', 'approved')
  
  const { data: matches } = await supabase
    .from('tournament_matches')
    .select(`
      *,
      home_team:teams!tournament_matches_home_team_id_fkey(*),
      away_team:teams!tournament_matches_away_team_id_fkey(*)
    `)
    .eq('tournament_id', params.id)
    .order('match_date', { ascending: true })
  
  const { data: collaborators } = await supabase
    .from('tournament_collaborators')
    .select('*')
    .eq('tournament_id', params.id)
    .eq('status', 'accepted')
  
  // Calcola statistiche
  const completedMatches = matches?.filter(m => m.is_completed) || []
  const upcomingMatches = matches?.filter(m => !m.is_completed) || []
  const nextMatch = upcomingMatches[0]
  
  const getStatusColor = (status: string) => {
    switch(status) {
      case 'draft': return 'bg-gray-100 text-gray-700 border-gray-300'
      case 'registration_open': return 'bg-blue-100 text-blue-700 border-blue-300'
      case 'in_progress': return 'bg-green-100 text-green-700 border-green-300'
      case 'completed': return 'bg-purple-100 text-purple-700 border-purple-300'
      case 'cancelled': return 'bg-red-100 text-red-700 border-red-300'
      default: return 'bg-gray-100 text-gray-700 border-gray-300'
    }
  }
  
  const getStatusLabel = (status: string) => {
    switch(status) {
      case 'draft': return 'Bozza'
      case 'registration_open': return 'Iscrizioni Aperte'
      case 'in_progress': return 'In Corso'
      case 'completed': return 'Completato'
      case 'cancelled': return 'Cancellato'
      default: return status
    }
  }
  
  const getFormatLabel = (format: string) => {
    switch(format) {
      case 'campionato': return 'Campionato'
      case 'eliminazione_diretta': return 'Eliminazione Diretta'
      case 'gironi_ed_eliminazione': return 'Gironi + Eliminazione'
      case 'coppa': return 'Coppa'
      case 'amichevole': return 'Amichevole'
      default: return format
    }
  }
  
  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar userEmail={user.email} />
      
      <main className="container mx-auto px-4 py-8 max-w-7xl">
        <div className="mb-6">
          <Link 
            href="/tournaments"
            className="text-gray-600 hover:text-gray-900 flex items-center space-x-1"
          >
            <ChevronRight className="w-4 h-4 rotate-180" />
            <span>I Miei Tornei</span>
          </Link>
        </div>
        
        {/* Header Migliorato */}
        <div className="bg-gradient-to-r from-green-600 to-green-700 rounded-lg shadow-lg text-white p-8 mb-8">
          <div className="flex justify-between items-start">
            <div>
              <div className="flex items-center space-x-3 mb-3">
                <Trophy className="w-10 h-10 text-yellow-300" />
                <div>
                  <h1 className="text-3xl font-bold">{tournament.name}</h1>
                  <span className={`inline-block px-3 py-1 rounded-full text-xs mt-2 border ${getStatusColor(tournament.status)}`}>
                    {getStatusLabel(tournament.status)}
                  </span>
                </div>
              </div>
              {tournament.description && (
                <p className="text-green-50 mb-4 max-w-3xl">{tournament.description}</p>
              )}
              <div className="flex flex-wrap gap-4 text-sm text-green-100">
                <div className="flex items-center space-x-2">
                  <Calendar className="w-4 h-4" />
                  <span>
                    {tournament.start_date 
                      ? `Dal ${new Date(tournament.start_date).toLocaleDateString('it-IT')}`
                      : 'Date da definire'}
                    {tournament.end_date && ` al ${new Date(tournament.end_date).toLocaleDateString('it-IT')}`}
                  </span>
                </div>
                <div className="flex items-center space-x-2">
                  <MapPin className="w-4 h-4" />
                  <span>{tournament.location || tournament.city || 'Località'}, {tournament.province || 'PR'}</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Target className="w-4 h-4" />
                  <span>{getFormatLabel(tournament.format)}</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Users className="w-4 h-4" />
                  <span>{teams?.length || 0}/{tournament.max_teams} squadre</span>
                </div>
              </div>
            </div>
            
            <div>
              {permissions.isOwner ? (
                <div className="bg-yellow-400 text-yellow-900 px-3 py-1 rounded-full text-xs font-semibold">
                  OWNER
                </div>
              ) : (
                <div className="bg-blue-400 text-blue-900 px-3 py-1 rounded-full text-xs font-semibold">
                  CO-ORG
                </div>
              )}
            </div>
          </div>
        </div>
        
        {/* Azioni Rapide - disponibili per tutti i gestori */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {permissions.canManage && tournament.status === 'draft' && (
            <button className="bg-blue-600 text-white p-4 rounded-lg hover:bg-blue-700 transition flex items-center justify-center space-x-2">
              <Play className="w-5 h-5" />
              <span>Apri Iscrizioni</span>
            </button>
          )}
          
          {permissions.canManage && (
            <Link
              href={`/tournaments/${params.id}/edit`}
              className="bg-gray-600 text-white p-4 rounded-lg hover:bg-gray-700 transition flex items-center justify-center space-x-2"
            >
              <Settings className="w-5 h-5" />
              <span>Impostazioni</span>
            </Link>
          )}
          
          <Link
            href={`/tournaments/${params.id}/teams/add`}
            className="bg-yellow-600 text-white p-4 rounded-lg hover:bg-yellow-700 transition flex items-center justify-center space-x-2"
          >
            <UserPlus className="w-5 h-5" />
            <span>Aggiungi Squadre</span>
          </Link>
          
          {tournament.status !== 'draft' && (
            <Link
              href={`/tournaments/${params.id}/live`}
              className="bg-red-600 text-white p-4 rounded-lg hover:bg-red-700 transition flex items-center justify-center space-x-2"
            >
              <Play className="w-5 h-5" />
              <span>Live Dashboard</span>
            </Link>
          )}
        </div>
        
        {/* Statistiche */}
        <div className="grid md:grid-cols-4 gap-4 mb-8">
          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <div className="flex items-center justify-between mb-2">
              <BarChart3 className="w-8 h-8 text-blue-500" />
              <span className="text-2xl font-bold">{completedMatches.length}</span>
            </div>
            <p className="text-gray-600 text-sm">Partite Giocate</p>
            <p className="text-xs text-gray-500 mt-1">su {matches?.length || 0} totali</p>
          </div>
          
          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <div className="flex items-center justify-between mb-2">
              <Users className="w-8 h-8 text-green-500" />
              <span className="text-2xl font-bold">{teams?.length || 0}</span>
            </div>
            <p className="text-gray-600 text-sm">Squadre Iscritte</p>
            <p className="text-xs text-gray-500 mt-1">max {tournament.max_teams}</p>
          </div>
          
          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <div className="flex items-center justify-between mb-2">
              <Shield className="w-8 h-8 text-purple-500" />
              <span className="text-2xl font-bold">{(collaborators?.length || 0) + 1}</span>
            </div>
            <p className="text-gray-600 text-sm">Organizzatori</p>
            <p className="text-xs text-gray-500 mt-1">owner + co-org</p>
          </div>
          
          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <div className="flex items-center justify-between mb-2">
              <Clock className="w-8 h-8 text-orange-500" />
              <span className="text-2xl font-bold">{upcomingMatches.length}</span>
            </div>
            <p className="text-gray-600 text-sm">Partite da Giocare</p>
            {nextMatch && (
              <p className="text-xs text-orange-600 mt-1">
                Prossima: {new Date(nextMatch.match_date).toLocaleDateString('it-IT')}
              </p>
            )}
          </div>
        </div>
        
        {/* Menu Navigazione */}
        <div className="grid md:grid-cols-3 lg:grid-cols-5 gap-4 mb-8">
          <Link 
            href={`/tournaments/${params.id}/matches`}
            className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 hover:shadow-md transition text-center"
          >
            <Calendar className="w-8 h-8 mx-auto mb-2 text-blue-600" />
            <p className="font-semibold">Calendario</p>
            <p className="text-xs text-gray-500 mt-1">Gestisci partite</p>
          </Link>
          
          <Link 
            href={`/tournaments/${params.id}/standings`}
            className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 hover:shadow-md transition text-center"
          >
            <Trophy className="w-8 h-8 mx-auto mb-2 text-yellow-600" />
            <p className="font-semibold">Classifica</p>
            <p className="text-xs text-gray-500 mt-1">Vedi posizioni</p>
          </Link>
          
          <Link 
            href={`/tournaments/${params.id}/teams`}
            className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 hover:shadow-md transition text-center"
          >
            <Users className="w-8 h-8 mx-auto mb-2 text-green-600" />
            <p className="font-semibold">Squadre</p>
            <p className="text-xs text-gray-500 mt-1">Gestisci team</p>
          </Link>
          
          <Link 
            href={`/tournaments/${params.id}/players`}
            className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 hover:shadow-md transition text-center"
          >
            <Award className="w-8 h-8 mx-auto mb-2 text-purple-600" />
            <p className="font-semibold">Giocatori</p>
            <p className="text-xs text-gray-500 mt-1">Tutti i giocatori</p>
          </Link>
          
          {permissions.isOwner && (
            <Link 
              href={`/tournaments/${params.id}/collaborators`}
              className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 hover:shadow-md transition text-center"
            >
              <Shield className="w-8 h-8 mx-auto mb-2 text-indigo-600" />
              <p className="font-semibold">Co-organizzatori</p>
              <p className="text-xs text-gray-500 mt-1">Gestisci staff</p>
            </Link>
          )}
        </div>
        
        {/* Il resto del componente rimane uguale... */}
      </main>
    </div>
  )
}
