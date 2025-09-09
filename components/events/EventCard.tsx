'use client'

import Link from 'next/link'
import { Calendar, MapPin, Clock } from 'lucide-react'

interface EventCardProps {
  event: {
    id: string
    title: string
    description?: string
    scheduled_at: string
    venue_name?: string
    status: string
    duration_minutes: number
  }
}

export default function EventCard({ event }: EventCardProps) {
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('it-IT', {
      weekday: 'short',
      day: 'numeric',
      month: 'short',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  return (
    <div className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow p-6">
      <h3 className="text-lg font-semibold mb-2">{event.title}</h3>
      {event.description && (
        <p className="text-gray-600 text-sm mb-3">{event.description}</p>
      )}
      <div className="space-y-2 text-sm text-gray-500">
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
      </div>
      <Link 
        href={`/events/${event.id}`}
        className="mt-4 inline-block text-green-600 hover:text-green-700 text-sm font-medium"
      >
        Vedi dettagli →
      </Link>
    </div>
  )
}