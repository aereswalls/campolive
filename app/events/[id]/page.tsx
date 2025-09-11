import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import Navbar from '@/components/Navbar'
import { Calendar, MapPin, Users, Clock, Video, Edit } from 'lucide-react'

export default async function EventDetailPage({
  params
}: {
  params: { id: string }
}) {
  const supabase = createClient()
  
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) {
    redirect('/login')
  }
  
  const { data: event } = await supabase
    .from('events')
    .select(`
      *,
      home_team:teams!home_team_id(*),
      away_team:teams!away_team_id(*)
    `)
    .eq('id', params.id)
    .single()
  
  if (!event) {
    redirect('/events')
  }
  
  const isOwner = event.created_by === user.id
  
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('it-IT', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }
  
  const formatTime = (dateString: string) => {
    return new Date(dateString).toLocaleTimeString('it-IT', {
      hour: '2-digit',
      minute: '2-digit'
    })
  }
  
  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar userEmail={user.email} />
      
      <main className="container mx-auto px-4 py-8 max-w-7xl">
        <div className="mb-6">
          <Link 
            href="/events" 
            className="text-gray-600 hover:text-gray-900"
          >
            ← Torna agli Eventi
          </Link>
        </div>
        
        {/* Header Evento */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8 mb-8">
          <div className="flex justify-between items-start mb-6">
            <div>
              <h1 className="text-3xl font-bold mb-2">{event.title}</h1>
              {event.description && (
                <p className="text-gray-600 mb-4">{event.description}</p>
              )}
              <div className="flex items-center space-x-2">
                <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                  event.status === 'scheduled' ? 'bg-blue-100 text-blue-700' :
                  event.status === 'live' ? 'bg-red-100 text-red-700' :
                  event.status === 'completed' ? 'bg-green-100 text-green-700' :
                  'bg-gray-100 text-gray-700'
                }`}>
                  {event.status === 'scheduled' ? 'Programmato' :
                   event.status === 'live' ? 'In Diretta' :
                   event.status === 'completed' ? 'Completato' :
                   'Cancellato'}
                </span>
                <span className="text-sm text-gray-500">
                  Tipo: {event.event_type === 'match' ? 'Partita' : 'Allenamento'}
                </span>
              </div>
            </div>
            
            {isOwner && (
              <div className="flex space-x-2">
                <Link
                  href={`/events/${params.id}/edit`}
                  className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 flex items-center space-x-2"
                >
                  <Edit className="w-4 h-4" />
                  <span>Modifica</span>
                </Link>
                <button
                  disabled
                  className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
                >
                  <Video className="w-4 h-4" />
                  <span>Inizia Live</span>
                </button>
              </div>
            )}
          </div>
          
          {/* Match Teams */}
          {event.event_type === 'match' && (
            <div className="bg-gray-50 rounded-lg p-6">
              <div className="flex items-center justify-between">
                <div className="flex-1 text-center">
                  <h3 className="text-xl font-bold mb-2">{event.home_team?.name}</h3>
                  <p className="text-sm text-gray-600">{event.home_team?.city}</p>
                </div>
                
                <div className="px-8">
                  <span className="text-2xl font-bold text-gray-400">VS</span>
                </div>
                
                <div className="flex-1 text-center">
                  <h3 className="text-xl font-bold mb-2">{event.away_team?.name}</h3>
                  <p className="text-sm text-gray-600">{event.away_team?.city}</p>
                </div>
              </div>
            </div>
          )}
        </div>
        
        {/* Dettagli Evento */}
        <div className="grid md:grid-cols-2 gap-8">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h2 className="text-lg font-semibold mb-4">Dettagli Evento</h2>
            
            <div className="space-y-4">
              <div className="flex items-start space-x-3">
                <Calendar className="w-5 h-5 text-gray-400 mt-0.5" />
                <div>
                  <p className="font-medium">Data</p>
                  <p className="text-sm text-gray-600">{formatDate(event.scheduled_at)}</p>
                </div>
              </div>
              
              <div className="flex items-start space-x-3">
                <Clock className="w-5 h-5 text-gray-400 mt-0.5" />
                <div>
                  <p className="font-medium">Orario</p>
                  <p className="text-sm text-gray-600">{formatTime(event.scheduled_at)}</p>
                  <p className="text-xs text-gray-500">Durata: {event.duration || 90} minuti</p>
                </div>
              </div>
              
              <div className="flex items-start space-x-3">
                <MapPin className="w-5 h-5 text-gray-400 mt-0.5" />
                <div>
                  <p className="font-medium">Luogo</p>
                  <p className="text-sm text-gray-600">{event.location || 'Da definire'}</p>
                </div>
              </div>
              
              <div className="flex items-start space-x-3">
                <Users className="w-5 h-5 text-gray-400 mt-0.5" />
                <div>
                  <p className="font-medium">Privacy</p>
                  <p className="text-sm text-gray-600">
                    {event.is_public ? 'Evento pubblico' : 'Evento privato'}
                  </p>
                </div>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h2 className="text-lg font-semibold mb-4">Streaming e Registrazione</h2>
            
            <div className="space-y-4">
              <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <h3 className="font-medium text-blue-900 mb-2">Come funziona</h3>
                <p className="text-sm text-blue-700">
                  Per registrare questo evento in diretta, usa l'app mobile CampoLive. 
                  La registrazione consumerà 1 credito e includerà gli highlights automatici.
                </p>
              </div>
              
              <div className="flex items-center justify-between p-3 border rounded-lg">
                <span className="text-sm font-medium">Live Streaming</span>
                <span className={`text-sm ${event.stream_enabled ? 'text-green-600' : 'text-gray-400'}`}>
                  {event.stream_enabled ? 'Abilitato' : 'Non disponibile'}
                </span>
              </div>
              
              <div className="flex items-center justify-between p-3 border rounded-lg">
                <span className="text-sm font-medium">Registrazione</span>
                <span className={`text-sm ${event.recording_enabled ? 'text-green-600' : 'text-gray-400'}`}>
                  {event.recording_enabled ? 'Abilitata' : 'Non disponibile'}
                </span>
              </div>
              
              <div className="flex items-center justify-between p-3 border rounded-lg">
                <span className="text-sm font-medium">Highlights automatici</span>
                <span className={`text-sm ${event.highlights_enabled ? 'text-green-600' : 'text-gray-400'}`}>
                  {event.highlights_enabled ? 'Abilitati' : 'Non disponibile'}
                </span>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
