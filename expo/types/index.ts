// Tipi per l'applicazione CampoLive

export interface User {
  id: string
  email: string
  full_name?: string
  avatar_url?: string
  created_at: string
}

export interface UserCredits {
  user_id: string
  balance: number
  total_earned: number
  total_purchased: number
  total_consumed: number
}

export interface Tournament {
  id: string
  name: string
  description?: string
  sport: Sport
  format: TournamentFormat
  status: TournamentStatus
  start_date?: string
  end_date?: string
  registration_deadline?: string
  max_teams: number
  min_teams: number
  max_players_per_team: number
  min_players_per_team: number
  location?: string
  city?: string
  province?: string
  country: string
  primary_color: string
  secondary_color: string
  created_by: string
  created_at: string
  // Flags per UI
  isOwner?: boolean
  isCollaborator?: boolean
}

export type Sport = 
  | 'calcio' 
  | 'calcio_5' 
  | 'calcio_7' 
  | 'calcio_8' 
  | 'basket' 
  | 'volley' 
  | 'tennis' 
  | 'padel'

export type TournamentFormat = 
  | 'campionato' 
  | 'eliminazione_diretta' 
  | 'gironi_ed_eliminazione' 
  | 'coppa' 
  | 'amichevole'

export type TournamentStatus = 
  | 'draft' 
  | 'registration_open' 
  | 'in_progress' 
  | 'completed' 
  | 'cancelled'

export interface Team {
  id: string
  name: string
  slug: string
  city?: string
  province?: string
  region?: string
  sport_type: string
  level: TeamLevel
  description?: string
  founded_year?: number
  logo_url?: string
  primary_color: string
  secondary_color: string
  created_by: string
  created_at: string
  // Per UI
  role?: TeamRole
}

export type TeamLevel = 'amatoriale' | 'semi-professionistico' | 'professionistico'
export type TeamRole = 'owner' | 'manager' | 'player'

export interface TeamMember {
  id: string
  team_id: string
  user_id: string
  role: TeamRole
  position?: string
  jersey_number?: number
  joined_at: string
  is_active: boolean
}

export interface TournamentTeam {
  id: string
  tournament_id: string
  team_id: string
  registration_status: 'pending' | 'approved' | 'rejected'
  seed?: number
  group_name?: string
  points: number
  matches_played: number
  wins: number
  draws: number
  losses: number
  goals_for: number
  goals_against: number
  team?: Team
}

export interface TournamentMatch {
  id: string
  tournament_id: string
  home_team_id: string
  away_team_id: string
  match_date?: string
  venue?: string
  match_round?: string
  home_team_score: number
  away_team_score: number
  is_completed: boolean
  home_team?: Team
  away_team?: Team
}

export interface Event {
  id: string
  title: string
  description?: string
  event_type: EventType
  home_team_id?: string
  away_team_id?: string
  venue_name?: string
  venue_address?: string
  scheduled_at?: string
  duration_minutes: number
  status: EventStatus
  is_public: boolean
  created_by: string
  created_at: string
  home_team?: Team
  away_team?: Team
}

export type EventType = 'partita' | 'allenamento' | 'altro'
export type EventStatus = 'scheduled' | 'live' | 'completed' | 'cancelled'

export interface LiveStream {
  id: string
  event_id: string
  stream_key: string
  status: 'pending' | 'live' | 'ended'
  started_at?: string
  ended_at?: string
  viewer_count: number
}

export interface Highlight {
  id: string
  event_id?: string
  title?: string
  file_path: string
  thumbnail_path?: string
  duration_seconds: number
  created_at: string
  is_uploaded: boolean
}

export interface CreditPackage {
  id: string
  name: string
  credits: number
  price_web: number
  price_ios: number
  price_android: number
  discount_percentage: number
  is_popular: boolean
  sort_order: number
}

export interface CreditTransaction {
  id: string
  user_id: string
  amount: number
  balance_after: number
  type: TransactionType
  description?: string
  reference_id?: string
  metadata?: Record<string, any>
  created_at: string
}

export type TransactionType = 
  | 'purchase_web' 
  | 'purchase_ios' 
  | 'purchase_android' 
  | 'consume' 
  | 'bonus' 
  | 'refund'

export interface TournamentCollaborator {
  id: string
  tournament_id: string
  user_id: string
  email: string
  status: 'pending' | 'accepted' | 'rejected'
  invited_by: string
  invited_at: string
}

// Recording types per l'app
export interface RecordingSegment {
  uri: string
  startTime: number
  endTime: number
  duration: number
}

export interface SavedHighlight {
  id: string
  uri: string
  duration: number
  createdAt: Date
  thumbnailUri?: string
}
