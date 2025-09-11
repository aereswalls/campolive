import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import Navbar from '@/components/Navbar'
import PlayerForm from '@/components/players/PlayerForm'
import StaffForm from '@/components/staff/StaffForm'
import { Users, UserPlus, Shield, Calendar } from 'lucide-react'

export default async function TeamDetailPage({
  params
}: {
  params: { id: string }
}) {
  const supabase = createClient()
  
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) {
    redirect('/login')
  }
  
  const { data: team } = await supabase
    .from('teams')
    .select('*')
    .eq('id', params.id)
    .single()
  
  if (!team) {
    redirect('/teams')
  }
  
  // Verifica se l'utente è admin del team
  const { data: membership } = await supabase
    .from('team_members')
    .select('role')
    .eq('team_id', params.id)
    .eq('user_id', user.id)
    .single()
  
  const isAdmin = membership?.role === 'owner' || membership?.role === 'admin'
  
  // Recupera giocatori
  const { data: players } = await supabase
    .from('players')
    .select('*')
    .eq('team_id', params.id)
    .order('jersey_number')
  
  // Recupera staff
  const { data: staff } = await supabase
    .from('team_staff')
    .select('*')
    .eq('team_id', params.id)
    .eq('is_active', true)
    .order('role')
  
  // Recupera membri del team
  const { data: members } = await supabase
    .from('team_members')
    .select(`
      *,
      user:user_profiles(*)
    `)
    .eq('team_id', params.id)
    .eq('is_active', true)
  
  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar userEmail={user.email} />
      
      <main className="container mx-auto px-4 py-8 max-w-7xl">
        <div className="mb-6">
          <Link 
            href="/teams" 
            className="text-gray-600 hover:text-gray-900"
          >
            ← Torna ai Team
          </Link>
        </div>
        
        {/* Header Team */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8 mb-8">
          <div className="flex justify-between items-start">
            <div>
              <h1 className="text-3xl font-bold mb-2">{team.name}</h1>
              <p className="text-gray-600 mb-4">{team.description}</p>
              <div className="flex items-center space-x-4 text-sm text-gray-500">
                <span>{team.city}, {team.province}</span>
                <span>•</span>
                <span>Fondato il {new Date(team.created_at).toLocaleDateString('it-IT')}</span>
              </div>
            </div>
            <div 
              className="w-20 h-20 rounded-full flex items-center justify-center text-white text-2xl font-bold"
              style={{ backgroundColor: team.primary_color || '#10B981' }}
            >
              {team.name.substring(0, 2).toUpperCase()}
            </div>
          </div>
        </div>
        
        {/* Statistiche */}
        <div className="grid md:grid-cols-4 gap-4 mb-8">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
            <div className="flex items-center justify-between">
              <Users className="w-8 h-8 text-blue-500" />
              <span className="text-2xl font-bold">{players?.length || 0}</span>
            </div>
            <p className="text-sm text-gray-600 mt-2">Giocatori</p>
          </div>
          
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
            <div className="flex items-center justify-between">
              <Shield className="w-8 h-8 text-green-500" />
              <span className="text-2xl font-bold">{staff?.length || 0}</span>
            </div>
            <p className="text-sm text-gray-600 mt-2">Staff Tecnico</p>
          </div>
          
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
            <div className="flex items-center justify-between">
              <UserPlus className="w-8 h-8 text-purple-500" />
              <span className="text-2xl font-bold">{members?.length || 0}</span>
            </div>
            <p className="text-sm text-gray-600 mt-2">Membri</p>
          </div>
          
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
            <div className="flex items-center justify-between">
              <Calendar className="w-8 h-8 text-orange-500" />
              <span className="text-2xl font-bold">0</span>
            </div>
            <p className="text-sm text-gray-600 mt-2">Partite</p>
          </div>
        </div>
        
        <div className="grid md:grid-cols-2 gap-8">
          {/* Sezione Giocatori */}
          <div>
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h2 className="text-xl font-bold mb-4">Rosa Giocatori ({players?.length || 0})</h2>
              
              {isAdmin && (
                <div className="mb-6">
                  <h3 className="text-sm font-medium text-gray-700 mb-3">Aggiungi Giocatore</h3>
                  <PlayerForm teamId={params.id} />
                </div>
              )}
              
              <div className="space-y-2 max-h-96 overflow-y-auto">
                {players?.map((player) => (
                  <div key={player.id} className="flex items-center justify-between p-3 border rounded-lg hover:bg-gray-50">
                    <div className="flex items-center space-x-3">
                      <span className="font-bold text-lg text-gray-700">#{player.jersey_number || '-'}</span>
                      <div>
                        <p className="font-medium">{player.first_name} {player.last_name}</p>
                        <p className="text-xs text-gray-500">{player.position}</p>
                      </div>
                    </div>
                    {isAdmin && (
                      <button className="text-sm text-gray-500 hover:text-red-600">
                        Rimuovi
                      </button>
                    )}
                  </div>
                ))}
                
                {(!players || players.length === 0) && (
                  <p className="text-center text-gray-500 py-4">Nessun giocatore registrato</p>
                )}
              </div>
            </div>
          </div>
          
          {/* Sezione Staff */}
          <div>
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h2 className="text-xl font-bold mb-4">Staff Tecnico ({staff?.length || 0})</h2>
              
              {isAdmin && (
                <div className="mb-6">
                  <h3 className="text-sm font-medium text-gray-700 mb-3">Aggiungi Staff</h3>
                  <StaffForm teamId={params.id} />
                </div>
              )}
              
              <div className="space-y-2 max-h-96 overflow-y-auto">
                {staff?.map((member) => (
                  <div key={member.id} className="flex items-center justify-between p-3 border rounded-lg hover:bg-gray-50">
                    <div>
                      <p className="font-medium">{member.first_name} {member.last_name}</p>
                      <p className="text-xs text-gray-500 capitalize">{member.role.replace('_', ' ')}</p>
                    </div>
                    {isAdmin && (
                      <button className="text-sm text-gray-500 hover:text-red-600">
                        Rimuovi
                      </button>
                    )}
                  </div>
                ))}
                
                {(!staff || staff.length === 0) && (
                  <p className="text-center text-gray-500 py-4">Nessun membro dello staff</p>
                )}
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
