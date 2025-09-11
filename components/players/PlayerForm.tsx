'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/utils/supabase/client'

// Valori ESATTI dall'ENUM player_position nel database
const POSITIONS = [
  { value: 'portiere', label: 'Portiere' },
  { value: 'difensore_centrale', label: 'Difensore Centrale' },
  { value: 'terzino_destro', label: 'Terzino Destro' },
  { value: 'terzino_sinistro', label: 'Terzino Sinistro' },
  { value: 'centrocampista_centrale', label: 'Centrocampista Centrale' },
  { value: 'centrocampista_difensivo', label: 'Centrocampista Difensivo' },
  { value: 'centrocampista_offensivo', label: 'Centrocampista Offensivo' },
  { value: 'ala_destra', label: 'Ala Destra' },
  { value: 'ala_sinistra', label: 'Ala Sinistra' },
  { value: 'attaccante_centrale', label: 'Attaccante Centrale' },
  { value: 'seconda_punta', label: 'Seconda Punta' },
  { value: 'playmaker', label: 'Playmaker' },
  { value: 'universale', label: 'Universale' }
]

export default function PlayerForm({ teamId }: { teamId: string }) {
  const router = useRouter()
  const supabase = createClient()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
  
  const [formData, setFormData] = useState({
    first_name: '',
    last_name: '',
    date_of_birth: '',
    jersey_number: '',
    position: 'centrocampista_centrale', // Valore di default valido
    email: '',
    phone: '',
  })
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)
    setSuccess(false)
    
    try {
      const playerData = {
        team_id: teamId,
        first_name: formData.first_name.trim(),
        last_name: formData.last_name.trim(),
        date_of_birth: formData.date_of_birth,
        jersey_number: formData.jersey_number ? parseInt(formData.jersey_number) : null,
        position: formData.position, // Ora usa un valore valido dall'ENUM
        email: formData.email.trim() || null,
        phone: formData.phone.trim() || null,
        nationality: 'IT',
        is_active: true
      }
      
      console.log('Sending player data:', playerData) // Debug
      
      const { data, error } = await supabase
        .from('players')
        .insert(playerData)
        .select()
        .single()
      
      if (error) {
        console.error('Supabase error:', error)
        throw error
      }
      
      console.log('Player created:', data) // Debug
      
      // Reset form
      setFormData({
        first_name: '',
        last_name: '',
        date_of_birth: '',
        jersey_number: '',
        position: 'centrocampista_centrale',
        email: '',
        phone: '',
      })
      
      setSuccess(true)
      setTimeout(() => setSuccess(false), 3000)
      
      // Refresh la pagina
      router.refresh()
      
    } catch (err: any) {
      console.error('Error creating player:', err)
      setError(err.message || 'Errore durante l\'aggiunta del giocatore')
    } finally {
      setLoading(false)
    }
  }
  
  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && (
        <div className="bg-red-50 text-red-600 p-3 rounded-lg text-sm">
          {error}
        </div>
      )}
      
      {success && (
        <div className="bg-green-50 text-green-600 p-3 rounded-lg text-sm">
          Giocatore aggiunto con successo!
        </div>
      )}
      
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-xs font-medium text-gray-700 mb-1">
            Nome *
          </label>
          <input
            type="text"
            required
            value={formData.first_name}
            onChange={(e) => setFormData({...formData, first_name: e.target.value})}
            className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-green-500"
            disabled={loading}
          />
        </div>
        
        <div>
          <label className="block text-xs font-medium text-gray-700 mb-1">
            Cognome *
          </label>
          <input
            type="text"
            required
            value={formData.last_name}
            onChange={(e) => setFormData({...formData, last_name: e.target.value})}
            className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-green-500"
            disabled={loading}
          />
        </div>
      </div>
      
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-xs font-medium text-gray-700 mb-1">
            Data di Nascita *
          </label>
          <input
            type="date"
            required
            value={formData.date_of_birth}
            onChange={(e) => setFormData({...formData, date_of_birth: e.target.value})}
            className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-green-500"
            disabled={loading}
          />
        </div>
        
        <div>
          <label className="block text-xs font-medium text-gray-700 mb-1">
            Numero Maglia
          </label>
          <input
            type="number"
            min="1"
            max="99"
            value={formData.jersey_number}
            onChange={(e) => setFormData({...formData, jersey_number: e.target.value})}
            className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-green-500"
            disabled={loading}
            placeholder="1-99"
          />
        </div>
      </div>
      
      <div>
        <label className="block text-xs font-medium text-gray-700 mb-1">
          Ruolo *
        </label>
        <select
          value={formData.position}
          onChange={(e) => setFormData({...formData, position: e.target.value})}
          className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-green-500"
          disabled={loading}
          required
        >
          {POSITIONS.map(pos => (
            <option key={pos.value} value={pos.value}>
              {pos.label}
            </option>
          ))}
        </select>
      </div>
      
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-xs font-medium text-gray-700 mb-1">
            Email (opzionale)
          </label>
          <input
            type="email"
            value={formData.email}
            onChange={(e) => setFormData({...formData, email: e.target.value})}
            className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-green-500"
            disabled={loading}
            placeholder="email@esempio.com"
          />
        </div>
        
        <div>
          <label className="block text-xs font-medium text-gray-700 mb-1">
            Telefono (opzionale)
          </label>
          <input
            type="tel"
            value={formData.phone}
            onChange={(e) => setFormData({...formData, phone: e.target.value})}
            className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-green-500"
            disabled={loading}
            placeholder="+39 333 1234567"
          />
        </div>
      </div>
      
      <button
        type="submit"
        disabled={loading}
        className="w-full px-3 py-2 bg-green-600 text-white text-sm rounded hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition"
      >
        {loading ? 'Aggiunta in corso...' : 'Aggiungi Giocatore'}
      </button>
    </form>
  )
}
