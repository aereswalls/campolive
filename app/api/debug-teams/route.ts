import { createClient } from '@/utils/supabase/server'
import { NextResponse } from 'next/server'

export async function GET() {
  const supabase = createClient()
  
  // Recupera tutti i team
  const { data: teams, error: teamsError } = await supabase
    .from('teams')
    .select('*')
  
  // Recupera tutti i tournament_teams
  const { data: tournamentTeams, error: ttError } = await supabase
    .from('tournament_teams')
    .select('*')
  
  return NextResponse.json({
    teams: teams || [],
    teamsError,
    tournamentTeams: tournamentTeams || [],
    ttError,
    totalTeams: teams?.length || 0,
    totalTournamentTeams: tournamentTeams?.length || 0
  })
}
