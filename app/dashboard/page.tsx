import { redirect } from 'next/navigation'
import { createClient } from '@/utils/supabase/server'
import Link from 'next/link'
import Navbar from '@/components/Navbar'
import { CreditCard, Calendar, Users, Video, Trophy } from 'lucide-react'

export default async function DashboardPage() {
  const supabase = createClient()
  
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) {
    redirect('/login')
  }

  const { data: profile } = await supabase
    .from('user_profiles')
    .select('*')
    .eq('id', user.id)
    .single()

  let { data: credits } = await supabase
    .from('user_credits')
    .select('*')
    .eq('user_id', user.id)
    .single()

  if (!credits) {
    const { data: newCredits } = await supabase
      .from('user_credits')
      .insert({
        user_id: user.id,
        balance: 3,
        total_earned: 3,
        total_purchased: 0,
        total_consumed: 0
      })
      .select()
      .single()
    
    credits = newCredits
  }

  // Statistiche
  const { count: eventsCount } = await supabase
    .from('events')
    .select('*', { count: 'exact', head: true })
    .eq('created_by', user.id)

  const { count: teamsCount } = await supabase
    .from('team_members')
    .select('*', { count: 'exact', head: true })
    .eq('user_id', user.id)
  
  // Conta TUTTI i tornei (creati + co-organizzatore)
  const { data: ownTournaments } = await supabase
    .from('tournaments')
    .select('id')
    .eq('created_by', user.id)
  
  const { data: collaborations } = await supabase
    .from('tournament_collaborators')
    .select('tournament_id')
    .eq('user_id', user.id)
    .eq('status', 'accepted')
  
  const totalTournamentsCount = (ownTournaments?.length || 0) + (collaborations?.length || 0)
  
  // Eventi recenti dell'utente
  const { data: recentEvents } = await supabase
    .from('events')
    .select(`
      *,
      home_team:teams!home_team_id(*),
      away_team:teams!away_team_id(*)
    `)
    .eq('created_by', user.id)
    .order('scheduled_at', { ascending: false })
    .limit(3)
  
  // Tornei attivi (creati + co-organizzatore)
  const { data: ownActiveTournaments } = await supabase
    .from('tournaments')
    .select('*')
    .eq('created_by', user.id)
    .in('status', ['registration_open', 'in_progress'])
  
  let collaborativeTournaments = []
  if (collaborations && collaborations.length > 0) {
    const ids = collaborations.map(c => c.tournament_id)
    const { data } = await supabase
      .from('tournaments')
      .select('*')
      .in('id', ids)
      .in('status', ['registration_open', 'in_progress'])
    collaborativeTournaments = data || []
  }
  
  const activeTournaments = [
    ...(ownActiveTournaments || []).map(t => ({ ...t, isOwner: true })),
    ...collaborativeTournaments.map(t => ({ ...t, isCollaborator: true }))
  ].slice(0, 3)

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar userEmail={user.email} />

      <main className="container mx-auto px-4 py-8 max-w-7xl">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Benvenuto {profile?.full_name || 'su CampoLive'}!
          </h1>
          <p className="text-gray-600">
            Gestisci i tuoi eventi e tornei sportivi
          </p>
        </div>

        <div className="grid md:grid-cols-4 gap-4 mb-8">
          <Link href="/credits" className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md transition">
            <div className="flex items-center justify-between mb-4">
              <div className="bg-green-100 p-3 rounded-lg">
                <CreditCard className="w-6 h-6 text-green-600" />
              </div>
              <span className="text-3xl font-bold text-gray-900">
                {credits?.balance || 0}
              </span>
            </div>
            <p className="text-gray-600 text-sm">Crediti disponibili</p>
            <p className="text-green-600 text-sm mt-1">Acquista crediti →</p>
          </Link>

          <Link href="/events" className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md transition">
            <div className="flex items-center justify-between mb-4">
              <div className="bg-blue-100 p-3 rounded-lg">
                <Calendar className="w-6 h-6 text-blue-600" />
              </div>
              <span className="text-3xl font-bold text-gray-900">
                {eventsCount || 0}
              </span>
            </div>
            <p className="text-gray-600 text-sm">I tuoi eventi</p>
            <p className="text-blue-600 text-sm mt-1">Vedi tutti →</p>
          </Link>

          <Link href="/tournaments" className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md transition">
            <div className="flex items-center justify-between mb-4">
              <div className="bg-yellow-100 p-3 rounded-lg">
                <Trophy className="w-6 h-6 text-yellow-600" />
              </div>
              <span className="text-3xl font-bold text-gray-900">
                {totalTournamentsCount}
              </span>
            </div>
            <p className="text-gray-600 text-sm">Tornei totali</p>
            <p className="text-yellow-600 text-sm mt-1">Gestisci →</p>
          </Link>

          <Link href="/teams" className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md transition">
            <div className="flex items-center justify-between mb-4">
              <div className="bg-purple-100 p-3 rounded-lg">
                <Users className="w-6 h-6 text-purple-600" />
              </div>
              <span className="text-3xl font-bold text-gray-900">
                {teamsCount || 0}
              </span>
            </div>
            <p className="text-gray-600 text-sm">I tuoi team</p>
            <p className="text-purple-600 text-sm mt-1">Gestisci →</p>
          </Link>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-8">
          <h2 className="text-lg font-semibold mb-4">Azioni rapide</h2>
          <div className="grid md:grid-cols-5 gap-4">
            <Link 
              href="/tournaments/new"
              className="border-2 border-yellow-600 text-yellow-600 p-4 rounded-lg hover:bg-yellow-50 text-center font-medium transition flex flex-col items-center"
            >
              <Trophy className="w-6 h-6 mb-2" />
              Crea Torneo
            </Link>
            <Link 
              href="/events/new"
              className="border-2 border-green-600 text-green-600 p-4 rounded-lg hover:bg-green-50 text-center font-medium transition flex flex-col items-center"
            >
              <Calendar className="w-6 h-6 mb-2" />
              Nuovo Evento
            </Link>
            <Link 
              href="/teams/new"
              className="border-2 border-purple-600 text-purple-600 p-4 rounded-lg hover:bg-purple-50 text-center font-medium transition flex flex-col items-center"
            >
              <Users className="w-6 h-6 mb-2" />
              Crea Team
            </Link>
            <Link 
              href="/credits"
              className="border-2 border-blue-600 text-blue-600 p-4 rounded-lg hover:bg-blue-50 text-center font-medium transition flex flex-col items-center"
            >
              <CreditCard className="w-6 h-6 mb-2" />
              Acquista Crediti
            </Link>
            <button 
              disabled
              className="border-2 border-gray-300 text-gray-400 p-4 rounded-lg cursor-not-allowed text-center font-medium flex flex-col items-center"
            >
              <Video className="w-6 h-6 mb-2" />
              Vai Live (Presto)
            </button>
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-8">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold">I tuoi prossimi eventi</h2>
              <Calendar className="w-5 h-5 text-gray-400" />
            </div>
            {recentEvents && recentEvents.length > 0 ? (
              <div className="space-y-3">
                {recentEvents.map((event) => (
                  <Link 
                    key={event.id}
                    href={`/events/${event.id}`}
                    className="block p-3 border rounded-lg hover:bg-gray-50 transition"
                  >
                    <div className="font-medium text-sm">
                      {event.home_team?.name} vs {event.away_team?.name}
                    </div>
                    <div className="text-xs text-gray-500 mt-1">
                      {new Date(event.scheduled_at).toLocaleDateString('it-IT')}
                    </div>
                  </Link>
                ))}
              </div>
            ) : (
              <div className="text-gray-500 text-center py-8">
                <Calendar className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                <p>Nessun evento programmato</p>
                <Link href="/events/new" className="text-sm text-green-600 mt-2 inline-block">
                  Crea il tuo primo evento
                </Link>
              </div>
            )}
          </div>

          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold">Tornei attivi</h2>
              <Trophy className="w-5 h-5 text-gray-400" />
            </div>
            {activeTournaments && activeTournaments.length > 0 ? (
              <div className="space-y-3">
                {activeTournaments.map((tournament: any) => (
                  <Link 
                    key={tournament.id}
                    href={`/tournaments/${tournament.id}`}
                    className="block p-3 border rounded-lg hover:bg-gray-50 transition"
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="font-medium text-sm">{tournament.name}</div>
                        <div className="text-xs text-gray-500 mt-1">
                          {tournament.sport} • {tournament.city}
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        {tournament.isOwner && (
                          <span className="text-xs px-2 py-1 bg-yellow-100 text-yellow-700 rounded">
                            Owner
                          </span>
                        )}
                        {tournament.isCollaborator && (
                          <span className="text-xs px-2 py-1 bg-blue-100 text-blue-700 rounded">
                            Co-org
                          </span>
                        )}
                        <span className={`text-xs px-2 py-1 rounded ${
                          tournament.status === 'in_progress' 
                            ? 'bg-green-100 text-green-700' 
                            : 'bg-blue-100 text-blue-700'
                        }`}>
                          {tournament.status === 'in_progress' ? 'In corso' : 'Iscrizioni'}
                        </span>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            ) : (
              <div className="text-gray-500 text-center py-8">
                <Trophy className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                <p>Nessun torneo attivo</p>
                <Link href="/tournaments/new" className="text-sm text-yellow-600 mt-2 inline-block">
                  Organizza un torneo
                </Link>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  )
}
