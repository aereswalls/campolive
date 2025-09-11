'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/utils/supabase/client'
import { Play, Pause, CheckCircle, XCircle, AlertCircle } from 'lucide-react'

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
  { value: 'campionato', label: 'Campionato' },
  { value: 'eliminazione_diretta', label: 'Eliminazione Diretta' },
  { value: 'gironi_ed_eliminazione', label: 'Gironi + Eliminazione' },
  { value: 'coppa', label: 'Coppa' },
  { value: 'amichevole', label: 'Amichevole' },
]

const STATUS_OPTIONS = [
  { value: 'draft', label: 'Bozza', icon: AlertCircle, color: 'gray' },
  { value: 'registration_open', label: 'Iscrizioni Aperte', icon: Play, color: 'blue' },
  { value: 'in_progress', label: 'In Corso', icon: Play, color: 'green' },
  { value: 'completed', label: 'Completato', icon: CheckCircle, color: 'purple' },
  { value: 'cancelled', label: 'Cancellato', icon: XCircle, color: 'red' },
]

export default function TournamentEditForm({ tournament }: { tournament: any }) {
  const router = useRouter()
  const supabase = createClient()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [changingStatus, setChangingStatus] = useState(false)
  
  const [formData, setFormData] = useState({
    name: tournament.name,
    description: tournament.description || '',
    sport: tournament.sport,
    format: tournament.format,
    status: tournament.status,
    start_date: tournament.start_date || '',
    end_date: tournament.end_date || '',
    registration_deadline: tournament.registration_deadline || '',
    max_teams: tournament.max_teams,
    min_teams: tournament.min_teams,
    max_players_per_team: tournament.max_players_per_team,
    min_players_per_team: tournament.min_players_per_team,
    location: tournament.location || '',
    city: tournament.city || '',
    province: tournament.province || '',
  })
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)
    
    const { error } = await supabase
      .from('tournaments')
      .update(formData)
      .eq('id', tournament.id)
    
    if (error) {
      setError(error.message)
      setLoading(false)
    } else {
      router.push(`/tournaments/${tournament.id}`)
    }
  }
  
  const handleStatusChange = async (newStatus: string) => {
    setChangingStatus(true)
    setError(null)
    
    const { error } = await supabase
      .from('tournaments')
      .update({ status: newStatus })
      .eq('id', tournament.id)
    
    if (error) {
      setError(error.message)
    } else {
      setFormData({ ...formData, status: newStatus })
      router.refresh()
    }
    
    setChangingStatus(false)
  }
  
  const currentStatus = STATUS_OPTIONS.find(s => s.value === formData.status)
  
  return (
    <div className="space-y-6">
      {/* Controllo Stato Torneo */}
      <div className="bg-gray-50 rounded-lg p-6 border border-gray-200">
        <h3 className="font-semibold mb-4">Stato del Torneo</h3>
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-2">
            {currentStatus && (
              <>
                <currentStatus.icon className={`w-5 h-5 text-${currentStatus.color}-500`} />
                <span className={`font-medium text-${currentStatus.color}-700`}>
                  {currentStatus.label}
                </span>
              </>
            )}
          </div>
        </div>
        
        <div className="flex flex-wrap gap-2">
          {formData.status === 'draft' && (
            <button
              onClick={() => handleStatusChange('registration_open')}
              disabled={changingStatus}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
            >
              Apri Iscrizioni
            </button>
          )}
          
          {formData.status === 'registration_open' && (
            <>
              <button
                onClick={() => handleStatusChange('in_progress')}
                disabled={changingStatus}
                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50"
              >
                Inizia Torneo
              </button>
              <button
                onClick={() => handleStatusChange('draft')}
                disabled={changingStatus}
                className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 disabled:opacity-50"
              >
                Torna in Bozza
              </button>
            </>
          )}
          
          {formData.status === 'in_progress' && (
            <>
              <button
                onClick={() => handleStatusChange('completed')}
                disabled={changingStatus}
                className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50"
              >
                Concludi Torneo
              </button>
              <button
                onClick={() => handleStatusChange('registration_open')}
                disabled={changingStatus}
                className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 disabled:opacity-50"
              >
                Riapri Iscrizioni
              </button>
            </>
          )}
          
          {formData.status === 'completed' && (
            <button
              onClick={() => handleStatusChange('in_progress')}
              disabled={changingStatus}
              className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50"
            >
              Riprendi Torneo
            </button>
          )}
          
          {formData.status !== 'cancelled' && (
            <button
              onClick={() => {
                if (confirm('Sei sicuro di voler cancellare il torneo?')) {
                  handleStatusChange('cancelled')
                }
              }}
              disabled={changingStatus}
              className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50"
            >
              Cancella Torneo
            </button>
          )}
        </div>
      </div>
      
      {/* Form di modifica */}
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
              Località
            </label>
            <input
              type="text"
              value={formData.location}
              onChange={(e) => setFormData({...formData, location: e.target.value})}
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
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
            />
          </div>
        </div>
        
        <div className="grid md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Numero Max Squadre
            </label>
            <input
              type="number"
              value={formData.max_teams}
              onChange={(e) => setFormData({...formData, max_teams: parseInt(e.target.value)})}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
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
            {loading ? 'Salvataggio...' : 'Salva Modifiche'}
          </button>
        </div>
      </form>
    </div>
  )
}
