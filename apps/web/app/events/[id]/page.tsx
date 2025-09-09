import { createClient } from '@/utils/supabase/server'
import { redirect, notFound } from 'next/navigation'
import Link from 'next/link'
import { Calendar, MapPin, Clock, Users, Video, Edit, Trash2 } from 'lucide-react'

export default async function EventDetailPage({ params }: { params: { id: string } }) {
  const supabase = createClient()
  
  // Verifica autenticazione
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) {
    redirect('/login')
  }
  
  // Recupera dettagli evento
  const { data: event, error } = await supabase
    .from('events')
    .select(`
      *,
      home_team:teams!home_team_id(*),
      away_team:teams!away_team_id(*),
      created_by_user:user_profiles!created_by(*)
    `)
    .eq('id', params.id)
    .single()
  
  if (error || !event) {
    notFound()
  }
  
  // Verifica che l'utente sia il proprietario
  const isOwner = event.created_by === user.id
  
  // Formatta data
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('it-IT', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }
  
  // Ottieni colore stato
  const getStatusColor = (status: string) => {
    switch(status) {
      case 'scheduled': return 'bg-blue-100 text-blue-800'
      case 'live': return 'bg-red-100 text-red-800'
      case 'completed': return 'bg-green-100 text-green-800'
      case 'cancelled': return 'bg-gray-100 text-gray-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }
  
  const getStatusText = (status: string) => {
    switch(status) {
      case 'scheduled': return 'Programmato'
      case 'live': return 'In Diretta'
      case 'completed': return 'Completato'
      case 'cancelled': return 'Cancellato'
      default: return status
    }
  }
  
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow">
        <div className="container mx-auto px-4 py-4">
          <div className="flex justify-between items-center">
            <h1 className="text-2xl font-bold text-green-600">
              🏟️ Dettaglio Evento
            </h1>
            <Link 
              href="/events" 
              className="text-gray-600 hover:text-gray-900"
            >
              ← Torna agli Eventi
            </Link>
          </div>
        </div>
      </header>
      
      {/* Main Content */}
      <main className="container mx-auto px-4 py-8 max-w-6xl">
        {/* Event Header */}
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <div className="flex justify-between items-start mb-4">
            <div>
              <h2 className="text-3xl font-bold mb-2">{event.title}</h2>
              <span className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(event.status)}`}>
                {getStatusText(event.status)}
              </span>
            </div>
            
            {isOwner && (
              <div className="flex space-x-2">
                <button className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg">
                  <Edit className="w-5 h-5" />
                </button>
                <button className="p-2 text-red-600 hover:bg-red-50 rounded-lg">
                  <Trash2 className="w-5 h-5" />
                </button>
              </div>
            )}
          </div>
          
          {event.description && (
            <p className="text-gray-600 mb-4">{event.description}</p>
          )}
          
          <div className="grid md:grid-cols-2 gap-4 text-sm">
            <div className="flex items-center text-gray-600">
              <Calendar className="w-5 h-5 mr-3 text-gray-400" />
              {formatDate(event.scheduled_at)}
            </div>
            
            <div className="flex items-center text-gray-600">
              <Clock className="w-5 h-5 mr-3 text-gray-400" />
              Durata: {event.duration_minutes} minuti
            </div>
            
            {event.venue_name && (
              <div className="flex items-center text-gray-600">
                <MapPin className="w-5 h-5 mr-3 text-gray-400" />
                {event.venue_name}
              </div>
            )}
            
            {(event.home_team || event.away_team) && (
              <div className="flex items-center text-gray-600">
                <Users className="w-5 h-5 mr-3 text-gray-400" />
                {event.home_team?.name || 'Casa'} vs {event.away_team?.name || 'Ospite'}
              </div>
            )}
          </div>
          
          {event.venue_address && (
            <div className="mt-4 pt-4 border-t">
              <p className="text-sm text-gray-600">
                <strong>Indirizzo:</strong> {event.venue_address}
              </p>
            </div>
          )}
        </div>
        
        {/* Actions */}
        <div className="grid md:grid-cols-3 gap-4 mb-6">
          <button 
            className="bg-green-600 text-white p-4 rounded-lg hover:bg-green-700 flex items-center justify-center"
            disabled={event.status !== 'scheduled'}
          >
            <Video className="w-5 h-5 mr-2" />
            Inizia Registrazione
          </button>
          
          <button 
            className="bg-blue-600 text-white p-4 rounded-lg hover:bg-blue-700 flex items-center justify-center"
            disabled={event.status !== 'scheduled'}
          >
            📡 Vai Live
          </button>
          
          <button className="bg-gray-600 text-white p-4 rounded-lg hover:bg-gray-700 flex items-center justify-center">
            📊 Statistiche
          </button>
        </div>
        
        {/* Recordings Section */}
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <h3 className="text-xl font-semibold mb-4">📹 Registrazioni</h3>
          <div className="text-center py-8 text-gray-500">
            <Video className="w-12 h-12 mx-auto mb-3 text-gray-300" />
            <p>Nessuna registrazione disponibile</p>
            <p className="text-sm mt-1">Le registrazioni appariranno qui dopo l'evento</p>
          </div>
        </div>
        
        {/* Info Footer */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <p className="text-sm text-blue-700">
            <strong>Suggerimento:</strong> Ricordati di preparare il tuo dispositivo per la registrazione 
            almeno 15 minuti prima dell'inizio dell'evento. Assicurati di avere batteria sufficiente 
            e spazio di archiviazione disponibile.
          </p>
        </div>
      </main>
    </div>
  )
}