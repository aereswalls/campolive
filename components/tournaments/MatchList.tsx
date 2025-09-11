'use client'

import { useState } from 'react'
import { createClient } from '@/utils/supabase/client'
import { useRouter } from 'next/navigation'
import { Calendar, MapPin, Check, X } from 'lucide-react'

export default function MatchList({ 
  matches, 
  isOwner 
}: { 
  matches: any[]
  isOwner: boolean 
}) {
  const router = useRouter()
  const supabase = createClient()
  const [updatingMatch, setUpdatingMatch] = useState<string | null>(null)
  
  const handleUpdateScore = async (matchId: string, homeScore: number, awayScore: number) => {
    setUpdatingMatch(matchId)
    
    await supabase
      .from('tournament_matches')
      .update({
        home_team_score: homeScore,
        away_team_score: awayScore,
        is_completed: true
      })
      .eq('id', matchId)
    
    router.refresh()
    setUpdatingMatch(null)
  }
  
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('it-IT', {
      weekday: 'short',
      day: 'numeric',
      month: 'short',
      hour: '2-digit',
      minute: '2-digit'
    })
  }
  
  if (matches.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500">
        Nessuna partita programmata
      </div>
    )
  }
  
  return (
    <div className="space-y-4">
      {matches.map((match) => (
        <div 
          key={match.id} 
          className={`border rounded-lg p-4 ${match.is_completed ? 'bg-gray-50' : 'bg-white'}`}
        >
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm text-gray-500">{match.match_round}</span>
            {match.is_completed ? (
              <span className="text-xs px-2 py-1 bg-green-100 text-green-700 rounded">
                Completata
              </span>
            ) : (
              <span className="text-xs px-2 py-1 bg-yellow-100 text-yellow-700 rounded">
                Da giocare
              </span>
            )}
          </div>
          
          <div className="flex items-center justify-between mb-3">
            <div className="flex-1 text-right">
              <span className="font-semibold text-lg">{match.home_team.name}</span>
            </div>
            
            <div className="px-6">
              {match.is_completed ? (
                <div className="flex items-center space-x-2">
                  <span className="text-2xl font-bold">{match.home_team_score}</span>
                  <span className="text-gray-400">-</span>
                  <span className="text-2xl font-bold">{match.away_team_score}</span>
                </div>
              ) : isOwner && updatingMatch !== match.id ? (
                <button
                  onClick={() => setUpdatingMatch(match.id)}
                  className="px-3 py-1 text-sm bg-blue-600 text-white rounded hover:bg-blue-700"
                >
                  Inserisci Risultato
                </button>
              ) : updatingMatch === match.id ? (
                <ScoreInput 
                  onSave={(home, away) => handleUpdateScore(match.id, home, away)}
                  onCancel={() => setUpdatingMatch(null)}
                />
              ) : (
                <span className="text-xl text-gray-400">VS</span>
              )}
            </div>
            
            <div className="flex-1">
              <span className="font-semibold text-lg">{match.away_team.name}</span>
            </div>
          </div>
          
          <div className="flex items-center justify-between text-sm text-gray-500">
            <div className="flex items-center space-x-2">
              <Calendar className="w-4 h-4" />
              <span>{formatDate(match.match_date)}</span>
            </div>
            {match.venue && (
              <div className="flex items-center space-x-2">
                <MapPin className="w-4 h-4" />
                <span>{match.venue}</span>
              </div>
            )}
          </div>
        </div>
      ))}
    </div>
  )
}

function ScoreInput({ 
  onSave, 
  onCancel 
}: { 
  onSave: (home: number, away: number) => void
  onCancel: () => void 
}) {
  const [homeScore, setHomeScore] = useState(0)
  const [awayScore, setAwayScore] = useState(0)
  
  return (
    <div className="flex items-center space-x-2">
      <input
        type="number"
        min="0"
        value={homeScore}
        onChange={(e) => setHomeScore(parseInt(e.target.value) || 0)}
        className="w-12 px-2 py-1 border rounded text-center"
      />
      <span>-</span>
      <input
        type="number"
        min="0"
        value={awayScore}
        onChange={(e) => setAwayScore(parseInt(e.target.value) || 0)}
        className="w-12 px-2 py-1 border rounded text-center"
      />
      <button
        onClick={() => onSave(homeScore, awayScore)}
        className="p-1 text-green-600 hover:bg-green-50 rounded"
      >
        <Check className="w-4 h-4" />
      </button>
      <button
        onClick={onCancel}
        className="p-1 text-red-600 hover:bg-red-50 rounded"
      >
        <X className="w-4 h-4" />
      </button>
    </div>
  )
}
