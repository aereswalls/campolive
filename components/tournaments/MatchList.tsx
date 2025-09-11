'use client'

import { useState } from 'react'
import { createClient } from '@/utils/supabase/client'
import { useRouter } from 'next/navigation'
import { Calendar, MapPin, Check, X, RotateCcw } from 'lucide-react'

export default function MatchList({ 
  matches, 
  canManage 
}: { 
  matches: any[]
  canManage: boolean 
}) {
  const router = useRouter()
  const supabase = createClient()
  const [updatingMatch, setUpdatingMatch] = useState<string | null>(null)
  const [scores, setScores] = useState<{[key: string]: {home: number, away: number}}>({})
  
  const handleUpdateScore = async (matchId: string) => {
    const score = scores[matchId]
    if (!score) return
    
    setUpdatingMatch(matchId)
    
    const { error } = await supabase
      .from('tournament_matches')
      .update({
        home_team_score: score.home,
        away_team_score: score.away,
        is_completed: true
      })
      .eq('id', matchId)
    
    if (error) {
      console.error('Errore aggiornamento risultato:', error)
      alert('Errore nell\'aggiornamento del risultato')
    } else {
      // Aggiorna le statistiche delle squadre
      await updateTeamStats(matchId, score.home, score.away)
      
      // Resetta lo stato locale
      setScores(prev => {
        const newScores = {...prev}
        delete newScores[matchId]
        return newScores
      })
      
      router.refresh()
    }
    
    setUpdatingMatch(null)
  }
  
  const updateTeamStats = async (matchId: string, homeScore: number, awayScore: number) => {
    const match = matches.find(m => m.id === matchId)
    if (!match) return
    
    const supabase = createClient()
    
    // Determina il risultato
    const homeWon = homeScore > awayScore
    const draw = homeScore === awayScore
    
    // Aggiorna statistiche squadra casa
    const homeStats = {
      matches_played: 1,
      matches_won: homeWon ? 1 : 0,
      matches_drawn: draw ? 1 : 0,
      matches_lost: !homeWon && !draw ? 1 : 0,
      goals_for: homeScore,
      goals_against: awayScore,
      points: homeWon ? 3 : (draw ? 1 : 0)
    }
    
    // Aggiorna statistiche squadra ospite
    const awayStats = {
      matches_played: 1,
      matches_won: !homeWon && !draw ? 1 : 0,
      matches_drawn: draw ? 1 : 0,
      matches_lost: homeWon ? 1 : 0,
      goals_for: awayScore,
      goals_against: homeScore,
      points: !homeWon && !draw ? 3 : (draw ? 1 : 0)
    }
    
    // Aggiorna nel database
    await supabase.rpc('update_team_stats', {
      p_tournament_id: match.tournament_id,
      p_home_team_id: match.home_team_id,
      p_away_team_id: match.away_team_id,
      p_home_stats: homeStats,
      p_away_stats: awayStats
    }).catch(err => console.error('Errore aggiornamento statistiche:', err))
  }
  
  const handleResetScore = async (matchId: string) => {
    if (!confirm('Vuoi annullare questo risultato?')) return
    
    setUpdatingMatch(matchId)
    
    const { error } = await supabase
      .from('tournament_matches')
      .update({
        home_team_score: null,
        away_team_score: null,
        is_completed: false
      })
      .eq('id', matchId)
    
    if (!error) {
      router.refresh()
    }
    
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
      {matches.map((match) => {
        const isEditing = updatingMatch === match.id || scores[match.id] !== undefined
        
        return (
          <div 
            key={match.id} 
            className={`border rounded-lg p-4 ${match.is_completed ? 'bg-gray-50' : 'bg-white'}`}
          >
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm text-gray-500">{match.match_round}</span>
              <div className="flex items-center space-x-2">
                {match.is_completed ? (
                  <>
                    <span className="text-xs px-2 py-1 bg-green-100 text-green-700 rounded">
                      Completata
                    </span>
                    {canManage && (
                      <button
                        onClick={() => handleResetScore(match.id)}
                        className="p-1 text-gray-500 hover:text-red-600"
                        title="Annulla risultato"
                      >
                        <RotateCcw className="w-4 h-4" />
                      </button>
                    )}
                  </>
                ) : (
                  <span className="text-xs px-2 py-1 bg-yellow-100 text-yellow-700 rounded">
                    Da giocare
                  </span>
                )}
              </div>
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
                ) : canManage ? (
                  isEditing ? (
                    <div className="flex items-center space-x-2">
                      <input
                        type="number"
                        min="0"
                        value={scores[match.id]?.home || 0}
                        onChange={(e) => setScores(prev => ({
                          ...prev,
                          [match.id]: {
                            ...prev[match.id],
                            home: parseInt(e.target.value) || 0,
                            away: prev[match.id]?.away || 0
                          }
                        }))}
                        className="w-12 px-2 py-1 border rounded text-center"
                        placeholder="0"
                      />
                      <span>-</span>
                      <input
                        type="number"
                        min="0"
                        value={scores[match.id]?.away || 0}
                        onChange={(e) => setScores(prev => ({
                          ...prev,
                          [match.id]: {
                            home: prev[match.id]?.home || 0,
                            away: parseInt(e.target.value) || 0
                          }
                        }))}
                        className="w-12 px-2 py-1 border rounded text-center"
                        placeholder="0"
                      />
                      <button
                        onClick={() => handleUpdateScore(match.id)}
                        disabled={updatingMatch === match.id}
                        className="p-1 text-green-600 hover:bg-green-50 rounded disabled:opacity-50"
                      >
                        <Check className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => setScores(prev => {
                          const newScores = {...prev}
                          delete newScores[match.id]
                          return newScores
                        })}
                        className="p-1 text-red-600 hover:bg-red-50 rounded"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  ) : (
                    <button
                      onClick={() => setScores(prev => ({
                        ...prev,
                        [match.id]: { home: 0, away: 0 }
                      }))}
                      className="px-3 py-1 text-sm bg-blue-600 text-white rounded hover:bg-blue-700"
                    >
                      Inserisci Risultato
                    </button>
                  )
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
        )
      })}
    </div>
  )
}
