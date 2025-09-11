'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/utils/supabase/client'
import Link from 'next/link'
import { Check } from 'lucide-react'

interface Team {
  id: string
  name: string
  city: string
  sport_type: string
}

export default function AddTeamToTournament({ 
  tournamentId,
  availableTeams,
  maxTeams,
  currentTeamsCount
}: { 
  tournamentId: string
  availableTeams: Team[]
  maxTeams: number
  currentTeamsCount: number
}) {
  const router = useRouter()
  const supabase = createClient()
  const [selectedTeams, setSelectedTeams] = useState<string[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  
  const remainingSlots = maxTeams - currentTeamsCount
  
  const toggleTeam = (teamId: string) => {
    if (selectedTeams.includes(teamId)) {
      setSelectedTeams(selectedTeams.filter(id => id !== teamId))
    } else if (selectedTeams.length < remainingSlots) {
      setSelectedTeams([...selectedTeams, teamId])
    }
  }
  
  const handleSubmit = async () => {
    if (selectedTeams.length === 0) return
    
    setLoading(true)
    setError(null)
    
    try {
      // Aggiungi tutte le squadre selezionate
      const insertData = selectedTeams.map(teamId => ({
        tournament_id: tournamentId,
        team_id: teamId,
        registration_status: 'approved',
        registration_date: new Date().toISOString()
      }))
      
      const { error } = await supabase
        .from('tournament_teams')
        .insert(insertData)
      
      if (error) throw error
      
      router.push(`/tournaments/${tournamentId}`)
    } catch (err: any) {
      setError(err.message || 'Errore durante l\'aggiunta delle squadre')
      setLoading(false)
    }
  }
  
  if (availableTeams.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-12 text-center">
        <p className="text-gray-500 mb-4">Nessuna squadra disponibile da aggiungere</p>
        <Link 
          href="/teams/new"
          className="inline-block px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
        >
          Crea una nuova squadra
        </Link>
      </div>
    )
  }
  
  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      {error && (
        <div className="bg-red-50 text-red-600 p-4 rounded-lg mb-4">
          {error}
        </div>
      )}
      
      <div className="mb-6">
        <p className="text-gray-600">
          Posti disponibili: <span className="font-bold">{remainingSlots}</span> / {maxTeams}
        </p>
        <p className="text-sm text-gray-500 mt-1">
          Seleziona le squadre da aggiungere al torneo
        </p>
      </div>
      
      <div className="grid md:grid-cols-2 gap-4 mb-6">
        {availableTeams.map((team) => (
          <div
            key={team.id}
            onClick={() => toggleTeam(team.id)}
            className={`
              border rounded-lg p-4 cursor-pointer transition
              ${selectedTeams.includes(team.id) 
                ? 'border-green-500 bg-green-50' 
                : 'border-gray-200 hover:border-gray-300'
              }
            `}
          >
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-semibold">{team.name}</h3>
                <p className="text-sm text-gray-600">
                  {team.city} • {team.sport_type}
                </p>
              </div>
              {selectedTeams.includes(team.id) && (
                <Check className="w-5 h-5 text-green-600" />
              )}
            </div>
          </div>
        ))}
      </div>
      
      <div className="flex justify-between items-center">
        <div className="text-sm text-gray-600">
          {selectedTeams.length} squadre selezionate
        </div>
        <div className="flex space-x-3">
          <button
            onClick={() => router.back()}
            className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
          >
            Annulla
          </button>
          <button
            onClick={handleSubmit}
            disabled={loading || selectedTeams.length === 0}
            className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50"
          >
            {loading ? 'Aggiunta...' : `Aggiungi ${selectedTeams.length} squadre`}
          </button>
        </div>
      </div>
    </div>
  )
}
