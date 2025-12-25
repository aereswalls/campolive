# CampoLive - App Expo

App mobile per la gestione di tornei sportivi amatoriali con funzionalità di registrazione video e highlights.

## 🚀 Funzionalità

### Autenticazione
- Login/Registrazione con Supabase
- Persistenza sessione con SecureStore

### Gestione Tornei
- Creazione e modifica tornei
- Supporto per diversi sport (calcio, basket, volley, ecc.)
- Formati: Girone, Eliminazione diretta, Girone + Playoff
- Gestione partite e punteggi in tempo reale
- Classifica automatica

### Gestione Squadre
- Creazione squadre con logo
- Gestione rosa giocatori
- Livelli: Giovanile, Amatoriale, Semi-Pro

### Gestione Eventi
- Creazione eventi sportivi
- Tipi: Partita, Torneo, Allenamento
- Stati: Bozza, Programmato, Live, Completato

### 📹 Registrazione Video e Highlights
- **Registrazione video** in tempo reale durante gli eventi
- **Salva Highlight**: Salva automaticamente gli ultimi 30 secondi con un tap
- **Scarta**: Elimina la registrazione corrente (gli highlights salvati rimangono)
- Salvataggio nella galleria del dispositivo
- Album dedicato "CampoLive Highlights"

### Crediti
- Sistema di crediti per funzionalità premium
- Acquisto con Stripe/PayPal (integrazione ready)

## 📦 Installazione

```bash
# Clona il repository
cd expo

# Installa le dipendenze
npm install

# Avvia l'app
npx expo start
```

## 🔧 Configurazione

### Supabase
Crea un file `.env` nella cartella `expo`:

```env
EXPO_PUBLIC_SUPABASE_URL=your_supabase_url
EXPO_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
```

### Permessi
L'app richiede i seguenti permessi:
- **Camera**: Per la registrazione video
- **Microfono**: Per l'audio durante la registrazione
- **Media Library**: Per salvare gli highlights

## 🏗️ Struttura del Progetto

```
expo/
├── app/                    # Routes (Expo Router)
│   ├── (auth)/            # Schermate autenticazione
│   ├── (tabs)/            # Tab navigation principale
│   ├── tournament/        # Dettaglio torneo
│   ├── team/              # Dettaglio squadra
│   ├── event/             # Dettaglio evento
│   └── recording.tsx      # Schermata registrazione
├── components/
│   ├── ui/                # Componenti UI riutilizzabili
│   ├── tournaments/       # Componenti tornei
│   ├── teams/             # Componenti squadre
│   ├── events/            # Componenti eventi
│   └── recording/         # Camera e highlights
├── hooks/                 # Custom hooks
├── store/                 # Zustand stores
├── lib/                   # Librerie (Supabase)
├── types/                 # TypeScript types
└── constants/             # Costanti app
```

## 🎯 Come Usare la Registrazione

1. **Avvia la registrazione** toccando il pulsante rosso
2. **Salva un highlight** toccando ⚡ (dopo almeno 30 secondi di registrazione)
   - Salva automaticamente gli ultimi 30 secondi
   - Feedback con vibrazione
3. **Scarta la registrazione** se non serve (gli highlights salvati rimangono)
4. **Termina** quando hai finito - vedrai il conteggio degli highlights salvati

## 🛠️ Tecnologie

- **Expo** ~54.0.0
- **React Native**
- **Expo Router** per la navigazione
- **NativeWind** (Tailwind CSS)
- **Zustand** per lo state management
- **Supabase** per backend
- **expo-camera** per video
- **expo-media-library** per galleria

## 📱 Build

```bash
# Build per iOS
eas build --platform ios

# Build per Android
eas build --platform android

# Build locale per development
npx expo run:android
npx expo run:ios
```

## 📄 Licenza

MIT
