# CampoLive 🏟️

Piattaforma di streaming e gestione eventi sportivi amatoriali.

## Stack Tecnologico
- **Frontend:** Next.js 15, React, Tailwind CSS
- **Backend:** Supabase (PostgreSQL, Auth, Storage, Realtime)
- **Deployment:** Vercel
- **Mobile:** iOS/Android (Coming Soon)

## Stato del Progetto
- ✅ Autenticazione
- ✅ Dashboard
- ✅ Sistema Crediti
- 🚧 Eventi e Team
- 📅 Streaming Live
- 📅 App Mobile

## Setup Locale
```bash
# Clona il repository
git clone https://github.com/tuousername/campolive.git

# Installa dipendenze
cd campolive
npm install

# Configura environment variables
cp apps/web/.env.example apps/web/.env.local
# Inserisci le tue chiavi Supabase

# Avvia development
cd apps/web
npm run dev