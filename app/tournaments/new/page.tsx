import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import Navbar from '@/components/Navbar'
import TournamentForm from '@/components/tournaments/TournamentForm'

export default async function NewTournamentPage() {
  const supabase = createClient()
  
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) {
    redirect('/login')
  }
  
  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar userEmail={user.email} />
      
      <main className="container mx-auto px-4 py-8 max-w-4xl">
        <div className="mb-6">
          <Link 
            href="/tournaments" 
            className="text-gray-600 hover:text-gray-900"
          >
            ← Torna ai Tornei
          </Link>
        </div>
        
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8">
          <h1 className="text-3xl font-bold mb-2">Crea Nuovo Torneo</h1>
          <p className="text-gray-600 mb-8">
            Organizza un torneo per il tuo sport preferito
          </p>
          
          <TournamentForm userId={user.id} />
        </div>
      </main>
    </div>
  )
}
