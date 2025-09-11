'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/utils/supabase/client'
import { Calendar, Clock, MapPin, Shuffle } from 'lucide-react'

interface Team {
  id: string
  name: string
  city: string
}

interface Match {
  home_team_id: string
  away_team_id: string
}

export default function MatchGenerator({ 
  tournamentId, 
  teams,
  existingMatches
}: { 
  tournamentId: string
  teams: Team[]
  existingMatches: any[]
}) {
  const router = useRouter()
  const supabase = createClient()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  
  const [config, setConfig] = useState({
    totalMatches: teams.length * (teams.length - 1), // Andata e ritorno di default
    startDate: '',
    startTime: '15:00',
    matchesPerDay: 2,
    venue: '',
    allowRematch: true
  })
  
  // Calcola il numero massimo di partite possibili
  const maxUniqueMatches = (teams.length * (teams.length - 1)) / 2
  const maxWithRematch = teams.length * (teams.length - 1)
  
  // Genera tutte le combinazioni possibili di partite
  const generateAllPossibleMatches = (): Match[] => {
    const matches: Match[] = []
    
    for (let i = 0; i < teams.length; i++) {
      for (let j = i + 1; j < teams.length; j++) {
        // Prima partita (casa-ospite)
        matches.push({
          home_team_id: teams[i].id,
          away_team_id: teams[j].id
        })
        
        if (config.allowRematch) {
          // Partita di ritorno (invertiti)
          matches.push({
            home_team_id: teams[j].id,
            away_team_id: teams[i].id
          })
        }
      }
    }
    
    return matches
  }
  
  // Controlla se una partita esiste già
  const matchExists = (homeId: string, awayId: string): boolean => {
    return existingMatches.some(m => 
      m.home_team_id === homeId && m.away_team_id === awayId
    )
  }
  
  // Genera il calendario
  const generateSchedule = () => {
    const allMatches = generateAllPossibleMatches()
    
    // Filtra le partite già esistenti
    const availableMatches = allMatches.filter(m => 
      !matchExists(m.home_team_id, m.away_team_id)
    )
    
    // Mescola le partite per varietà
    const shuffled = [...availableMatches].sort(() => Math.random() - 0.5)
    
    // Prendi solo il numero di partite richieste
    const selectedMatches = shuffled.slice(0, Math.min(config.totalMatches, availableMatches.length))
    
    // Distribuisci le partite nei giorni
    const schedule: any[] = []
    let currentDate = new Date(config.startDate)
    let matchIndex = 0
    
    while (matchIndex < selectedMatches.length) {
      const dayMatches = []
      
      for (let i = 0; i < config.matchesPerDay && matchIndex < selectedMatches.length; i++) {
        const match = selectedMatches[matchIndex]
        const matchTime = new Date(currentDate)
        
        // Aggiungi l'orario alla data
        const [hours, minutes] = config.startTime.split(':')
        matchTime.setHours(parseInt(hours) + i, parseInt(minutes), 0)
        
        schedule.push({
          tournament_id: tournamentId,
          home_team_id: match.home_team_id,
          away_team_id: match.away_team_id,
          match_date: matchTime.toISOString(),
          venue: config.venue,
          match_round: `Giornata ${Math.floor(matchIndex / config.matchesPerDay) + 1}`
        })
        
        matchIndex++
      }
      
      // Passa al giorno successivo (salta un giorno per riposo)
      currentDate.setDate(currentDate.getDate() + 2)
    }
    
    return schedule
  }
  
  const handleGenerate = async () => {
    if (!config.startDate) {
      setError('Seleziona una data di inizio')
      return
    }
    
    setLoading(true)
    setError(null)
    
    try {
      const schedule = generateSchedule()
      
      if (schedule.length === 0) {
        throw new Error('Nessuna partita da generare. Tutte le combinazioni sono già state create.')
      }
      
      const { error } = await supabase
        .from('tournament_matches')
        .insert(schedule)
      
      if (error) throw error
      
      router.refresh()
      
      // Reset form
      setConfig({
        ...config,
        totalMatches: teams.length * (teams.length - 1),
        startDate: '',
        venue: ''
      })
      
    } catch (err: any) {
      setError(err.message || 'Errore durante la generazione del calendario')
    } finally {
      setLoading(false)
    }
  }
  
  return (
    <div className="space-y-4">
      {error && (
        <div className="bg-red-50 text-red-600 p-3 rounded-lg text-sm">
          {error}
        </div>
      )}
      
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Numero di partite da generare
        </label>
        <input
          type="number"
          min="1"
          max={config.allowRematch ? maxWithRematch : maxUniqueMatches}
          value={config.totalMatches}
          onChange={(e) => setConfig({...config, totalMatches: parseInt(e.target.value) || 1})}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
        />
        <p className="text-xs text-gray-500 mt-1">
          Max: {config.allowRematch ? maxWithRematch : maxUniqueMatches} partite
          ({existingMatches.length} già create)
        </p>
      </div>
      
      <div className="flex items-center space-x-3">
        <input
          type="checkbox"
          id="allowRematch"
          checked={config.allowRematch}
          onChange={(e) => setConfig({
            ...config, 
            allowRematch: e.target.checked,
            totalMatches: Math.min(config.totalMatches, e.target.checked ? maxWithRematch : maxUniqueMatches)
          })}
          className="h-4 w-4 text-purple-600 rounded"
        />
        <label htmlFor="allowRematch" className="text-sm text-gray-700">
          Permetti partite di ritorno (andata e ritorno)
        </label>
      </div>
      
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Data inizio
          </label>
          <input
            type="date"
            required
            value={config.startDate}
            onChange={(e) => setConfig({...config, startDate: e.target.value})}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Ora inizio
          </label>
          <input
            type="time"
            value={config.startTime}
            onChange={(e) => setConfig({...config, startTime: e.target.value})}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
          />
        </div>
      </div>
      
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Partite per giorno
        </label>
        <select
          value={config.matchesPerDay}
          onChange={(e) => setConfig({...config, matchesPerDay: parseInt(e.target.value)})}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
        >
          <option value="1">1 partita</option>
          <option value="2">2 partite</option>
          <option value="3">3 partite</option>
          <option value="4">4 partite</option>
        </select>
      </div>
      
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Campo/Stadio (opzionale)
        </label>
        <input
          type="text"
          value={config.venue}
          onChange={(e) => setConfig({...config, venue: e.target.value})}
          placeholder="es. Campo Comunale"
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
        />
      </div>
      
      <button
        onClick={handleGenerate}
        disabled={loading || !config.startDate}
        className="w-full px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50 flex items-center justify-center space-x-2"
      >
        <Shuffle className="w-4 h-4" />
        <span>{loading ? 'Generazione...' : 'Genera Calendario'}</span>
      </button>
      
      <div className="text-xs text-gray-500 bg-gray-50 p-3 rounded">
        <p className="font-medium mb-1">Come funziona:</p>
        <ul className="space-y-1">
          <li>• Genera partite casuali tra le squadre</li>
          <li>• Priorità a squadre che non si sono mai affrontate</li>
          <li>• Distribuisce le partite nei giorni con riposo</li>
          <li>• Evita duplicati con partite già create</li>
        </ul>
      </div>
    </div>
  )
}
