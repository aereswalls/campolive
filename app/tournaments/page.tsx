import { createClient } from '@/utils/supabase/server'
import Link from 'next/link'
import { redirect } from 'next/navigation'
import Navbar from '@/components/Navbar'
import { Trophy, Plus, Calendar, Users } from 'lucide-react'

export default async function TournamentsPage() {
  const supabase = createClient()
  
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) {
    redirect('/login')
  }
  
  const { data: tournaments } = await supabase
    .from('tournaments')
    .select('*')
    .order('created_at', { ascending: false })
  
  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar userEmail={user.email} />
      
      <main className="container mx-auto px-4 py-8 max-w-7xl">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Tornei</h1>
            <p className="text-gray-600 mt-1">Organizza e partecipa a tornei sportivi</p>
          </div>
          <Link 
            href="/tournaments/new" 
            className="bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 font-medium flex items-center space-x-2"
          >
            <Plus className="w-5 h-5" />
            <span>Crea Torneo</span>
          </Link>
        </div>
        
        <div className="grid md:grid-cols-3 gap-6">
          {tournaments?.map((tournament) => (
            <Link
              key={tournament.id}
              href={`/tournaments/${tournament.id}`}
              className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md transition"
            >
              <div className="flex items-center justify-between mb-4">
                <Trophy className="w-8 h-8 text-yellow-500" />
                <span className="text-sm px-2 py-1 bg-gray-100 rounded">
                  {tournament.sport}
                </span>
              </div>
              <h3 className="text-xl font-bold mb-2">{tournament.name}</h3>
              <p className="text-gray-600 text-sm mb-4">{tournament.description}</p>
              <div className="flex justify-between text-sm text-gray-500">
                <span>{tournament.city}</span>
                <span>{tournament.status}</span>
              </div>
            </Link>
          ))}
        </div>
      </main>
    </div>
  )
}
