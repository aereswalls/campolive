import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import Navbar from '@/components/Navbar'
import MatchForm from '@/components/tournaments/MatchForm'
import MatchList from '@/components/tournaments/MatchList'
import MatchGenerator from '@/components/tournaments/MatchGenerator'
import { Calendar, Plus, Wand2 } from 'lucide-react'
import { checkTournamentPermissions } from '@/utils/tournament-permissions'

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
  
  if (!tournament) {
    redirect('/tournaments')
  }
  
  // Usa la funzione helper per verificare i permessi
  const permissions = await checkTournamentPermissions(params.id, user.id)
  
  if (!permissions.canManage) {
    redirect(`/tournaments/${params.id}`)
  }
  
  const { data: matches } = await supabase
    .from('tournament_matches')
    .select(`
      *,
      home_team:teams!tournament_matches_home_team_id_fkey (*),
      away_team:teams!tournament_matches_away_team_id_fkey (*)
    `)
    .eq('tournament_id', params.id)
    .order('match_date', { ascending: false })
  
  const approvedTeams = tournament.tournament_teams?.filter((tt: any) => 
    tt.registration_status === 'approved'
  ).map((tt: any) => tt.team) || []
  
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
              <p className="text-sm text-gray-500 mt-1">
                {approvedTeams.length} squadre partecipanti • {matches?.length || 0} partite programmate
              </p>
              {!permissions.isOwner && (
                <p className="text-xs text-blue-600 mt-2">
                  Stai gestendo come co-organizzatore
                </p>
              )}
            </div>
            <Calendar className="w-8 h-8 text-blue-500" />
          </div>
        </div>
        
        {/* Sia owner che collaboratori possono gestire le partite */}
        {permissions.canManage && approvedTeams.length >= 2 && (
          <div className="grid md:grid-cols-2 gap-8 mb-8">
            {/* Creazione Manuale */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <div className="flex items-center space-x-2 mb-4">
                <Plus className="w-5 h-5 text-green-600" />
                <h2 className="text-xl font-bold">Aggiungi Partita Manualmente</h2>
              </div>
              <MatchForm 
                tournamentId={params.id} 
                teams={approvedTeams}
              />
            </div>
            
            {/* Generazione Automatica */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <div className="flex items-center space-x-2 mb-4">
                <Wand2 className="w-5 h-5 text-purple-600" />
                <h2 className="text-xl font-bold">Genera Calendario Automatico</h2>
              </div>
              <MatchGenerator
                tournamentId={params.id}
                teams={approvedTeams}
                existingMatches={matches || []}
              />
            </div>
          </div>
        )}
        
        {approvedTeams.length < 2 && permissions.canManage && (
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6 mb-8">
            <p className="text-yellow-800">
              Servono almeno 2 squadre approvate per creare partite. 
              Attualmente hai {approvedTeams.length} squadra/e.
            </p>
            <Link 
              href={`/tournaments/${params.id}/teams/add`}
              className="inline-block mt-3 px-4 py-2 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700"
            >
              Aggiungi Squadre
            </Link>
          </div>
        )}
        
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h2 className="text-xl font-bold mb-4">Partite ({matches?.length || 0})</h2>
          <MatchList 
            matches={matches || []} 
            canManage={permissions.canManage}
          />
        </div>
      </main>
    </div>
  )
}
