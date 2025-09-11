import { createClient } from '@/utils/supabase/server'
import { NextResponse } from 'next/server'

export async function GET(request: Request) {
  const supabase = createClient()
  
  const { searchParams } = new URL(request.url)
  const tournamentId = searchParams.get('tournamentId')
  const teamId = searchParams.get('teamId')
  
  let query = supabase.from('tournament_matches').select(`
    *,
    home_team:teams!tournament_matches_home_team_id_fkey (*),
    away_team:teams!tournament_matches_away_team_id_fkey (*),
    tournament:tournaments (*)
  `)
  
  if (tournamentId) {
    query = query.eq('tournament_id', tournamentId)
  }
  
  if (teamId) {
    query = query.or(`home_team_id.eq.${teamId},away_team_id.eq.${teamId}`)
  }
  
  const { data, error } = await query.order('match_date', { ascending: true })
  
  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 })
  }
  
  return NextResponse.json(data)
}

export async function POST(request: Request) {
  const supabase = createClient()
  const body = await request.json()
  
  const { data, error } = await supabase
    .from('tournament_matches')
    .insert(body)
    .select()
    .single()
  
  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 })
  }
  
  return NextResponse.json(data)
}

export async function PATCH(request: Request) {
  const supabase = createClient()
  const body = await request.json()
  const { id, ...updates } = body
  
  const { data, error } = await supabase
    .from('tournament_matches')
    .update(updates)
    .eq('id', id)
    .select()
    .single()
  
  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 })
  }
  
  return NextResponse.json(data)
}
