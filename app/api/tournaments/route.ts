import { createClient } from '@/utils/supabase/server'
import { NextResponse } from 'next/server'

export async function GET(request: Request) {
  const supabase = createClient()
  
  const { searchParams } = new URL(request.url)
  const userId = searchParams.get('userId')
  
  let query = supabase.from('tournaments').select(`
    *,
    tournament_teams (
      count
    )
  `)
  
  if (userId) {
    query = query.eq('created_by', userId)
  }
  
  const { data, error } = await query.order('created_at', { ascending: false })
  
  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 })
  }
  
  return NextResponse.json(data)
}

export async function POST(request: Request) {
  const supabase = createClient()
  const body = await request.json()
  
  const { data, error } = await supabase
    .from('tournaments')
    .insert(body)
    .select()
    .single()
  
  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 })
  }
  
  return NextResponse.json(data)
}
