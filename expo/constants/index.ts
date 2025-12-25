export const SPORTS = [
  { value: 'calcio', label: 'Calcio', emoji: '⚽' },
  { value: 'calcio_5', label: 'Calcio a 5', emoji: '⚽' },
  { value: 'calcio_7', label: 'Calcio a 7', emoji: '⚽' },
  { value: 'calcio_8', label: 'Calcio a 8', emoji: '⚽' },
  { value: 'basket', label: 'Basket', emoji: '🏀' },
  { value: 'volley', label: 'Pallavolo', emoji: '🏐' },
  { value: 'tennis', label: 'Tennis', emoji: '🎾' },
  { value: 'padel', label: 'Padel', emoji: '🎾' },
] as const

export const TOURNAMENT_FORMATS = [
  { value: 'campionato', label: 'Campionato (tutti contro tutti)' },
  { value: 'eliminazione_diretta', label: 'Eliminazione Diretta' },
  { value: 'gironi_ed_eliminazione', label: 'Gironi + Eliminazione' },
  { value: 'coppa', label: 'Coppa' },
  { value: 'amichevole', label: 'Torneo Amichevole' },
] as const

export const TOURNAMENT_STATUSES = {
  draft: { label: 'Bozza', color: 'gray' },
  registration_open: { label: 'Iscrizioni Aperte', color: 'blue' },
  in_progress: { label: 'In Corso', color: 'green' },
  completed: { label: 'Completato', color: 'purple' },
  cancelled: { label: 'Cancellato', color: 'red' },
} as const

export const TEAM_LEVELS = [
  { value: 'amatoriale', label: 'Amatoriale' },
  { value: 'semi-professionistico', label: 'Semi-professionistico' },
  { value: 'professionistico', label: 'Professionistico' },
] as const

export const EVENT_TYPES = [
  { value: 'partita', label: 'Partita' },
  { value: 'allenamento', label: 'Allenamento' },
  { value: 'altro', label: 'Altro' },
] as const

export const EVENT_STATUSES = {
  scheduled: { label: 'Programmato', color: 'blue' },
  live: { label: 'In Diretta', color: 'red' },
  completed: { label: 'Completato', color: 'green' },
  cancelled: { label: 'Cancellato', color: 'gray' },
} as const

// Highlight settings
export const HIGHLIGHT_DURATION_SECONDS = 30
export const UNLOCK_BUTTONS_SECONDS = 5 // Secondi prima di sbloccare Salva/Scarta
export const MAX_RECORDING_DURATION_HOURS = 3
