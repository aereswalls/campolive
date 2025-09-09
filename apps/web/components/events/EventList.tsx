'use client'

import Link from 'next/link'
import { Calendar, MapPin, Users, Clock } from 'lucide-react'

interface Event {
  id: string
  title: string
  description?: string
  event_type: string
  scheduled_at: string
  venue_name?: string
  status: string
  home_team?: any
  away_team?: any
  duration_minutes: number
}

interface EventListProps {
  events: Event[]
}

export default function EventList({ events }: EventListProps) {
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

  if (events.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow p-8 text-center">
        <div className="text-gray-400 mb-4">
          <Calendar className="w-16 h-16 mx-auto" />
        </div>
        <h3 className="text-xl font-semibold mb-2">Nessun evento</h3>
        <p className="text-gray-600 mb-4">
          Non hai ancora creato nessun evento. Inizia creando il tuo primo evento!
        </p>
        <Link 
          href="/events/new"
          className="inline-block bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700"
        >
          Crea il tuo primo evento
        </Link>
      </div>
    )
  }

  return (
    <div className="grid gap-4">
      {events.map((event) => (
        <Link 
          key={event.id} 
          href={`/events/${event.id}`}
          className="block bg-white rounded-lg shadow hover:shadow-lg transition-shadow"
        >
          <div className="p-6">
            <div className="flex justify-between items-start mb-3">
              <h3 className="text-xl font-semibold">{event.title}</h3>
              <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(event.status)}`}>
                {getStatusText(event.status)}
              </span>
            </div>
            
            {event.description && (
              <p className="text-gray-600 mb-3">{event.description}</p>
            )}
            
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm text-gray-600">
              <div className="flex items-center">
                <Calendar className="w-4 h-4 mr-2" />
                {formatDate(event.scheduled_at)}
              </div>
              
              {event.venue_name && (
                <div className="flex items-center">
                  <MapPin className="w-4 h-4 mr-2" />
                  {event.venue_name}
                </div>
              )}
              
              <div className="flex items-center">
                <Clock className="w-4 h-4 mr-2" />
                {event.duration_minutes} minuti
              </div>
              
              {(event.home_team || event.away_team) && (
                <div className="flex items-center">
                  <Users className="w-4 h-4 mr-2" />
                  {event.home_team?.name || 'Casa'} vs {event.away_team?.name || 'Ospite'}
                </div>
              )}
            </div>
          </div>
        </Link>
      ))}
    </div>
  )
}