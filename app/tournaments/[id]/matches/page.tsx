import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import Navbar from '@/components/Navbar'
import MatchForm from '@/components/tournaments/MatchForm'
import MatchList from '@/components/tournaments/MatchList'
import { Calendar, Plus } from 'lucide-react'

export default async function TournamentMatchesPage({
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
  
  const { data: matches } = await supabase
    .from('tournament_matches')
    .select(`
      *,
      home_team:teams!tournament_matches_home_team_id_fkey (*),
      away_team:teams!tournament_matches_away_team_id_fkey (*)
    `)
    .eq('tournament_id', params.id)
    .order('match_date', { ascending: false })
  
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
            href={`/tournaments/${params.id}`}
            className="text-gray-600 hover:text-gray-900"
          >
            ← Torna al Torneo
          </Link>
        </div>
        
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8 mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold mb-2">Calendario Partite</h1>
              <p className="text-gray-600">{tournament.name}</p>
            </div>
            <Calendar className="w-8 h-8 text-blue-500" />
          </div>
        </div>
        
        {isOwner && (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-8">
            <h2 className="text-xl font-bold mb-4">Aggiungi Partita</h2>
            <MatchForm 
              tournamentId={params.id} 
              teams={tournament.tournament_teams?.filter((tt: any) => tt.registration_status === 'approved').map((tt: any) => tt.team) || []}
            />
          </div>
        )}
        
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h2 className="text-xl font-bold mb-4">Partite ({matches?.length || 0})</h2>
          <MatchList matches={matches || []} isOwner={isOwner} />
        </div>
      </main>
    </div>
  )
}
