import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import Navbar from '@/components/Navbar'
import TournamentEditForm from '@/components/tournaments/TournamentEditForm'
import { checkTournamentPermissions } from '@/utils/tournament-permissions'

export default async function EditTournamentPage({
  params
}: {
  params: { id: string }
}) {
  const supabase = createClient()
  
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) {
    redirect('/login')
  }
  
  const { data: tournament } = await supabase
    .from('tournaments')
    .select('*')
    .eq('id', params.id)
    .single()
  
  if (!tournament) {
    redirect('/tournaments')
  }
  
  const permissions = await checkTournamentPermissions(params.id, user.id)
  
  if (!permissions.canManage) {
    redirect(`/tournaments/${params.id}`)
  }
  
  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar userEmail={user.email} />
      
      <main className="container mx-auto px-4 py-8 max-w-4xl">
        <div className="mb-6">
          <Link 
            href={`/tournaments/${params.id}`}
            className="text-gray-600 hover:text-gray-900"
          >
            ← Torna al Torneo
          </Link>
        </div>
        
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8">
          <h1 className="text-3xl font-bold mb-2">Modifica Torneo</h1>
          <p className="text-gray-600 mb-8">
            {tournament.name}
            {!permissions.isOwner && (
              <span className="ml-2 text-sm text-blue-600">
                (Sei un co-organizzatore)
              </span>
            )}
          </p>
          
          <TournamentEditForm 
            tournament={tournament}
            isOwner={permissions.isOwner}
            canManage={permissions.canManage}
          />
        </div>
      </main>
    </div>
  )
}
