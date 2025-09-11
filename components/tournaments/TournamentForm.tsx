'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/utils/supabase/client'

const SPORTS = [
  { value: 'calcio', label: 'Calcio' },
  { value: 'calcio_5', label: 'Calcio a 5' },
  { value: 'calcio_7', label: 'Calcio a 7' },
  { value: 'calcio_8', label: 'Calcio a 8' },
  { value: 'basket', label: 'Basket' },
  { value: 'volley', label: 'Pallavolo' },
  { value: 'tennis', label: 'Tennis' },
  { value: 'padel', label: 'Padel' },
]

const FORMATS = [
  { value: 'campionato', label: 'Campionato (tutti contro tutti)' },
  { value: 'eliminazione_diretta', label: 'Eliminazione Diretta' },
  { value: 'gironi_ed_eliminazione', label: 'Gironi + Eliminazione' },
  { value: 'coppa', label: 'Coppa' },
  { value: 'amichevole', label: 'Torneo Amichevole' },
]

export default function TournamentForm() {
  const router = useRouter()
  const supabase = createClient()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    sport: 'calcio',
    format: 'campionato',
    start_date: '',
    end_date: '',
    registration_deadline: '',
    max_teams: 16,
    min_teams: 4,
    max_players_per_team: 25,
    min_players_per_team: 11,
    location: '',
    city: '',
    province: '',
    primary_color: '#10B981',
    secondary_color: '#065F46',
  })
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)
    
    try {
      // Ottieni l'utente corrente
      const { data: { user } } = await supabase.auth.getUser()
      
      if (!user) {
        throw new Error('Devi essere autenticato per creare un torneo')
      }
      
      // Prepara i dati includendo created_by
      const tournamentData = {
        ...formData,
        created_by: user.id,  // IMPORTANTE: Aggiungi esplicitamente created_by
        status: 'draft',
        country: 'IT'
      }
      
      const { data, error } = await supabase
        .from('tournaments')
        .insert(tournamentData)
        .select()
        .single()
      
      if (error) throw error
      
      router.push(`/tournaments/${data.id}`)
    } catch (err: any) {
      console.error('Errore creazione torneo:', err)
      setError(err.message || 'Errore durante la creazione del torneo')
      setLoading(false)
    }
  }
  
  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {error && (
        <div className="bg-red-50 text-red-600 p-4 rounded-lg">
          {error}
        </div>
      )}
      
      <div className="grid md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Nome Torneo *
          </label>
          <input
            type="text"
            required
            value={formData.name}
            onChange={(e) => setFormData({...formData, name: e.target.value})}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
            placeholder="es. Torneo Primavera 2025"
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Sport *
          </label>
          <select
            required
            value={formData.sport}
            onChange={(e) => setFormData({...formData, sport: e.target.value})}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
          >
            {SPORTS.map(sport => (
              <option key={sport.value} value={sport.value}>
                {sport.label}
              </option>
            ))}
          </select>
        </div>
      </div>
      
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Descrizione
        </label>
        <textarea
          value={formData.description}
          onChange={(e) => setFormData({...formData, description: e.target.value})}
          rows={3}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
          placeholder="Descrivi il torneo, regolamento, premi..."
        />
      </div>
      
      <div className="grid md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Formato Torneo
          </label>
          <select
            value={formData.format}
            onChange={(e) => setFormData({...formData, format: e.target.value})}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
          >
            {FORMATS.map(format => (
              <option key={format.value} value={format.value}>
                {format.label}
              </option>
            ))}
          </select>
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Numero Max Squadre
          </label>
          <input
            type="number"
            min="2"
            max="64"
            value={formData.max_teams}
            onChange={(e) => setFormData({...formData, max_teams: parseInt(e.target.value)})}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
          />
        </div>
      </div>
      
      <div className="grid md:grid-cols-3 gap-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Data Inizio
          </label>
          <input
            type="date"
            value={formData.start_date}
            onChange={(e) => setFormData({...formData, start_date: e.target.value})}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Data Fine
          </label>
          <input
            type="date"
            value={formData.end_date}
            onChange={(e) => setFormData({...formData, end_date: e.target.value})}
            min={formData.start_date}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Chiusura Iscrizioni
          </label>
          <input
            type="date"
            value={formData.registration_deadline}
            onChange={(e) => setFormData({...formData, registration_deadline: e.target.value})}
            max={formData.start_date}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
          />
        </div>
      </div>
      
      <div className="grid md:grid-cols-3 gap-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Luogo/Campo
          </label>
          <input
            type="text"
            value={formData.location}
            onChange={(e) => setFormData({...formData, location: e.target.value})}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
            placeholder="es. Centro Sportivo"
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Città
          </label>
          <input
            type="text"
            value={formData.city}
            onChange={(e) => setFormData({...formData, city: e.target.value})}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
            placeholder="es. Napoli"
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Provincia
          </label>
          <input
            type="text"
            value={formData.province}
            onChange={(e) => setFormData({...formData, province: e.target.value})}
            maxLength={2}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
            placeholder="es. NA"
          />
        </div>
      </div>
      
      <div className="flex justify-end space-x-4">
        <button
          type="button"
          onClick={() => router.back()}
          className="px-6 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
        >
          Annulla
        </button>
        <button
          type="submit"
          disabled={loading}
          className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50"
        >
          {loading ? 'Creazione...' : 'Crea Torneo'}
        </button>
      </div>
    </form>
  )
}
