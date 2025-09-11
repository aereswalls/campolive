import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import Navbar from '@/components/Navbar'
import TournamentEditForm from '@/components/tournaments/TournamentEditForm'
import { Edit } from 'lucide-react'

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
          <div className="flex items-center space-x-2 mb-6">
            <Edit className="w-6 h-6 text-gray-600" />
            <h1 className="text-3xl font-bold">Modifica Torneo</h1>
          </div>
          
          <TournamentEditForm tournament={tournament} />
        </div>
      </main>
    </div>
  )
}
