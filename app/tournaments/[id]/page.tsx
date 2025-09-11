import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import Navbar from '@/components/Navbar'
import { Trophy, Calendar, MapPin, Users, Plus, Edit, Play, ChevronRight } from 'lucide-react'

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
  
  const isOwner = tournament.created_by === user.id
  
  // Check if user is a collaborator
  const { data: collaboration } = await supabase
    .from('tournament_collaborators')
    .select('*')
    .eq('tournament_id', params.id)
    .eq('user_id', user.id)
    .eq('status', 'accepted')
    .single()
  
  const isCollaborator = !!collaboration
  const canManage = isOwner || isCollaborator
  
  if (!canManage) {
    redirect('/tournaments')
  }
  
  // Get teams
  const { data: teams } = await supabase
    .from('tournament_teams')
    .select(`
      *,
      team:teams(*)
    `)
    .eq('tournament_id', params.id)
  
  // Get matches
  const { data: matches } = await supabase
    .from('tournament_matches')
    .select(`
      *,
      home_team:teams!tournament_matches_home_team_id_fkey(*),
      away_team:teams!tournament_matches_away_team_id_fkey(*)
    `)
    .eq('tournament_id', params.id)
    .order('match_date', { ascending: true })
  
  const getStatusColor = (status: string) => {
    switch(status) {
      case 'draft': return 'bg-gray-100 text-gray-700'
      case 'registration_open': return 'bg-blue-100 text-blue-700'
      case 'in_progress': return 'bg-green-100 text-green-700'
      case 'completed': return 'bg-purple-100 text-purple-700'
      case 'cancelled': return 'bg-red-100 text-red-700'
      default: return 'bg-gray-100 text-gray-700'
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
        
        {/* Header */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8 mb-8">
          <div className="flex justify-between items-start mb-4">
            <div>
              <div className="flex items-center space-x-3 mb-2">
                <Trophy className="w-8 h-8 text-yellow-500" />
                <h1 className="text-3xl font-bold">{tournament.name}</h1>
              </div>
              {tournament.description && (
                <p className="text-gray-600 mb-4">{tournament.description}</p>
              )}
              <div className="flex flex-wrap gap-4 text-sm text-gray-600">
                <div className="flex items-center space-x-2">
                  <Calendar className="w-4 h-4" />
                  <span>
                    {tournament.start_date 
                      ? new Date(tournament.start_date).toLocaleDateString('it-IT')
                      : 'Data da definire'}
                  </span>
                </div>
                <div className="flex items-center space-x-2">
                  <MapPin className="w-4 h-4" />
                  <span>{tournament.city || 'Località'}, {tournament.province || 'PR'}</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Users className="w-4 h-4" />
                  <span>{teams?.length || 0}/{tournament.max_teams} squadre</span>
                </div>
              </div>
            </div>
            <span className={`px-3 py-1 rounded text-sm ${getStatusColor(tournament.status)}`}>
              {getStatusLabel(tournament.status)}
            </span>
          </div>
          
          {/* Action Buttons */}
          <div className="flex flex-wrap gap-3 mt-6">
            {isOwner && (
              <>
                <Link
                  href={`/tournaments/${params.id}/edit`}
                  className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 flex items-center space-x-2"
                >
                  <Edit className="w-4 h-4" />
                  <span>Modifica</span>
                </Link>
                <Link
                  href={`/tournaments/${params.id}/teams/add`}
                  className="px-4 py-2 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 flex items-center space-x-2"
                >
                  <Plus className="w-4 h-4" />
                  <span>Aggiungi Squadre</span>
                </Link>
                <Link
                  href={`/tournaments/${params.id}/teams`}
                  className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 flex items-center space-x-2"
                >
                  <Users className="w-4 h-4" />
                  <span>Gestisci Squadre</span>
                </Link>
                <Link
                  href={`/tournaments/${params.id}/collaborators`}
                  className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 flex items-center space-x-2"
                >
                  <Users className="w-4 h-4" />
                  <span>Co-organizzatori</span>
                </Link>
              </>
            )}
            {tournament.status === 'registration_open' && teams && teams.length >= tournament.min_teams && (
              <button className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 flex items-center space-x-2">
                <Play className="w-4 h-4" />
                <span>Inizia Torneo</span>
              </button>
            )}
          </div>
        </div>
        
        {/* Quick Links */}
        <div className="grid md:grid-cols-4 gap-4 mb-8">
          <Link 
            href={`/tournaments/${params.id}/matches`}
            className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 hover:shadow-md transition"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-2xl font-bold">{matches?.length || 0}</p>
                <p className="text-gray-600">Partite</p>
              </div>
              <ChevronRight className="w-5 h-5 text-gray-400" />
            </div>
          </Link>
          
          <Link 
            href={`/tournaments/${params.id}/standings`}
            className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 hover:shadow-md transition"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-2xl font-bold">Classifica</p>
                <p className="text-gray-600">Visualizza</p>
              </div>
              <ChevronRight className="w-5 h-5 text-gray-400" />
            </div>
          </Link>
          
          <Link 
            href={`/tournaments/${params.id}/players`}
            className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 hover:shadow-md transition"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-2xl font-bold">Giocatori</p>
                <p className="text-gray-600">Tutti</p>
              </div>
              <ChevronRight className="w-5 h-5 text-gray-400" />
            </div>
          </Link>
          
          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <div>
              <p className="text-2xl font-bold">{tournament.format}</p>
              <p className="text-gray-600">Formato</p>
            </div>
          </div>
        </div>
        
        {/* Teams Section */}
        {teams && teams.length > 0 && (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h2 className="text-xl font-semibold mb-4">Squadre Iscritte</h2>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
              {teams.map((entry) => (
                <div key={entry.id} className="border rounded-lg p-4">
                  <p className="font-medium">{entry.team?.name}</p>
                  <p className="text-sm text-gray-600">{entry.team?.city}</p>
                </div>
              ))}
            </div>
          </div>
        )}
      </main>
    </div>
  )
}
