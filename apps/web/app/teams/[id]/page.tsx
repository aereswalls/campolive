import { createClient } from '@/utils/supabase/server'
import { redirect, notFound } from 'next/navigation'
import Link from 'next/link'
import { Users, MapPin, Calendar, Shield, Settings, UserPlus, Trophy } from 'lucide-react'

export default async function TeamDetailPage({ params }: { params: { id: string } }) {
  const supabase = createClient()
  
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) {
    redirect('/login')
  }
  
  // Recupera dettagli team
  const { data: team, error } = await supabase
    .from('teams')
    .select('*')
    .eq('id', params.id)
    .single()
  
  if (error || !team) {
    notFound()
  }
  
  // Recupera membri del team
  const { data: members } = await supabase
    .from('team_members')
    .select(`
      *,
      user:user_profiles(*)
    `)
    .eq('team_id', params.id)
    .eq('is_active', true)
  
  // Verifica il ruolo dell'utente corrente
  const currentUserMember = members?.find(m => m.user_id === user.id)
  const isManager = currentUserMember?.role === 'manager' || team.created_by === user.id
  
  // Conta gli eventi del team
  const { count: eventsCount } = await supabase
    .from('events')
    .select('*', { count: 'exact', head: true })
    .or(`home_team_id.eq.${params.id},away_team_id.eq.${params.id}`)
  
  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow">
        <div className="container mx-auto px-4 py-4">
          <div className="flex justify-between items-center">
            <h1 className="text-2xl font-bold text-green-600">
              👥 Dettaglio Team
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
      
      <main className="container mx-auto px-4 py-8 max-w-6xl">
        {/* Team Header */}
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <div className="flex justify-between items-start mb-4">
            <div className="flex items-center space-x-4">
              {team.logo_url ? (
                <img 
                  src={team.logo_url} 
                  alt={team.name}
                  className="w-20 h-20 object-contain"
                />
              ) : (
                <div 
                  className="w-20 h-20 rounded-lg flex items-center justify-center"
                  style={{ backgroundColor: team.primary_color || '#16a34a' }}
                >
                  <Users className="w-10 h-10 text-white" />
                </div>
              )}
              <div>
                <h2 className="text-3xl font-bold flex items-center">
                  {team.name}
                  {team.is_verified && (
                    <Shield className="w-6 h-6 text-blue-500 ml-2" />
                  )}
                </h2>
                <p className="text-gray-600">@{team.slug}</p>
              </div>
            </div>
            
            {isManager && (
              <div className="flex space-x-2">
                <Link 
                  href={`/teams/${params.id}/edit`}
                  className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg"
                >
                  <Settings className="w-5 h-5" />
                </Link>
              </div>
            )}
          </div>
          
          {team.description && (
            <p className="text-gray-600 mb-4">{team.description}</p>
          )}
          
          <div className="grid md:grid-cols-4 gap-4 text-sm">
            <div className="flex items-center text-gray-600">
              <Trophy className="w-5 h-5 mr-2 text-gray-400" />
              {team.sport_type} - {team.level}
            </div>
            
            {team.city && (
              <div className="flex items-center text-gray-600">
                <MapPin className="w-5 h-5 mr-2 text-gray-400" />
                {team.city}
              </div>
            )}
            
            {team.founded_year && (
              <div className="flex items-center text-gray-600">
                <Calendar className="w-5 h-5 mr-2 text-gray-400" />
                Fondato nel {team.founded_year}
              </div>
            )}
            
            <div className="flex items-center text-gray-600">
              <Users className="w-5 h-5 mr-2 text-gray-400" />
              {members?.length || 0} membri
            </div>
          </div>
          
          <div className="mt-4 flex gap-2">
            <div 
              className="inline-block px-3 py-1 rounded-full text-xs"
              style={{ 
                backgroundColor: team.primary_color || '#16a34a',
                color: 'white'
              }}
            >
              Colore Primario
            </div>
            <div 
              className="inline-block px-3 py-1 rounded-full text-xs border"
              style={{ 
                borderColor: team.secondary_color || '#ffffff',
                color: team.secondary_color === '#ffffff' ? '#666' : team.secondary_color
              }}
            >
              Colore Secondario
            </div>
          </div>
        </div>
        
        {/* Stats */}
        <div className="grid md:grid-cols-3 gap-4 mb-6">
          <div className="bg-white rounded-lg shadow p-4">
            <div className="text-2xl font-bold">{eventsCount || 0}</div>
            <div className="text-gray-600">Eventi</div>
          </div>
          <div className="bg-white rounded-lg shadow p-4">
            <div className="text-2xl font-bold">{members?.length || 0}</div>
            <div className="text-gray-600">Membri</div>
          </div>
          <div className="bg-white rounded-lg shadow p-4">
            <div className="text-2xl font-bold">0</div>
            <div className="text-gray-600">Video</div>
          </div>
        </div>
        
        {/* Members Section */}
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-xl font-semibold">Membri del Team</h3>
            {isManager && (
              <Link 
                href={`/teams/${params.id}/members`}
                className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 text-sm flex items-center"
              >
                <UserPlus className="w-4 h-4 mr-2" />
                Invita Membri
              </Link>
            )}
          </div>
          
          {members && members.length > 0 ? (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
              {members.map((member) => (
                <div key={member.id} className="border rounded-lg p-3">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center">
                      <Users className="w-5 h-5 text-gray-500" />
                    </div>
                    <div className="flex-1">
                      <div className="font-medium">
                        {member.user?.full_name || member.user?.username}
                      </div>
                      <div className="text-sm text-gray-500">
                        {member.role === 'manager' ? '👑 Manager' : 
                         member.role === 'coach' ? '🎯 Allenatore' :
                         member.role === 'player' ? '⚽ Giocatore' : member.role}
                      </div>
                    </div>
                    {member.jersey_number && (
                      <div className="text-2xl font-bold text-gray-400">
                        #{member.jersey_number}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-500 text-center py-8">
              Nessun membro nel team. {isManager && 'Inizia invitando i tuoi compagni!'}
            </p>
          )}
        </div>
      </main>
    </div>
  )
}
