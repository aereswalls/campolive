import { createClient } from '@/utils/supabase/server'
import Link from 'next/link'
import { redirect } from 'next/navigation'
import TeamList from '@/components/teams/TeamList'

export default async function TeamsPage() {
  const supabase = createClient()
  
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) {
    redirect('/login')
  }
  
  // Recupera i team dell'utente
  const { data: userTeams } = await supabase
    .from('team_members')
    .select(`
      role,
      team:teams(*)
    `)
    .eq('user_id', user.id)
    .eq('is_active', true)
  
  // Trasforma i dati per il componente
  const teams = userTeams?.map(item => ({
    ...item.team,
    role: item.role
  })) || []
  
  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow">
        <div className="container mx-auto px-4 py-4">
          <div className="flex justify-between items-center">
            <h1 className="text-2xl font-bold text-green-600">
              👥 I Miei Team
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
      
      <main className="container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h2 className="text-3xl font-bold">Team</h2>
            <p className="text-gray-600 mt-1">
              Gestisci i tuoi team sportivi
            </p>
          </div>
          <Link 
            href="/teams/new" 
            className="bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 font-medium"
          >
            + Nuovo Team
          </Link>
        </div>
        
        <TeamList teams={teams} userTeams={true} />
      </main>
    </div>
  )
}
