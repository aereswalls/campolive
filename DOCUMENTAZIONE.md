# 📱 CampoLive - Documentazione Completa

## 🎯 Panoramica del Progetto

**CampoLive** è una piattaforma web per la gestione di eventi sportivi amatoriali, tornei e trasmissioni in diretta streaming. L'applicazione permette agli organizzatori di gestire tornei, squadre, partite e trasmettere eventi sportivi in diretta.

### Stack Tecnologico Attuale (Web)
- **Frontend**: Next.js 15.5.2 con App Router
- **UI**: React 19, Tailwind CSS 4
- **Backend**: Supabase (PostgreSQL + Auth + Storage)
- **Pagamenti**: Stripe + PayPal
- **Icons**: Lucide React
- **Deployment**: Vercel

---

## 🏗️ Architettura dell'Applicazione

### Struttura delle Cartelle
```
campolive/
├── app/                    # Next.js App Router
│   ├── api/               # API Routes
│   ├── auth/              # Autenticazione
│   ├── credits/           # Gestione crediti
│   ├── dashboard/         # Dashboard utente
│   ├── events/            # Gestione eventi
│   ├── login/             # Login
│   ├── register/          # Registrazione
│   ├── teams/             # Gestione squadre
│   └── tournaments/       # Gestione tornei
├── components/            # Componenti React riutilizzabili
├── hooks/                 # Custom React hooks
├── utils/                 # Utility functions
│   └── supabase/         # Client Supabase
└── public/               # Asset statici
```

---

## 👤 Sistema di Autenticazione

### Funzionalità
- **Registrazione** con email e password
- **Login** con email/password
- **Email di conferma** tramite Supabase Auth
- **Protezione route** via middleware Next.js
- **Sessioni** gestite con cookie SSR

### Flusso di Registrazione
1. Utente compila form (nome, email, password)
2. Creazione account su Supabase Auth
3. Invio email di conferma
4. Dopo conferma → accesso alla dashboard
5. Bonus iniziale: **3 crediti gratuiti**

### Protezione Route
```typescript
// Middleware protegge /dashboard/*
// Redirect a /login se non autenticato
```

---

## 💰 Sistema di Crediti

### Concetto
I crediti sono la valuta interna per utilizzare le funzionalità premium (streaming live).

### Tabelle Database
```sql
user_credits          -- Saldo crediti utente
credit_transactions   -- Storico movimenti
credit_packages       -- Pacchetti acquistabili
```

### Tipi di Transazioni
- `purchase_web` - Acquisto da web (Stripe/PayPal)
- `purchase_ios` - Acquisto da iOS (futuro)
- `purchase_android` - Acquisto da Android (futuro)
- `consume` - Consumo per streaming
- `bonus` - Crediti bonus

### Costo Servizi
- **1 credito = 1 diretta streaming completa** (include highlights automatici)

### Metodi di Pagamento
1. **Stripe** - Carta di credito/debito
2. **PayPal** - Account PayPal

### API Pagamenti
```
POST /api/stripe/checkout     # Crea sessione Stripe
POST /api/stripe/webhook      # Webhook conferma pagamento
POST /api/paypal/create-order # Crea ordine PayPal
POST /api/paypal/capture      # Cattura pagamento PayPal
```

---

## 🏆 Gestione Tornei

### Struttura Torneo
```typescript
interface Tournament {
  id: string
  name: string
  description: string
  sport: 'calcio' | 'calcio_5' | 'calcio_7' | 'basket' | 'volley' | 'tennis' | 'padel'
  format: 'campionato' | 'eliminazione_diretta' | 'gironi_ed_eliminazione' | 'coppa' | 'amichevole'
  status: 'draft' | 'registration_open' | 'in_progress' | 'completed' | 'cancelled'
  start_date: Date
  end_date: Date
  max_teams: number
  min_teams: number
  location: string
  city: string
  province: string
  created_by: string // User ID owner
}
```

### Sport Supportati
- ⚽ Calcio (11, 7, 8, 5)
- 🏀 Basket
- 🏐 Pallavolo
- 🎾 Tennis
- 🎾 Padel

### Formati Torneo
1. **Campionato** - Tutti contro tutti
2. **Eliminazione Diretta** - Bracket stile coppa
3. **Gironi + Eliminazione** - Prima fase a gironi, poi eliminatorie
4. **Coppa** - Sorteggio con tabellone
5. **Amichevole** - Partite libere

### Flusso Stati
```
draft → registration_open → in_progress → completed
                                        ↘ cancelled
```

### Sistema Collaboratori
- **Owner** - Creatore del torneo, tutti i permessi
- **Co-organizzatore** - Invitato dall'owner, può gestire ma non eliminare

```typescript
interface TournamentPermissions {
  isOwner: boolean
  isCollaborator: boolean
  canManage: boolean    // Owner o Co-org
  canDelete: boolean    // Solo Owner
  canInvite: boolean    // Solo Owner
}
```

### Pagine Torneo
- `/tournaments` - Lista tornei dell'utente
- `/tournaments/new` - Crea nuovo torneo
- `/tournaments/[id]` - Dettaglio torneo
- `/tournaments/[id]/edit` - Modifica torneo
- `/tournaments/[id]/teams` - Squadre iscritte
- `/tournaments/[id]/teams/add` - Aggiungi squadra
- `/tournaments/[id]/matches` - Calendario partite
- `/tournaments/[id]/standings` - Classifica
- `/tournaments/[id]/live` - Gestione live (partite in corso)
- `/tournaments/[id]/collaborators` - Gestione collaboratori

---

## 👥 Gestione Squadre

### Struttura Team
```typescript
interface Team {
  id: string
  name: string
  slug: string
  city: string
  province: string
  region: string
  sport_type: string
  level: 'amatoriale' | 'semi-professionistico' | 'professionistico'
  description: string
  founded_year: number
  primary_color: string
  secondary_color: string
  created_by: string
}
```

### Ruoli nei Team
- **Owner** - Creatore della squadra
- **Manager** - Può gestire la squadra
- **Player** - Giocatore

### Tabelle Database
```sql
teams           -- Informazioni squadra
team_members    -- Relazione utente-squadra
```

### Nota Importante
Le squadre possono avere nomi duplicati! Ogni organizzatore gestisce le proprie squadre indipendentemente.

---

## 📅 Gestione Partite

### Struttura Match
```typescript
interface TournamentMatch {
  id: string
  tournament_id: string
  home_team_id: string
  away_team_id: string
  match_date: Date
  venue: string
  match_round: string
  home_team_score: number
  away_team_score: number
  is_completed: boolean
}
```

### Funzionalità
1. **Creazione Manuale** - Form per singola partita
2. **Generazione Automatica** - Calendario round-robin

### Live Match Management
- Aggiornamento punteggio in tempo reale
- Indicatore LIVE per partite in corso
- Completamento partita con aggiornamento classifica

---

## 🎬 Sistema Eventi e Streaming

### Struttura Evento
```typescript
interface Event {
  id: string
  title: string
  description: string
  event_type: 'partita' | 'allenamento' | 'altro'
  home_team_id: string
  away_team_id: string
  venue_name: string
  venue_address: string
  scheduled_at: Date
  duration_minutes: number
  status: 'scheduled' | 'live' | 'completed' | 'cancelled'
  is_public: boolean
  created_by: string
}
```

### Flusso Streaming
1. Utente crea evento (gratuito)
2. Utente avvia streaming → **consuma 1 credito**
3. Sistema genera `stream_key` univoco
4. Video viene salvato su Supabase Storage
5. AI genera highlights automatici (30 sec clips)

### API Live
```
POST /api/live/start  # Avvia streaming (consuma credito)
POST /api/live/end    # Termina streaming
```

### Database
```sql
live_streams       -- Stream attivi
event_highlights   -- Clip highlights
```

---

## 🗄️ Storage Supabase

### Bucket Configurati
| Bucket | Pubblico | Max Size | Tipi MIME |
|--------|----------|----------|-----------|
| `videos` | ❌ | 2GB | video/mp4, video/webm |
| `thumbnails` | ✅ | 5MB | image/jpeg, image/png |
| `highlights` | ❌ | 500MB | video/mp4 |
| `team-logos` | ✅ | 2MB | image/jpeg, image/png, svg |
| `profile-avatars` | ✅ | 2MB | image/jpeg, image/png |

---

## 🔐 Sicurezza

### Row Level Security (RLS)
Tutte le tabelle Supabase hanno policy RLS per garantire:
- Gli utenti vedono solo i propri dati
- Solo owner/collaboratori possono modificare tornei
- Crediti protetti da manipolazione

### Middleware Auth
```typescript
// Protegge automaticamente /dashboard/*
// Verifica sessione Supabase
```

---

## 📊 Database Schema

### Tabelle Principali
```sql
-- Utenti
user_profiles         -- Profili estesi
user_credits          -- Saldo crediti
credit_transactions   -- Storico transazioni
credit_packages       -- Pacchetti acquistabili

-- Tornei
tournaments              -- Tornei
tournament_teams         -- Squadre iscritte
tournament_matches       -- Partite torneo
tournament_collaborators -- Co-organizzatori

-- Squadre
teams           -- Squadre
team_members    -- Membri squadra

-- Eventi
events             -- Eventi/Partite
live_streams       -- Stream live
event_highlights   -- Highlights video
```

---

## 🎨 Componenti UI Principali

### Layout
- `Navbar` - Navigazione principale con logout

### Dashboard
- Card statistiche (crediti, eventi, tornei, team)
- Azioni rapide
- Eventi recenti
- Tornei attivi

### Tornei
- `TournamentForm` - Creazione torneo
- `TournamentEditForm` - Modifica torneo
- `MatchForm` - Aggiunta partita
- `MatchList` - Lista partite
- `MatchGenerator` - Generazione automatica calendario
- `LiveMatchCard` - Card partita live con punteggio
- `CollaboratorsList` - Gestione collaboratori
- `InviteCollaborator` - Invito collaboratori

### Squadre
- `TeamForm` - Creazione squadra
- `TeamList` - Lista squadre

### Eventi
- `EventForm` - Creazione evento
- `EventList` - Lista eventi
- `EventCard` - Card singolo evento

### Pagamenti
- `CreditPackages` - Selezione pacchetti crediti

### Media
- `VideoPlayer` - Player video personalizzato

---

## 🌐 API Endpoints

### Autenticazione
- `POST /auth/confirm` - Conferma email

### Crediti
- `GET /api/user/credits` - Saldo crediti

### Pagamenti
- `POST /api/stripe/checkout` - Checkout Stripe
- `POST /api/stripe/webhook` - Webhook Stripe
- `POST /api/paypal/create-order` - Crea ordine PayPal
- `POST /api/paypal/capture` - Cattura PayPal

### Streaming
- `POST /api/live/start` - Avvia streaming
- `POST /api/live/end` - Termina streaming

### Tornei
- `GET /api/tournaments` - Lista tornei
- `POST /api/tournaments` - Crea torneo
- `GET /api/tournaments/[id]/collaborators` - Collaboratori
- `POST /api/tournaments/[id]/collaborators/invite` - Invita
- `DELETE /api/tournaments/[id]/collaborators/[id]` - Rimuovi

### Partite
- `GET /api/matches` - Lista partite

---

## 📱 Requisiti per App Mobile (Expo)

### Funzionalità da Implementare

#### 1. Autenticazione
- Login/Registrazione
- Gestione sessione
- Reset password

#### 2. Dashboard
- Visualizzazione statistiche
- Crediti disponibili
- Tornei attivi
- Eventi recenti

#### 3. Gestione Tornei
- Lista tornei (owner + collaboratore)
- Dettaglio torneo
- Gestione partite
- Aggiornamento punteggi live
- Classifica

#### 4. Gestione Squadre
- Lista squadre
- Creazione squadra
- Dettaglio squadra

#### 5. Gestione Eventi
- Lista eventi
- Creazione evento
- Dettaglio evento

#### 6. Streaming Live (Priorità Alta)
- Cattura video camera
- Upload streaming
- Gestione crediti
- Salvataggio highlights

#### 7. Acquisto Crediti
- In-App Purchase iOS
- In-App Purchase Android
- Visualizzazione pacchetti

#### 8. Notifiche Push
- Inviti collaborazione
- Partite in avvio
- Aggiornamenti punteggio

### Stack Consigliato per Expo
```javascript
// Core
expo
expo-router          // Navigation
@supabase/supabase-js

// UI
nativewind          // Tailwind per React Native
expo-linear-gradient

// Media
expo-camera         // Cattura video
expo-av             // Playback video
expo-media-library  // Salvataggio locale

// Pagamenti
expo-in-app-purchases // IAP iOS/Android

// Notifiche
expo-notifications

// Storage
expo-file-system
expo-image-picker

// Utilities
expo-secure-store   // Token storage
expo-constants
```

---

## 🔄 Condivisione Logica Web ↔ Mobile

### Cosa Riutilizzare
1. **Tipi TypeScript** - Interfacce dati
2. **Validazioni** - Regole form
3. **Costanti** - Sport, formati, stati
4. **API calls** - Logica Supabase

### Package Condiviso Consigliato
```
packages/
├── shared/
│   ├── types/        # Interfacce TypeScript
│   ├── constants/    # Costanti condivise
│   ├── validators/   # Validazione form
│   └── api/          # Client API Supabase
```

---

## 📋 Variabili Ambiente

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=

# Stripe
STRIPE_SECRET_KEY=
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=
STRIPE_WEBHOOK_SECRET=

# PayPal
PAYPAL_CLIENT_ID=
PAYPAL_SECRET=
NEXT_PUBLIC_PAYPAL_CLIENT_ID=

# App
NEXT_PUBLIC_URL=
```

---

## 🚀 Comandi Utili

```bash
# Sviluppo
npm run dev

# Build
npm run build

# Linting
npm run lint

# Start produzione
npm run start
```

---

## 📝 Note Implementazione

### Prossimi Step per App Expo
1. Setup progetto Expo con expo-router
2. Configurare Supabase client
3. Implementare autenticazione
4. Creare schermate base (Tab navigation)
5. Implementare flusso tornei
6. Aggiungere streaming camera
7. Integrare In-App Purchases
8. Testing su dispositivi reali
9. Deploy su App Store / Play Store

---

## 📄 Licenza
Vedere file LICENSE nella root del progetto.
