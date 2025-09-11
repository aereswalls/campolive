import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import Navbar from '@/components/Navbar'
import PlayerForm from '@/components/players/PlayerForm'

export default async function TournamentPlayersPage({
  params,
  searchParams
}: {
  params: { id: string }
  searchParams: { teamId?: string }
}) {
  const supabase = createClient()
  
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) {
    redirect('/login')
  }
  
  const teamId = searchParams.teamId
  
  if (!teamId) {
    redirect(`/tournaments/${params.id}`)
  }
  
  const { data: team } = await supabase
    .from('teams')
    .select('*')
    .eq('id', teamId)
    .single()
  
  const { data: players } = await supabase
    .from('players')
    .select('*')
    .eq('team_id', teamId)
    .order('jersey_number')
  
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
          <h1 className="text-3xl font-bold mb-2">Rosa {team?.name}</h1>
          <p className="text-gray-600">Gestisci i giocatori della squadra</p>
        </div>
        
        <div className="grid md:grid-cols-2 gap-8">
          <div>
            <h2 className="text-xl font-bold mb-4">Aggiungi Giocatore</h2>
            <PlayerForm teamId={teamId} />
          </div>
          
          <div>
            <h2 className="text-xl font-bold mb-4">Giocatori ({players?.length || 0})</h2>
            <div className="space-y-2">
              {players?.map((player) => (
                <div key={player.id} className="bg-white border border-gray-200 rounded-lg p-4">
                  <div className="flex justify-between items-center">
                    <div>
                      <span className="font-bold mr-3">#{player.jersey_number}</span>
                      <span className="font-medium">{player.first_name} {player.last_name}</span>
                    </div>
                    <span className="text-sm text-gray-500">{player.position}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
