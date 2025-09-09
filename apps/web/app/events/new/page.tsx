import { createClient } from '@/utils/supabase/server'
import EventForm from '@/components/events/EventForm'
import { redirect } from 'next/navigation'
import Link from 'next/link'

export default async function NewEventPage() {
  const supabase = createClient()
  
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) {
    redirect('/login')
  }
  
  // Recupera i team
  const { data: teams } = await supabase
    .from('teams')
    .select('*')
    .order('name')
  
  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow">
        <div className="container mx-auto px-4 py-4">
          <div className="flex justify-between items-center">
            <h1 className="text-2xl font-bold text-green-600">
              🏟️ Nuovo Evento
            </h1>
            <Link 
              href="/events" 
              className="text-gray-600 hover:text-gray-900"
            >
              ← Torna agli Eventi
            </Link>
          </div>
        </div>
      </header>
      
      <main className="container mx-auto px-4 py-8 max-w-4xl">
        <div className="mb-6">
          <h2 className="text-3xl font-bold mb-2">Crea Nuovo Evento</h2>
          <p className="text-gray-600">
            Organizza un nuovo evento sportivo. La creazione è gratuita!
          </p>
        </div>
        
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
          <h3 className="text-sm font-medium text-blue-800 mb-1">
            📹 Come funziona
          </h3>
          <p className="text-sm text-blue-700">
            Crea l'evento gratuitamente. I crediti verranno consumati solo quando 
            inizierai una diretta dall'app mobile (1 credito = 1 diretta completa con highlights).
          </p>
        </div>
        
        <EventForm teams={teams || []} userId={user.id} />
      </main>
    </div>
  )
}
