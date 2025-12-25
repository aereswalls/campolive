# 📱 CampoLive Expo App - Guida all'Implementazione

## 🎯 Struttura Progetto Expo Consigliata

```
campolive-mobile/
├── app/                          # Expo Router (file-based routing)
│   ├── (auth)/                   # Route gruppo autenticazione
│   │   ├── login.tsx
│   │   ├── register.tsx
│   │   └── forgot-password.tsx
│   ├── (tabs)/                   # Tab navigation principale
│   │   ├── _layout.tsx
│   │   ├── index.tsx             # Dashboard
│   │   ├── tournaments.tsx
│   │   ├── teams.tsx
│   │   ├── events.tsx
│   │   └── profile.tsx
│   ├── tournament/
│   │   ├── [id]/
│   │   │   ├── index.tsx         # Dettaglio torneo
│   │   │   ├── matches.tsx
│   │   │   ├── standings.tsx
│   │   │   ├── live.tsx
│   │   │   └── teams.tsx
│   │   └── new.tsx
│   ├── team/
│   │   ├── [id]/
│   │   │   └── index.tsx
│   │   └── new.tsx
│   ├── event/
│   │   ├── [id]/
│   │   │   ├── index.tsx
│   │   │   └── stream.tsx        # Streaming live
│   │   └── new.tsx
│   ├── credits/
│   │   └── index.tsx             # Acquisto crediti
│   ├── _layout.tsx               # Root layout
│   └── +not-found.tsx
├── components/
│   ├── ui/                       # Componenti UI base
│   │   ├── Button.tsx
│   │   ├── Card.tsx
│   │   ├── Input.tsx
│   │   ├── Select.tsx
│   │   └── Badge.tsx
│   ├── tournaments/
│   │   ├── TournamentCard.tsx
│   │   ├── MatchCard.tsx
│   │   ├── LiveMatchCard.tsx
│   │   └── StandingsTable.tsx
│   ├── teams/
│   │   ├── TeamCard.tsx
│   │   └── TeamForm.tsx
│   ├── events/
│   │   ├── EventCard.tsx
│   │   └── EventForm.tsx
│   └── streaming/
│       ├── CameraView.tsx
│       ├── StreamControls.tsx
│       └── ScoreOverlay.tsx
├── hooks/
│   ├── useAuth.ts
│   ├── useCredits.ts
│   ├── useTournaments.ts
│   ├── useTeams.ts
│   └── useStreaming.ts
├── lib/
│   ├── supabase.ts               # Client Supabase
│   ├── storage.ts                # Secure storage
│   └── notifications.ts
├── types/
│   └── index.ts                  # TypeScript types
├── constants/
│   ├── sports.ts
│   ├── formats.ts
│   └── colors.ts
├── store/                        # State management (Zustand)
│   ├── authStore.ts
│   └── tournamentStore.ts
├── assets/
│   ├── images/
│   └── fonts/
├── app.json
├── package.json
├── tsconfig.json
└── tailwind.config.js            # NativeWind config
```

---

## 📦 Dipendenze da Installare

```json
{
  "dependencies": {
    "expo": "~51.0.0",
    "expo-router": "~3.5.0",
    "react": "18.2.0",
    "react-native": "0.74.0",
    
    "@supabase/supabase-js": "^2.57.0",
    
    "nativewind": "^4.0.0",
    "tailwindcss": "^3.4.0",
    
    "expo-camera": "~15.0.0",
    "expo-av": "~14.0.0",
    "expo-media-library": "~16.0.0",
    "expo-file-system": "~17.0.0",
    "expo-image-picker": "~15.0.0",
    
    "expo-secure-store": "~13.0.0",
    "expo-constants": "~16.0.0",
    "expo-notifications": "~0.28.0",
    
    "@react-native-async-storage/async-storage": "^1.23.0",
    
    "expo-in-app-purchases": "~15.0.0",
    
    "zustand": "^4.5.0",
    
    "lucide-react-native": "^0.400.0",
    "react-native-svg": "^15.0.0",
    
    "@react-navigation/native": "^6.0.0",
    "react-native-safe-area-context": "^4.10.0",
    "react-native-screens": "^3.30.0",
    "react-native-gesture-handler": "^2.16.0",
    "react-native-reanimated": "~3.10.0"
  }
}
```

---

## 🔐 Setup Supabase Client

```typescript
// lib/supabase.ts
import 'react-native-url-polyfill/auto'
import { createClient } from '@supabase/supabase-js'
import * as SecureStore from 'expo-secure-store'

const ExpoSecureStoreAdapter = {
  getItem: (key: string) => SecureStore.getItemAsync(key),
  setItem: (key: string, value: string) => SecureStore.setItemAsync(key, value),
  removeItem: (key: string) => SecureStore.deleteItemAsync(key),
}

export const supabase = createClient(
  process.env.EXPO_PUBLIC_SUPABASE_URL!,
  process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY!,
  {
    auth: {
      storage: ExpoSecureStoreAdapter,
      autoRefreshToken: true,
      persistSession: true,
      detectSessionInUrl: false,
    },
  }
)
```

---

## 🔑 Hook Autenticazione

```typescript
// hooks/useAuth.ts
import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { Session, User } from '@supabase/supabase-js'

export function useAuth() {
  const [user, setUser] = useState<User | null>(null)
  const [session, setSession] = useState<Session | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session)
      setUser(session?.user ?? null)
      setLoading(false)
    })

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        setSession(session)
        setUser(session?.user ?? null)
      }
    )

    return () => subscription.unsubscribe()
  }, [])

  const signIn = async (email: string, password: string) => {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })
    if (error) throw error
    return data
  }

  const signUp = async (email: string, password: string, fullName: string) => {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { full_name: fullName }
      }
    })
    if (error) throw error
    return data
  }

  const signOut = async () => {
    const { error } = await supabase.auth.signOut()
    if (error) throw error
  }

  return {
    user,
    session,
    loading,
    signIn,
    signUp,
    signOut,
    isAuthenticated: !!user,
  }
}
```

---

## 💰 Hook Crediti

```typescript
// hooks/useCredits.ts
import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { useAuth } from './useAuth'

interface UserCredits {
  balance: number
  total_earned: number
  total_purchased: number
  total_consumed: number
}

export function useCredits() {
  const { user } = useAuth()
  const [credits, setCredits] = useState<UserCredits | null>(null)
  const [loading, setLoading] = useState(true)

  const fetchCredits = async () => {
    if (!user) return

    const { data, error } = await supabase
      .from('user_credits')
      .select('*')
      .eq('user_id', user.id)
      .single()

    if (!error) {
      setCredits(data)
    }
    setLoading(false)
  }

  useEffect(() => {
    fetchCredits()

    // Subscribe to realtime updates
    const channel = supabase
      .channel('credits-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'user_credits',
          filter: `user_id=eq.${user?.id}`
        },
        () => fetchCredits()
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [user])

  return {
    credits,
    balance: credits?.balance ?? 0,
    loading,
    refresh: fetchCredits,
  }
}
```

---

## 🏆 Hook Tornei

```typescript
// hooks/useTournaments.ts
import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { useAuth } from './useAuth'
import { Tournament } from '@/types'

export function useTournaments() {
  const { user } = useAuth()
  const [tournaments, setTournaments] = useState<Tournament[]>([])
  const [loading, setLoading] = useState(true)

  const fetchTournaments = async () => {
    if (!user) return

    // Own tournaments
    const { data: ownTournaments } = await supabase
      .from('tournaments')
      .select('*')
      .eq('created_by', user.id)

    // Collaborated tournaments
    const { data: collaborations } = await supabase
      .from('tournament_collaborators')
      .select('tournament_id')
      .eq('user_id', user.id)
      .eq('status', 'accepted')

    let collaboratedTournaments: Tournament[] = []
    if (collaborations?.length) {
      const ids = collaborations.map(c => c.tournament_id)
      const { data } = await supabase
        .from('tournaments')
        .select('*')
        .in('id', ids)
      collaboratedTournaments = data || []
    }

    // Merge and deduplicate
    const tournamentMap = new Map()
    ownTournaments?.forEach(t => 
      tournamentMap.set(t.id, { ...t, isOwner: true })
    )
    collaboratedTournaments.forEach(t => {
      if (!tournamentMap.has(t.id)) {
        tournamentMap.set(t.id, { ...t, isCollaborator: true })
      }
    })

    setTournaments(Array.from(tournamentMap.values()))
    setLoading(false)
  }

  useEffect(() => {
    fetchTournaments()
  }, [user])

  return {
    tournaments,
    loading,
    refresh: fetchTournaments,
  }
}
```

---

## 📹 Componente Streaming Camera

```typescript
// components/streaming/CameraView.tsx
import { useState, useRef } from 'react'
import { View, TouchableOpacity, Text, StyleSheet } from 'react-native'
import { CameraView, useCameraPermissions } from 'expo-camera'
import { Video } from 'expo-av'
import * as FileSystem from 'expo-file-system'
import { supabase } from '@/lib/supabase'

interface CameraStreamProps {
  eventId: string
  onStreamEnd: () => void
}

export function CameraStream({ eventId, onStreamEnd }: CameraStreamProps) {
  const [permission, requestPermission] = useCameraPermissions()
  const [isRecording, setIsRecording] = useState(false)
  const cameraRef = useRef<CameraView>(null)

  if (!permission) {
    return <View />
  }

  if (!permission.granted) {
    return (
      <View style={styles.container}>
        <Text>Permesso camera richiesto</Text>
        <TouchableOpacity onPress={requestPermission}>
          <Text>Concedi permesso</Text>
        </TouchableOpacity>
      </View>
    )
  }

  const startRecording = async () => {
    if (!cameraRef.current) return

    setIsRecording(true)
    
    try {
      const video = await cameraRef.current.recordAsync({
        maxDuration: 7200, // 2 ore max
      })

      if (video) {
        await uploadVideo(video.uri)
      }
    } catch (error) {
      console.error('Recording error:', error)
    }
  }

  const stopRecording = async () => {
    if (!cameraRef.current) return
    
    cameraRef.current.stopRecording()
    setIsRecording(false)
    onStreamEnd()
  }

  const uploadVideo = async (uri: string) => {
    const filename = `${eventId}/${Date.now()}.mp4`
    
    const file = await FileSystem.readAsStringAsync(uri, {
      encoding: FileSystem.EncodingType.Base64,
    })

    const { data, error } = await supabase.storage
      .from('videos')
      .upload(filename, decode(file), {
        contentType: 'video/mp4',
      })

    if (error) {
      console.error('Upload error:', error)
    }

    return data
  }

  return (
    <View style={styles.container}>
      <CameraView
        ref={cameraRef}
        style={styles.camera}
        mode="video"
      >
        <View style={styles.controls}>
          <TouchableOpacity
            style={[
              styles.recordButton,
              isRecording && styles.recordButtonActive
            ]}
            onPress={isRecording ? stopRecording : startRecording}
          >
            <Text style={styles.recordText}>
              {isRecording ? 'STOP' : 'REC'}
            </Text>
          </TouchableOpacity>
        </View>
      </CameraView>
    </View>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  camera: { flex: 1 },
  controls: {
    position: 'absolute',
    bottom: 40,
    width: '100%',
    alignItems: 'center',
  },
  recordButton: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#EF4444',
    justifyContent: 'center',
    alignItems: 'center',
  },
  recordButtonActive: {
    backgroundColor: '#DC2626',
  },
  recordText: {
    color: 'white',
    fontWeight: 'bold',
  },
})
```

---

## 💳 In-App Purchases

```typescript
// lib/purchases.ts
import * as InAppPurchases from 'expo-in-app-purchases'
import { supabase } from './supabase'

const PRODUCTS = {
  credits_10: 'com.campolive.credits.10',
  credits_25: 'com.campolive.credits.25',
  credits_50: 'com.campolive.credits.50',
  credits_100: 'com.campolive.credits.100',
}

export async function initializePurchases() {
  await InAppPurchases.connectAsync()
}

export async function getProducts() {
  const { responseCode, results } = await InAppPurchases.getProductsAsync(
    Object.values(PRODUCTS)
  )
  
  if (responseCode === InAppPurchases.IAPResponseCode.OK) {
    return results
  }
  return []
}

export async function purchaseCredits(productId: string) {
  const { responseCode, results } = await InAppPurchases.purchaseItemAsync(
    productId
  )
  
  if (responseCode === InAppPurchases.IAPResponseCode.OK) {
    // Verifica acquisto sul backend
    const purchase = results?.[0]
    if (purchase) {
      await verifyPurchase(purchase)
    }
  }
  
  return responseCode === InAppPurchases.IAPResponseCode.OK
}

async function verifyPurchase(purchase: InAppPurchases.InAppPurchase) {
  // Invia receipt al backend per verifica
  const { data, error } = await supabase.functions.invoke('verify-purchase', {
    body: {
      receipt: purchase.transactionReceipt,
      productId: purchase.productId,
    }
  })
  
  if (!error && data.verified) {
    // Crediti aggiunti dal backend
    await InAppPurchases.finishTransactionAsync(purchase, true)
  }
}
```

---

## 📱 Schermata Dashboard

```typescript
// app/(tabs)/index.tsx
import { View, Text, ScrollView, TouchableOpacity, RefreshControl } from 'react-native'
import { useRouter } from 'expo-router'
import { useAuth } from '@/hooks/useAuth'
import { useCredits } from '@/hooks/useCredits'
import { useTournaments } from '@/hooks/useTournaments'
import { Card } from '@/components/ui/Card'
import { 
  CreditCard, 
  Trophy, 
  Users, 
  Calendar, 
  Plus 
} from 'lucide-react-native'

export default function Dashboard() {
  const router = useRouter()
  const { user } = useAuth()
  const { balance, loading: creditsLoading, refresh: refreshCredits } = useCredits()
  const { tournaments, loading: tournamentsLoading, refresh: refreshTournaments } = useTournaments()

  const onRefresh = async () => {
    await Promise.all([refreshCredits(), refreshTournaments()])
  }

  const activeTournaments = tournaments.filter(t => 
    ['registration_open', 'in_progress'].includes(t.status)
  )

  return (
    <ScrollView 
      className="flex-1 bg-gray-50"
      refreshControl={
        <RefreshControl refreshing={false} onRefresh={onRefresh} />
      }
    >
      <View className="p-4">
        <Text className="text-2xl font-bold text-gray-900 mb-6">
          Benvenuto su CampoLive! 👋
        </Text>

        {/* Stats Cards */}
        <View className="flex-row flex-wrap gap-4 mb-6">
          <TouchableOpacity 
            className="flex-1 min-w-[45%]"
            onPress={() => router.push('/credits')}
          >
            <Card className="p-4">
              <View className="flex-row justify-between items-center mb-2">
                <View className="bg-green-100 p-2 rounded-lg">
                  <CreditCard size={24} color="#16A34A" />
                </View>
                <Text className="text-3xl font-bold">{balance}</Text>
              </View>
              <Text className="text-gray-600 text-sm">Crediti</Text>
            </Card>
          </TouchableOpacity>

          <TouchableOpacity 
            className="flex-1 min-w-[45%]"
            onPress={() => router.push('/tournaments')}
          >
            <Card className="p-4">
              <View className="flex-row justify-between items-center mb-2">
                <View className="bg-yellow-100 p-2 rounded-lg">
                  <Trophy size={24} color="#CA8A04" />
                </View>
                <Text className="text-3xl font-bold">{tournaments.length}</Text>
              </View>
              <Text className="text-gray-600 text-sm">Tornei</Text>
            </Card>
          </TouchableOpacity>
        </View>

        {/* Quick Actions */}
        <Text className="text-lg font-semibold mb-3">Azioni rapide</Text>
        <View className="flex-row gap-3 mb-6">
          <TouchableOpacity 
            className="flex-1 bg-green-600 p-4 rounded-lg items-center"
            onPress={() => router.push('/tournament/new')}
          >
            <Plus size={24} color="white" />
            <Text className="text-white font-medium mt-1">Nuovo Torneo</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            className="flex-1 bg-blue-600 p-4 rounded-lg items-center"
            onPress={() => router.push('/team/new')}
          >
            <Users size={24} color="white" />
            <Text className="text-white font-medium mt-1">Nuovo Team</Text>
          </TouchableOpacity>
        </View>

        {/* Active Tournaments */}
        {activeTournaments.length > 0 && (
          <>
            <Text className="text-lg font-semibold mb-3">Tornei Attivi</Text>
            {activeTournaments.slice(0, 3).map(tournament => (
              <TouchableOpacity
                key={tournament.id}
                onPress={() => router.push(`/tournament/${tournament.id}`)}
              >
                <Card className="p-4 mb-3">
                  <View className="flex-row justify-between items-start">
                    <View className="flex-1">
                      <Text className="font-semibold text-lg">{tournament.name}</Text>
                      <Text className="text-gray-600 text-sm">{tournament.city}</Text>
                    </View>
                    <View className={`px-2 py-1 rounded ${
                      tournament.status === 'in_progress' 
                        ? 'bg-green-100' 
                        : 'bg-blue-100'
                    }`}>
                      <Text className={`text-xs ${
                        tournament.status === 'in_progress'
                          ? 'text-green-700'
                          : 'text-blue-700'
                      }`}>
                        {tournament.status === 'in_progress' ? 'In Corso' : 'Iscrizioni'}
                      </Text>
                    </View>
                  </View>
                </Card>
              </TouchableOpacity>
            ))}
          </>
        )}
      </View>
    </ScrollView>
  )
}
```

---

## 🔔 Notifiche Push

```typescript
// lib/notifications.ts
import * as Notifications from 'expo-notifications'
import * as Device from 'expo-device'
import { supabase } from './supabase'

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
  }),
})

export async function registerForPushNotifications(userId: string) {
  if (!Device.isDevice) {
    console.log('Push notifications only work on physical devices')
    return null
  }

  const { status: existingStatus } = await Notifications.getPermissionsAsync()
  let finalStatus = existingStatus

  if (existingStatus !== 'granted') {
    const { status } = await Notifications.requestPermissionsAsync()
    finalStatus = status
  }

  if (finalStatus !== 'granted') {
    return null
  }

  const token = (await Notifications.getExpoPushTokenAsync()).data

  // Salva token nel database
  await supabase
    .from('user_push_tokens')
    .upsert({
      user_id: userId,
      token: token,
      platform: Device.osName,
    })

  return token
}

export async function scheduleMatchNotification(match: {
  id: string
  homeTeam: string
  awayTeam: string
  matchDate: Date
}) {
  await Notifications.scheduleNotificationAsync({
    content: {
      title: '⚽ Partita in avvio!',
      body: `${match.homeTeam} vs ${match.awayTeam} sta per iniziare`,
      data: { matchId: match.id },
    },
    trigger: {
      date: new Date(match.matchDate.getTime() - 15 * 60 * 1000), // 15 min prima
    },
  })
}
```

---

## 🎨 Configurazione NativeWind

```javascript
// tailwind.config.js
module.exports = {
  content: [
    './app/**/*.{js,jsx,ts,tsx}',
    './components/**/*.{js,jsx,ts,tsx}',
  ],
  presets: [require('nativewind/preset')],
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#f0fdf4',
          100: '#dcfce7',
          500: '#22c55e',
          600: '#16a34a',
          700: '#15803d',
        },
      },
    },
  },
  plugins: [],
}
```

---

## 📋 Comandi per Iniziare

```bash
# Crea nuovo progetto Expo
npx create-expo-app campolive-mobile -t expo-template-blank-typescript

# Naviga nella cartella
cd campolive-mobile

# Installa dipendenze
npx expo install expo-router @supabase/supabase-js
npx expo install nativewind tailwindcss
npx expo install expo-camera expo-av expo-media-library expo-file-system
npx expo install expo-secure-store expo-notifications
npx expo install lucide-react-native react-native-svg
npx expo install react-native-gesture-handler react-native-reanimated
npx expo install react-native-safe-area-context react-native-screens

# Configura NativeWind
npx tailwindcss init

# Avvia sviluppo
npx expo start
```

---

## ✅ Checklist Implementazione

- [ ] Setup progetto Expo con TypeScript
- [ ] Configurare expo-router
- [ ] Setup NativeWind (Tailwind)
- [ ] Configurare Supabase client
- [ ] Implementare autenticazione
- [ ] Creare Tab Navigation
- [ ] Dashboard con statistiche
- [ ] Lista tornei
- [ ] Dettaglio torneo
- [ ] Gestione partite live
- [ ] Classifica torneo
- [ ] Gestione squadre
- [ ] Gestione eventi
- [ ] Streaming camera
- [ ] In-App Purchases
- [ ] Push notifications
- [ ] Testing iOS
- [ ] Testing Android
- [ ] Build produzione
- [ ] Submit App Store
- [ ] Submit Play Store
