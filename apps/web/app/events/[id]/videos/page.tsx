import { createClient } from '@/utils/supabase/server'
import { redirect, notFound } from 'next/navigation'
import Link from 'next/link'
import VideoPlayer from '@/components/VideoPlayer'
import { Calendar, Clock, Download } from 'lucide-react'

export default async function EventVideosPage({ params }: { params: { id: string } }) {
  const supabase = createClient()
  
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) {
    redirect('/login')
  }
  
  // Recupera evento
  const { data: event } = await supabase
    .from('events')
    .select('*')
    .eq('id', params.id)
    .single()
  
  if (!event) {
    notFound()
  }
  
  // Recupera video dell'evento
  const { data: recordings } = await supabase
    .from('event_recordings')
    .select('*')
    .eq('event_id', params.id)
    .order('created_at', { ascending: false })
  
  // Recupera highlights
  const { data: highlights } = await supabase
    .from('event_highlights')
    .select('*')
    .eq('event_id', params.id)
    .order('created_at', { ascending: false })
  
  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow">
        <div className="container mx-auto px-4 py-4">
          <div className="flex justify-between items-center">
            <h1 className="text-2xl font-bold text-green-600">
              🎬 Video Evento
            </h1>
            <Link 
              href={`/events/${params.id}`}
              className="text-gray-600 hover:text-gray-900"
            >
              ← Torna all'evento
            </Link>
          </div>
        </div>
      </header>
      
      <main className="container mx-auto px-4 py-8 max-w-6xl">
        {/* Event Info */}
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <h2 className="text-2xl font-bold mb-2">{event.title}</h2>
          <div className="flex items-center text-gray-600 text-sm space-x-4">
            <div className="flex items-center">
              <Calendar className="w-4 h-4 mr-1" />
              {new Date(event.scheduled_at).toLocaleDateString('it-IT')}
            </div>
            <div className="flex items-center">
              <Clock className="w-4 h-4 mr-1" />
              {event.duration_minutes} minuti
            </div>
          </div>
        </div>
        
        {/* Main Recording */}
        {recordings && recordings.length > 0 ? (
          <div className="mb-8">
            <h3 className="text-xl font-semibold mb-4">📹 Registrazione Completa</h3>
            <div className="bg-white rounded-lg shadow p-4">
              {recordings[0].public_url ? (
                <VideoPlayer
                  videoUrl={recordings[0].public_url}
                  thumbnailUrl={recordings[0].thumbnail_url}
                  title={event.title}
                />
              ) : (
                <div className="aspect-video bg-gray-100 rounded-lg flex items-center justify-center">
                  <p className="text-gray-500">Video in elaborazione...</p>
                </div>
              )}
              
              <div className="mt-4 flex items-center justify-between text-sm text-gray-600">
                <div>
                  Durata: {Math.floor((recordings[0].duration_seconds || 0) / 60)} minuti
                </div>
                <div>
                  Dimensione: {recordings[0].file_size_mb || 0} MB
                </div>
                <div>
                  Risoluzione: {recordings[0].resolution || 'HD'}
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow p-8 text-center mb-8">
            <div className="text-gray-400 mb-4">
              <Calendar className="w-16 h-16 mx-auto" />
            </div>
            <h3 className="text-xl font-semibold mb-2">Nessuna registrazione</h3>
            <p className="text-gray-600">
              Non ci sono ancora registrazioni per questo evento.
            </p>
            {event.status === 'scheduled' && (
              <p className="text-sm text-gray-500 mt-2">
                L'evento è programmato per il {new Date(event.scheduled_at).toLocaleDateString('it-IT')}
              </p>
            )}
          </div>
        )}
        
        {/* Highlights */}
        {highlights && highlights.length > 0 && (
          <div>
            <h3 className="text-xl font-semibold mb-4">✨ Highlights</h3>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
              {highlights.map((highlight) => (
                <div key={highlight.id} className="bg-white rounded-lg shadow p-4">
                  <h4 className="font-medium mb-2">{highlight.title}</h4>
                  <div className="aspect-video bg-gray-100 rounded mb-2">
                    {/* Placeholder per highlight video */}
                    <div className="w-full h-full flex items-center justify-center text-gray-400">
                      <Clock className="w-8 h-8" />
                    </div>
                  </div>
                  <p className="text-sm text-gray-600">
                    {highlight.start_time_seconds}s - {highlight.end_time_seconds}s
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}
      </main>
    </div>
  )
}
