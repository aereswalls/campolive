import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import Navbar from '@/components/Navbar'
import AddTeamToTournament from '@/components/tournaments/AddTeamToTournament'
import { Plus, Users } from 'lucide-react'

interface PageProps {
  params: {
    id: string
  }
}

export default async function AddTeamToTournamentPage({ params }: PageProps) {
  const supabase = createClient()
  
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) {
    redirect('/login')
  }
  
  // Verifica che il torneo esista e l'utente sia il creatore
  const { data: tournament } = await supabase
    .from('tournaments')
    .select('*')
    .eq('id', params.id)
    .single()
  
  if (!tournament || tournament.created_by !== user.id) {
    redirect(`/tournaments/${params.id}`)
  }
  
  // Recupera tutte le squadre disponibili
  const { data: allTeams } = await supabase
    .from('teams')
    .select('*')
    .order('name')
  
  // Recupera le squadre già iscritte al torneo
  const { data: registeredTeams } = await supabase
    .from('tournament_teams')
    .select('team_id')
    .eq('tournament_id', params.id)
  
  const registeredTeamIds = registeredTeams?.map(rt => rt.team_id) || []
  
  // Filtra le squadre non ancora iscritte
  const availableTeams = allTeams?.filter(team => 
    !registeredTeamIds.includes(team.id)
  ) || []
  
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
              <h1 className="text-3xl font-bold mb-2">Aggiungi Squadre</h1>
              <p className="text-gray-600">{tournament.name}</p>
            </div>
            <Users className="w-8 h-8 text-blue-500" />
          </div>
        </div>
        
        <AddTeamToTournament
          tournamentId={params.id}
          availableTeams={availableTeams}
          maxTeams={tournament.max_teams}
          currentTeamsCount={registeredTeamIds.length}
        />
      </main>
    </div>
  )
}
