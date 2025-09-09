import { createClient } from '@/utils/supabase/server'
import TeamForm from '@/components/teams/TeamForm'
import { redirect } from 'next/navigation'
import Link from 'next/link'

export default async function NewTeamPage() {
  const supabase = createClient()
  
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) {
    redirect('/login')
  }
  
  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow">
        <div className="container mx-auto px-4 py-4">
          <div className="flex justify-between items-center">
            <h1 className="text-2xl font-bold text-green-600">
              👥 Nuovo Team
            </h1>
            <Link 
              href="/teams" 
              className="text-gray-600 hover:text-gray-900"
            >
              ← Torna ai Team
            </Link>
          </div>
        </div>
      </header>
      
      <main className="container mx-auto px-4 py-8 max-w-4xl">
        <div className="mb-6">
          <h2 className="text-3xl font-bold mb-2">Crea Nuovo Team</h2>
          <p className="text-gray-600">
            Crea un team per gestire i tuoi eventi sportivi
          </p>
        </div>
        
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
          <h3 className="text-sm font-medium text-blue-800 mb-1">
            💡 Suggerimento
          </h3>
          <p className="text-sm text-blue-700">
            Dopo aver creato il team, potrai invitare altri membri e assegnare loro ruoli specifici.
          </p>
        </div>
        
        <TeamForm userId={user.id} />
      </main>
    </div>
  )
}
