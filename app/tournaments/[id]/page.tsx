import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import Navbar from '@/components/Navbar'
import { Trophy, Users, Calendar, MapPin, Plus } from 'lucide-react'

export default async function TournamentDetailPage({
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
    .select(`
      *,
      tournament_teams (
        *,
        team:teams (*)
      )
    `)
    .eq('id', params.id)
    .single()
  
  if (!tournament) {
    redirect('/tournaments')
  }
  
  const isOwner = tournament.created_by === user.id
  
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
              <p className="text-gray-600">{tournament.description}</p>
            </div>
            <div className="flex items-center space-x-2">
              <Trophy className="w-8 h-8 text-yellow-500" />
              <span className="text-lg font-medium">{tournament.sport}</span>
            </div>
          </div>
          
          <div className="grid md:grid-cols-4 gap-4 mb-6">
            <div className="flex items-center space-x-2 text-gray-600">
              <Calendar className="w-5 h-5" />
              <span>{tournament.start_date || 'Da definire'}</span>
            </div>
            <div className="flex items-center space-x-2 text-gray-600">
              <MapPin className="w-5 h-5" />
              <span>{tournament.city}</span>
            </div>
            <div className="flex items-center space-x-2 text-gray-600">
              <Users className="w-5 h-5" />
              <span>{tournament.tournament_teams?.length || 0}/{tournament.max_teams} squadre</span>
            </div>
            <div>
              <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm">
                {tournament.status}
              </span>
            </div>
          </div>
          
          {isOwner && (
            <div className="flex space-x-4">
              <Link
                href={`/tournaments/${params.id}/teams`}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                Gestisci Squadre
              </Link>
              <Link
                href={`/tournaments/${params.id}/standings`}
                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
              >
                Classifica
              </Link>
            </div>
          )}
        </div>
        
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-bold">Squadre Iscritte</h2>
            {isOwner && (
              <Link
                href={`/tournaments/${params.id}/teams/add`}
                className="flex items-center space-x-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
              >
                <Plus className="w-4 h-4" />
                <span>Aggiungi Squadra</span>
              </Link>
            )}
          </div>
          
          <div className="grid md:grid-cols-2 gap-4">
            {tournament.tournament_teams?.map((tt: any) => (
              <Link
                key={tt.id}
                href={`/tournaments/${params.id}/teams/${tt.team.id}`}
                className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition"
              >
                <div className="flex items-center justify-between mb-2">
                  <h3 className="font-semibold">{tt.team.name}</h3>
                  <span className={`px-2 py-1 rounded text-xs ${
                    tt.registration_status === 'approved' 
                      ? 'bg-green-100 text-green-700' 
                      : 'bg-yellow-100 text-yellow-700'
                  }`}>
                    {tt.registration_status}
                  </span>
                </div>
                <p className="text-sm text-gray-600">
                  {tt.team.city} • {tt.matches_played || 0} partite giocate
                </p>
              </Link>
            ))}
          </div>
        </div>
      </main>
    </div>
  )
}
