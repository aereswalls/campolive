import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import Navbar from '@/components/Navbar'
import TournamentEditForm from '@/components/tournaments/TournamentEditForm'
import InviteCollaborator from '@/components/tournaments/InviteCollaborator'
import { Edit, Users } from 'lucide-react'

interface PageProps {
  params: {
    id: string
  }
}

export default async function EditTournamentPage({ params }: PageProps) {
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
  
  if (!tournament || tournament.created_by !== user.id) {
    redirect(`/tournaments/${params.id}`)
  }
  
  // Recupera i co-organizzatori esistenti
  const { data: collaborators } = await supabase
    .from('tournament_collaborators')
    .select(`
      *,
      user_profiles!tournament_collaborators_user_id_fkey (
        email,
        full_name
      )
    `)
    .eq('tournament_id', params.id)
    .eq('status', 'accepted')
  
  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar userEmail={user.email} />
      
      <main className="container mx-auto px-4 py-8 max-w-7xl">
        <div className="mb-6">
          <Link 
            href={`/tournaments/${params.id}`}
            className="text-gray-600 hover:text-gray-900"
          >
            ← Torna al Torneo
          </Link>
        </div>
        
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Colonna principale - Form modifica */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8">
              <div className="flex items-center space-x-2 mb-6">
                <Edit className="w-6 h-6 text-gray-600" />
                <h1 className="text-3xl font-bold">Modifica Torneo</h1>
              </div>
              
              <TournamentEditForm tournament={tournament} />
            </div>
          </div>
          
          {/* Colonna laterale - Co-organizzatori */}
          <div className="lg:col-span-1">
            <div className="sticky top-4">
              <InviteCollaborator 
                tournamentId={params.id}
                existingCollaborators={collaborators || []}
              />
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
