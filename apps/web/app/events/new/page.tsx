import { createClient } from '@/utils/supabase/server'
import EventForm from '@/components/events/EventForm'
import { redirect } from 'next/navigation'
import Link from 'next/link'

export default async function NewEventPage() {
  const supabase = createClient()
  
  // Verifica autenticazione
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) {
    redirect('/login')
  }
  
  // Verifica crediti
  const { data: credits } = await supabase
    .from('user_credits')
    .select('balance')
    .eq('user_id', user.id)
    .single()
  
  // Se non ci sono abbastanza crediti, redirect alla pagina crediti
  if (!credits || credits.balance < 5) {
    redirect('/dashboard?error=insufficient_credits')
  }
  
  // Recupera i team (per ora vuoto, sarà implementato dopo)
  const { data: teams } = await supabase
    .from('teams')
    .select('*')
    .order('name')
  
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
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
      
      {/* Main Content */}
      <main className="container mx-auto px-4 py-8 max-w-4xl">
        <div className="mb-6">
          <h2 className="text-3xl font-bold mb-2">Crea Nuovo Evento</h2>
          <p className="text-gray-600">
            Organizza un nuovo evento sportivo per la tua squadra
          </p>
        </div>
        
        {/* Credits Alert */}
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
          <div className="flex items-start">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-yellow-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-yellow-800">
                Utilizzo Crediti
              </h3>
              <div className="mt-2 text-sm text-yellow-700">
                <p>
                  La creazione di questo evento consumerà <strong>5 crediti</strong>.
                </p>
                <p className="mt-1">
                  Hai attualmente <strong>{credits.balance} crediti</strong> disponibili.
                </p>
              </div>
            </div>
          </div>
        </div>
        
        {/* Form */}
        <EventForm teams={teams || []} userId={user.id} />
      </main>
    </div>
  )
}