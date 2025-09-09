import { createClient } from '@/utils/supabase/server'
import Link from 'next/link'
import { redirect } from 'next/navigation'
import EventList from '@/components/events/EventList'

export default async function EventsPage() {
  const supabase = createClient()
  
  // Verifica autenticazione
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) {
    redirect('/login')
  }
  
  // Recupera eventi
  const { data: events, error } = await supabase
    .from('events')
    .select(`
      *,
      home_team:teams!home_team_id(*),
      away_team:teams!away_team_id(*)
    `)
    .eq('created_by', user.id)
    .order('scheduled_at', { ascending: false })
  
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow">
        <div className="container mx-auto px-4 py-4">
          <div className="flex justify-between items-center">
            <h1 className="text-2xl font-bold text-green-600">
              🏟️ I Miei Eventi
            </h1>
            <Link 
              href="/dashboard" 
              className="text-gray-600 hover:text-gray-900"
            >
              ← Torna alla Dashboard
            </Link>
          </div>
        </div>
      </header>
      
      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h2 className="text-3xl font-bold">Eventi</h2>
            <p className="text-gray-600 mt-1">
              Gestisci i tuoi eventi sportivi
            </p>
          </div>
          <Link 
            href="/events/new" 
            className="bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 font-medium"
          >
            + Nuovo Evento
          </Link>
        </div>
        
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
            <p className="text-red-700">Errore nel caricamento degli eventi: {error.message}</p>
          </div>
        )}
        
        <EventList events={events || []} />
      </main>
    </div>
  )
}