'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/utils/supabase/client'
import { Clock, MapPin, Plus, Minus, Check } from 'lucide-react'

interface LiveMatchCardProps {
  match: any
  tournamentId: string
  canManage: boolean
}

export default function LiveMatchCard({ match, tournamentId, canManage }: LiveMatchCardProps) {
  const router = useRouter()
  const supabase = createClient()
  const [homeScore, setHomeScore] = useState(match.home_team_score || 0)
  const [awayScore, setAwayScore] = useState(match.away_team_score || 0)
  const [saving, setSaving] = useState(false)
  
  const updateScore = async (team: 'home' | 'away', delta: number) => {
    if (!canManage) return
    
    const newHomeScore = team === 'home' ? homeScore + delta : homeScore
    const newAwayScore = team === 'away' ? awayScore + delta : awayScore
    
    if (newHomeScore < 0 || newAwayScore < 0) return
    
    setHomeScore(newHomeScore)
    setAwayScore(newAwayScore)
  }
  
  const saveScore = async () => {
    setSaving(true)
    
    const { error } = await supabase
      .from('tournament_matches')
      .update({
        home_team_score: homeScore,
        away_team_score: awayScore
      })
      .eq('id', match.id)
    
    if (!error) {
      router.refresh()
    }
    
    setSaving(false)
  }
  
  const completeMatch = async () => {
    if (!confirm('Confermi di voler terminare questa partita?')) return
    
    setSaving(true)
    
    const { error } = await supabase
      .from('tournament_matches')
      .update({
        home_team_score: homeScore,
        away_team_score: awayScore,
        is_completed: true
      })
      .eq('id', match.id)
    
    if (!error) {
      // Aggiorna anche le statistiche delle squadre
      await updateTeamStats()
      router.refresh()
    }
    
    setSaving(false)
  }
  
  const updateTeamStats = async () => {
    // Logica per aggiornare punti e statistiche delle squadre
    // Da implementare basandosi sulle regole del torneo
  }
  
  const matchTime = new Date(match.match_date)
  const now = new Date()
  const isLive = now >= matchTime && !match.is_completed
  
  return (
    <div className={`border rounded-lg p-4 ${isLive ? 'border-red-500 bg-red-50' : 'bg-white'}`}>
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center space-x-2">
          {isLive && (
            <div className="flex items-center space-x-1">
              <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
              <span className="text-xs font-medium text-red-600">LIVE</span>
            </div>
          )}
          <span className="text-sm text-gray-500">{match.match_round}</span>
        </div>
        <div className="flex items-center space-x-2 text-xs text-gray-500">
          <Clock className="w-3 h-3" />
          <span>{matchTime.toLocaleTimeString('it-IT', { hour: '2-digit', minute: '2-digit' })}</span>
        </div>
      </div>
      
      <div className="flex items-center justify-between mb-3">
        <div className="flex-1 text-right">
          <p className="font-semibold">{match.home_team.name}</p>
        </div>
        
        <div className="px-6">
          {canManage && isLive ? (
            <div className="flex items-center space-x-2">
              <div className="flex flex-col items-center">
                <button 
                  onClick={() => updateScore('home', 1)}
                  className="p-1 hover:bg-gray-200 rounded"
                  disabled={saving}
                >
                  <Plus className="w-4 h-4" />
                </button>
                <span className="text-2xl font-bold my-1">{homeScore}</span>
                <button 
                  onClick={() => updateScore('home', -1)}
                  className="p-1 hover:bg-gray-200 rounded"
                  disabled={saving || homeScore === 0}
                >
                  <Minus className="w-4 h-4" />
                </button>
              </div>
              
              <span className="text-gray-400">-</span>
              
              <div className="flex flex-col items-center">
                <button 
                  onClick={() => updateScore('away', 1)}
                  className="p-1 hover:bg-gray-200 rounded"
                  disabled={saving}
                >
                  <Plus className="w-4 h-4" />
                </button>
                <span className="text-2xl font-bold my-1">{awayScore}</span>
                <button 
                  onClick={() => updateScore('away', -1)}
                  className="p-1 hover:bg-gray-200 rounded"
                  disabled={saving || awayScore === 0}
                >
                  <Minus className="w-4 h-4" />
                </button>
              </div>
            </div>
          ) : (
            <div className="flex items-center space-x-2">
              <span className="text-2xl font-bold">{match.home_team_score || 0}</span>
              <span className="text-gray-400">-</span>
              <span className="text-2xl font-bold">{match.away_team_score || 0}</span>
            </div>
          )}
        </div>
        
        <div className="flex-1">
          <p className="font-semibold">{match.away_team.name}</p>
        </div>
      </div>
      
      {match.venue && (
        <div className="flex items-center justify-center text-xs text-gray-500 mb-3">
          <MapPin className="w-3 h-3 mr-1" />
          <span>{match.venue}</span>
        </div>
      )}
      
      {canManage && isLive && (
        <div className="flex justify-center space-x-2">
          <button
            onClick={saveScore}
            disabled={saving}
            className="px-3 py-1 bg-blue-600 text-white text-sm rounded hover:bg-blue-700 disabled:opacity-50"
          >
            Salva Punteggio
          </button>
          <button
            onClick={completeMatch}
            disabled={saving}
            className="px-3 py-1 bg-green-600 text-white text-sm rounded hover:bg-green-700 disabled:opacity-50 flex items-center space-x-1"
          >
            <Check className="w-4 h-4" />
            <span>Termina Partita</span>
          </button>
        </div>
      )}
    </div>
  )
}
