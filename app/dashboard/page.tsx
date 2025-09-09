import { redirect } from 'next/navigation'
import { createClient } from '@/utils/supabase/server'
import Link from 'next/link'
import Navbar from '@/components/Navbar'
import { CreditCard, Calendar, Users, Video, TrendingUp, Activity } from 'lucide-react'

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
        balance: 10,
        total_earned: 10,
        total_purchased: 0,
        total_consumed: 0
      })
      .select()
      .single()
    
    credits = newCredits
  }

  const { count: eventsCount } = await supabase
    .from('events')
    .select('*', { count: 'exact', head: true })
    .eq('created_by', user.id)

  const { count: teamsCount } = await supabase
    .from('team_members')
    .select('*', { count: 'exact', head: true })
    .eq('user_id', user.id)

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar userEmail={user.email} />

      <main className="container mx-auto px-4 py-8 max-w-7xl">
        {/* Welcome Section */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Benvenuto {profile?.full_name || 'su CampoLive'}!
          </h1>
          <p className="text-gray-600">
            Ecco un riepilogo della tua attività
          </p>
        </div>

        {/* Stats Grid */}
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
            <p className="text-gray-600 text-sm">Eventi creati</p>
            <p className="text-blue-600 text-sm mt-1">Vedi tutti →</p>
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

          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="bg-orange-100 p-3 rounded-lg">
                <Video className="w-6 h-6 text-orange-600" />
              </div>
              <span className="text-3xl font-bold text-gray-900">0</span>
            </div>
            <p className="text-gray-600 text-sm">Video salvati</p>
            <p className="text-gray-400 text-sm mt-1">Presto disponibile</p>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-8">
          <h2 className="text-lg font-semibold mb-4">Azioni rapide</h2>
          <div className="grid md:grid-cols-4 gap-4">
            <Link 
              href="/events/new"
              className="border-2 border-green-600 text-green-600 p-4 rounded-lg hover:bg-green-50 text-center font-medium transition"
            >
              ➕ Nuovo Evento
            </Link>
            <Link 
              href="/teams/new"
              className="border-2 border-purple-600 text-purple-600 p-4 rounded-lg hover:bg-purple-50 text-center font-medium transition"
            >
              👥 Crea Team
            </Link>
            <Link 
              href="/credits"
              className="border-2 border-blue-600 text-blue-600 p-4 rounded-lg hover:bg-blue-50 text-center font-medium transition"
            >
              💳 Acquista Crediti
            </Link>
            <button 
              disabled
              className="border-2 border-gray-300 text-gray-400 p-4 rounded-lg cursor-not-allowed text-center font-medium"
            >
              📡 Vai Live (Presto)
            </button>
          </div>
        </div>

        {/* Recent Activity */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold">Attività Recente</h2>
            <Activity className="w-5 h-5 text-gray-400" />
          </div>
          <div className="text-gray-500 text-center py-12">
            <Activity className="w-12 h-12 mx-auto mb-3 text-gray-300" />
            <p>Nessuna attività recente</p>
            <p className="text-sm mt-2">Le tue attività appariranno qui</p>
          </div>
        </div>
      </main>
    </div>
  )
}
