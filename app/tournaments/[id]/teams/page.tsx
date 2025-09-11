import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import Navbar from '@/components/Navbar'
import { Check, X, Clock, Users } from 'lucide-react'

export default async function TournamentTeamsManagementPage({
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
  
  if (!tournament || tournament.created_by !== user.id) {
    redirect(`/tournaments/${params.id}`)
  }
  
  const handleApprove = async (teamId: string) => {
    'use server'
    const supabase = createClient()
    await supabase
      .from('tournament_teams')
      .update({ 
        registration_status: 'approved',
        approved_by: user.id,
        approved_at: new Date().toISOString()
      })
      .eq('tournament_id', params.id)
      .eq('team_id', teamId)
  }
  
  const handleReject = async (teamId: string) => {
    'use server'
    const supabase = createClient()
    await supabase
      .from('tournament_teams')
      .update({ 
        registration_status: 'rejected',
        approved_by: user.id,
        approved_at: new Date().toISOString()
      })
      .eq('tournament_id', params.id)
      .eq('team_id', teamId)
  }
  
  const pendingTeams = tournament.tournament_teams?.filter((tt: any) => tt.registration_status === 'pending')
  const approvedTeams = tournament.tournament_teams?.filter((tt: any) => tt.registration_status === 'approved')
  const rejectedTeams = tournament.tournament_teams?.filter((tt: any) => tt.registration_status === 'rejected')
  
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
          <h1 className="text-3xl font-bold mb-2">Gestione Squadre</h1>
          <p className="text-gray-600">{tournament.name}</p>
        </div>
        
        {/* Squadre in attesa */}
        {pendingTeams && pendingTeams.length > 0 && (
          <div className="bg-yellow-50 rounded-lg shadow-sm border border-yellow-200 p-6 mb-8">
            <div className="flex items-center space-x-2 mb-4">
              <Clock className="w-5 h-5 text-yellow-600" />
              <h2 className="text-xl font-bold text-yellow-900">Richieste in Attesa ({pendingTeams.length})</h2>
            </div>
            <div className="space-y-3">
              {pendingTeams.map((tt: any) => (
                <div key={tt.id} className="bg-white rounded-lg p-4 flex items-center justify-between">
                  <div>
                    <h3 className="font-semibold">{tt.team.name}</h3>
                    <p className="text-sm text-gray-600">{tt.team.city} • Richiesta: {new Date(tt.registration_date).toLocaleDateString('it-IT')}</p>
                  </div>
                  <div className="flex space-x-2">
                    <form action={handleApprove.bind(null, tt.team_id)}>
                      <button className="px-3 py-1 bg-green-600 text-white rounded hover:bg-green-700 flex items-center space-x-1">
                        <Check className="w-4 h-4" />
                        <span>Approva</span>
                      </button>
                    </form>
                    <form action={handleReject.bind(null, tt.team_id)}>
                      <button className="px-3 py-1 bg-red-600 text-white rounded hover:bg-red-700 flex items-center space-x-1">
                        <X className="w-4 h-4" />
                        <span>Rifiuta</span>
                      </button>
                    </form>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
        
        {/* Squadre approvate */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-8">
          <div className="flex items-center space-x-2 mb-4">
            <Users className="w-5 h-5 text-green-600" />
            <h2 className="text-xl font-bold">Squadre Confermate ({approvedTeams?.length || 0}/{tournament.max_teams})</h2>
          </div>
          <div className="grid md:grid-cols-2 gap-3">
            {approvedTeams?.map((tt: any) => (
              <div key={tt.id} className="border rounded-lg p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-semibold">{tt.team.name}</h3>
                    <p className="text-sm text-gray-600">{tt.team.city}</p>
                  </div>
                  <span className="px-2 py-1 bg-green-100 text-green-700 rounded text-xs">
                    Confermata
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
        
        {/* Squadre rifiutate */}
        {rejectedTeams && rejectedTeams.length > 0 && (
          <div className="bg-gray-50 rounded-lg shadow-sm border border-gray-200 p-6">
            <h2 className="text-xl font-bold mb-4 text-gray-700">Squadre Rifiutate ({rejectedTeams.length})</h2>
            <div className="space-y-2">
              {rejectedTeams.map((tt: any) => (
                <div key={tt.id} className="bg-white border rounded p-3 text-gray-500">
                  <span className="line-through">{tt.team.name}</span>
                  <span className="ml-2 text-sm">({tt.team.city})</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </main>
    </div>
  )
}
