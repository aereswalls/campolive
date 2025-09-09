'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/utils/supabase/client'

interface Team {
  id: string
  name: string
  slug: string
}

interface EventFormProps {
  teams: Team[]
  userId: string
}

export default function EventForm({ teams, userId }: EventFormProps) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    event_type: 'partita',
    home_team_id: '',
    away_team_id: '',
    venue_name: '',
    venue_address: '',
    scheduled_at: '',
    duration_minutes: 90,
    is_public: true
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)
    
    try {
      const supabase = createClient()
      
      // Prima crea l'evento
      const { data: event, error: eventError } = await supabase
        .from('events')
        .insert({
          ...formData,
          created_by: userId,
          credits_required: 5,
          status: 'scheduled'
        })
        .select()
        .single()
      
      if (eventError) {
        throw new Error('Errore nella creazione dell\'evento: ' + eventError.message)
      }
      
      // Poi consuma i crediti usando l'ID dell'evento creato
      const { data: creditResult, error: creditError } = await supabase.rpc('consume_credits', {
        p_user_id: userId,
        p_amount: 5,
        p_event_id: event.id,
        p_description: 'Creazione evento: ' + formData.title
      })
      
      if (creditError || !creditResult) {
        // Se fallisce il consumo crediti, elimina l'evento
        await supabase.from('events').delete().eq('id', event.id)
        throw new Error('Crediti insufficienti o errore nel consumo crediti')
      }
      
      // Successo! Naviga alla pagina dell'evento
      router.push(`/events/${event.id}`)
      router.refresh()
      
    } catch (err: any) {
      setError(err.message || 'Si è verificato un errore')
      setLoading(false)
    }
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target
    
    if (type === 'checkbox') {
      const target = e.target as HTMLInputElement
      setFormData(prev => ({ ...prev, [name]: target.checked }))
    } else if (type === 'number') {
      setFormData(prev => ({ ...prev, [name]: parseInt(value) || 0 }))
    } else {
      setFormData(prev => ({ ...prev, [name]: value }))
    }
  }

  return (
    <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow p-6">
      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
          {error}
        </div>
      )}
      
      <div className="grid md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium mb-2">
            Titolo Evento *
          </label>
          <input
            type="text"
            name="title"
            required
            value={formData.title}
            onChange={handleInputChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
            placeholder="es. Finale Coppa Primavera"
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium mb-2">
            Data e Ora *
          </label>
          <input
            type="datetime-local"
            name="scheduled_at"
            required
            value={formData.scheduled_at}
            onChange={handleInputChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium mb-2">
            Tipo Evento
          </label>
          <select
            name="event_type"
            value={formData.event_type}
            onChange={handleInputChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
          >
            <option value="partita">Partita</option>
            <option value="allenamento">Allenamento</option>
            <option value="torneo">Torneo</option>
            <option value="altro">Altro</option>
          </select>
        </div>
        
        <div>
          <label className="block text-sm font-medium mb-2">
            Durata (minuti)
          </label>
          <input
            type="number"
            name="duration_minutes"
            value={formData.duration_minutes}
            onChange={handleInputChange}
            min="1"
            max="300"
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium mb-2">
            Squadra Casa
          </label>
          <select
            name="home_team_id"
            value={formData.home_team_id}
            onChange={handleInputChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
          >
            <option value="">Seleziona squadra...</option>
            {teams.map(team => (
              <option key={team.id} value={team.id}>{team.name}</option>
            ))}
          </select>
        </div>
        
        <div>
          <label className="block text-sm font-medium mb-2">
            Squadra Ospite
          </label>
          <select
            name="away_team_id"
            value={formData.away_team_id}
            onChange={handleInputChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
          >
            <option value="">Seleziona squadra...</option>
            {teams.map(team => (
              <option key={team.id} value={team.id}>{team.name}</option>
            ))}
          </select>
        </div>
        
        <div>
          <label className="block text-sm font-medium mb-2">
            Nome Campo
          </label>
          <input
            type="text"
            name="venue_name"
            value={formData.venue_name}
            onChange={handleInputChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
            placeholder="es. Stadio Comunale"
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium mb-2">
            Indirizzo
          </label>
          <input
            type="text"
            name="venue_address"
            value={formData.venue_address}
            onChange={handleInputChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
            placeholder="es. Via dello Sport, 1"
          />
        </div>
        
        <div className="md:col-span-2">
          <label className="block text-sm font-medium mb-2">
            Descrizione
          </label>
          <textarea
            name="description"
            value={formData.description}
            onChange={handleInputChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
            rows={3}
            placeholder="Descrizione dell'evento..."
          />
        </div>
        
        <div className="md:col-span-2">
          <label className="flex items-center">
            <input
              type="checkbox"
              name="is_public"
              checked={formData.is_public}
              onChange={handleInputChange}
              className="mr-2"
            />
            <span className="text-sm">Evento pubblico (visibile a tutti)</span>
          </label>
        </div>
      </div>
      
      <div className="mt-6 flex justify-end space-x-4">
        <button
          type="button"
          onClick={() => router.back()}
          className="px-6 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
          disabled={loading}
        >
          Annulla
        </button>
        <button
          type="submit"
          disabled={loading}
          className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? 'Creazione...' : 'Crea Evento (5 crediti)'}
        </button>
      </div>
    </form>
  )
}