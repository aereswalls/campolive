'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/utils/supabase/client'

export default function MatchForm({ 
  tournamentId, 
  teams 
}: { 
  tournamentId: string
  teams: any[]
}) {
  const router = useRouter()
  const supabase = createClient()
  const [loading, setLoading] = useState(false)
  
  const [formData, setFormData] = useState({
    home_team_id: '',
    away_team_id: '',
    match_date: '',
    match_time: '',
    venue: '',
    match_round: ''
  })
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (formData.home_team_id === formData.away_team_id) {
      alert('Le squadre devono essere diverse!')
      return
    }
    
    setLoading(true)
    
    const matchDateTime = `${formData.match_date}T${formData.match_time}:00`
    
    const { error } = await supabase
      .from('tournament_matches')
      .insert({
        tournament_id: tournamentId,
        home_team_id: formData.home_team_id,
        away_team_id: formData.away_team_id,
        match_date: matchDateTime,
        venue: formData.venue,
        match_round: formData.match_round
      })
    
    if (!error) {
      setFormData({
        home_team_id: '',
        away_team_id: '',
        match_date: '',
        match_time: '',
        venue: '',
        match_round: ''
      })
      router.refresh()
    }
    
    setLoading(false)
  }
  
  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Squadra Casa *
          </label>
          <select
            required
            value={formData.home_team_id}
            onChange={(e) => setFormData({...formData, home_team_id: e.target.value})}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
          >
            <option value="">Seleziona...</option>
            {teams.map(team => (
              <option key={team.id} value={team.id}>
                {team.name}
              </option>
            ))}
          </select>
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Squadra Ospite *
          </label>
          <select
            required
            value={formData.away_team_id}
            onChange={(e) => setFormData({...formData, away_team_id: e.target.value})}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
          >
            <option value="">Seleziona...</option>
            {teams.map(team => (
              <option key={team.id} value={team.id}>
                {team.name}
              </option>
            ))}
          </select>
        </div>
      </div>
      
      <div className="grid md:grid-cols-3 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Data *
          </label>
          <input
            type="date"
            required
            value={formData.match_date}
            onChange={(e) => setFormData({...formData, match_date: e.target.value})}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Ora *
          </label>
          <input
            type="time"
            required
            value={formData.match_time}
            onChange={(e) => setFormData({...formData, match_time: e.target.value})}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Giornata/Turno
          </label>
          <input
            type="text"
            value={formData.match_round}
            onChange={(e) => setFormData({...formData, match_round: e.target.value})}
            placeholder="es. Giornata 1"
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
          />
        </div>
      </div>
      
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Campo/Stadio
        </label>
        <input
          type="text"
          value={formData.venue}
          onChange={(e) => setFormData({...formData, venue: e.target.value})}
          placeholder="es. Campo Comunale"
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
        />
      </div>
      
      <button
        type="submit"
        disabled={loading}
        className="w-full px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50"
      >
        {loading ? 'Creazione...' : 'Aggiungi Partita'}
      </button>
    </form>
  )
}
