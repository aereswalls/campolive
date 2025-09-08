import { redirect } from 'next/navigation'
import { createClient } from '@/utils/supabase/server'
import Link from 'next/link'

export default async function DashboardPage() {
  const supabase = createClient()
  
  // Verifica autenticazione
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) {
    redirect('/login')
  }

  // Recupera dati utente
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

  // Se non ci sono crediti, creali al volo
  if (!credits) {
    const { data: newCredits } = await supabase
      .from('user_credits')
      .insert({
        user_id: user.id,
        balance: 10,
        total_earned: 10,
        total_purchased: 0,
        total_consumed: 0
      })
      .select()
      .single()
    
    credits = newCredits
  }

  // Logout handler (client component)
  async function signOut() {
    'use server'
    const supabase = createClient()
    await supabase.auth.signOut()
    redirect('/login')
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <h1 className="text-2xl font-bold text-green-600">
            🏟️ CampoLive Dashboard
          </h1>
          <div className="flex items-center space-x-4">
            <span className="text-gray-600">
              {user.email}
            </span>
            <form action={signOut}>
              <button className="text-red-600 hover:text-red-700">
                Esci
              </button>
            </form>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        {/* Welcome Section */}
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <h2 className="text-2xl font-bold mb-2">
            Benvenuto {profile?.full_name || 'su CampoLive'}!
          </h2>
          <p className="text-gray-600">
            Gestisci i tuoi eventi sportivi e trasmetti le partite in diretta.
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid md:grid-cols-4 gap-6 mb-6">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="text-3xl font-bold text-green-600">
              {credits?.balance || 0}
            </div>
            <div className="text-gray-600">Crediti disponibili</div>
            <Link href="/credits" className="text-sm text-green-600 hover:text-green-700 mt-2 inline-block">
              Acquista crediti →
            </Link>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="text-3xl font-bold">0</div>
            <div className="text-gray-600">Eventi creati</div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="text-3xl font-bold">0</div>
            <div className="text-gray-600">Team</div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="text-3xl font-bold">0</div>
            <div className="text-gray-600">Video salvati</div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-xl font-bold mb-4">Azioni rapide</h3>
          <div className="grid md:grid-cols-3 gap-4">
            <button className="border-2 border-green-600 text-green-600 p-4 rounded-lg hover:bg-green-50">
              📹 Nuovo Evento
            </button>
            <button className="border-2 border-blue-600 text-blue-600 p-4 rounded-lg hover:bg-blue-50">
              👥 Crea Team
            </button>
            <button className="border-2 border-purple-600 text-purple-600 p-4 rounded-lg hover:bg-purple-50">
              📡 Vai Live
            </button>
          </div>
        </div>
      </main>
    </div>
  )
}