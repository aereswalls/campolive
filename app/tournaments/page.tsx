import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import Navbar from '@/components/Navbar'
import { Trophy, Calendar, MapPin, Users, Plus, Crown, UserCheck } from 'lucide-react'

export default async function TournamentsPage() {
  const supabase = createClient()
  
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) {
    redirect('/login')
  }
  
  // Query unificata: recupera tutti i tornei accessibili (owner o collaboratore)
  const { data: allTournaments, error } = await supabase
    .from('tournaments')
    .select(`
      *,
      tournament_collaborators!inner (
        user_id,
        status
      )
    `)
    .or(`created_by.eq.${user.id},tournament_collaborators.user_id.eq.${user.id}`)
    .order('created_at', { ascending: false })
  
  // Determina il ruolo per ogni torneo
  const tournamentsWithRole = allTournaments?.map(tournament => ({
    ...tournament,
    isOwner: tournament.created_by === user.id,
    isCollaborator: tournament.created_by !== user.id
  })) || []
  
  const getStatusLabel = (status: string) => {
    switch(status) {
      case 'draft': return 'Bozza'
      case 'registration_open': return 'Iscrizioni Aperte'
      case 'in_progress': return 'In Corso'
      case 'completed': return 'Completato'
      case 'cancelled': return 'Cancellato'
      default: return status
    }
  }
  
  const getStatusColor = (status: string) => {
    switch(status) {
      case 'draft': return 'bg-gray-100 text-gray-700'
      case 'registration_open': return 'bg-blue-100 text-blue-700'
      case 'in_progress': return 'bg-green-100 text-green-700'
      case 'completed': return 'bg-purple-100 text-purple-700'
      case 'cancelled': return 'bg-red-100 text-red-700'
      default: return 'bg-gray-100 text-gray-700'
    }
  }
  
  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar userEmail={user.email} />
      
      <main className="container mx-auto px-4 py-8 max-w-7xl">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">I Miei Tornei</h1>
            <p className="text-gray-600 mt-1">Tornei che organizzi o co-organizzi</p>
          </div>
          <Link 
            href="/tournaments/new"
            className="bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 flex items-center space-x-2"
          >
            <Plus className="w-5 h-5" />
            <span>Nuovo Torneo</span>
          </Link>
        </div>
        
        {error && (
          <div className="bg-red-50 text-red-600 p-4 rounded-lg mb-4">
            Errore nel caricamento dei tornei: {error.message}
          </div>
        )}
        
        {tournamentsWithRole && tournamentsWithRole.length > 0 ? (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {tournamentsWithRole.map((tournament: any) => (
              <Link
                key={tournament.id}
                href={`/tournaments/${tournament.id}`}
                className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md transition relative"
              >
                <div className="absolute top-4 right-4">
                  {tournament.isOwner ? (
                    <span className="flex items-center space-x-1 text-xs bg-yellow-100 text-yellow-700 px-2 py-1 rounded">
                      <Crown className="w-3 h-3" />
                      <span>Owner</span>
                    </span>
                  ) : (
                    <span className="flex items-center space-x-1 text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded">
                      <UserCheck className="w-3 h-3" />
                      <span>Co-org</span>
                    </span>
                  )}
                </div>
                
                <div className="flex justify-between items-start mb-4">
                  <Trophy className="w-8 h-8 text-yellow-500" />
                  <span className={`px-2 py-1 rounded text-xs ${getStatusColor(tournament.status)}`}>
                    {getStatusLabel(tournament.status)}
                  </span>
                </div>
                
                <h3 className="text-lg font-semibold mb-2">{tournament.name}</h3>
                
                <div className="space-y-2 text-sm text-gray-600">
                  <div className="flex items-center space-x-2">
                    <Calendar className="w-4 h-4" />
                    <span>
                      {tournament.start_date 
                        ? new Date(tournament.start_date).toLocaleDateString('it-IT')
                        : 'Data da definire'}
                    </span>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <MapPin className="w-4 h-4" />
                    <span>{tournament.city || 'Località da definire'}</span>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <Users className="w-4 h-4" />
                    <span>{tournament.max_teams || 16} squadre max</span>
                  </div>
                </div>
                
                <div className="mt-4 pt-4 border-t">
                  <span className="text-xs text-gray-500">
                    Sport: {tournament.sport?.replace(/_/g, ' ')}
                  </span>
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-12 text-center">
            <Trophy className="w-16 h-16 mx-auto mb-4 text-gray-300" />
            <h2 className="text-xl font-semibold mb-2">Nessun torneo</h2>
            <p className="text-gray-600 mb-6">
              Crea il tuo primo torneo o attendi di essere invitato come co-organizzatore
            </p>
            <Link 
              href="/tournaments/new"
              className="inline-block bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700"
            >
              Crea il tuo primo torneo
            </Link>
          </div>
        )}
      </main>
    </div>
  )
}
