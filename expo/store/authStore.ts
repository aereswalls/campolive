import { create } from 'zustand'
import { supabase } from '@/lib/supabase'
import type { User, UserCredits } from '@/types'

interface AuthState {
  user: User | null
  credits: UserCredits | null
  isLoading: boolean
  isAuthenticated: boolean
  
  // Actions
  initialize: () => Promise<void>
  signIn: (email: string, password: string) => Promise<{ error?: string }>
  signUp: (email: string, password: string, fullName: string) => Promise<{ error?: string, needsConfirmation?: boolean }>
  signOut: () => Promise<void>
  refreshCredits: () => Promise<void>
}

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  credits: null,
  isLoading: true,
  isAuthenticated: false,

  initialize: async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession()
      
      if (session?.user) {
        const user: User = {
          id: session.user.id,
          email: session.user.email || '',
          full_name: session.user.user_metadata?.full_name,
          created_at: session.user.created_at,
        }
        
        set({ user, isAuthenticated: true })
        await get().refreshCredits()
      }
    } catch (error) {
      console.error('Auth init error:', error)
    } finally {
      set({ isLoading: false })
    }

    // Listen for auth changes
    supabase.auth.onAuthStateChange(async (event, session) => {
      if (event === 'SIGNED_IN' && session?.user) {
        const user: User = {
          id: session.user.id,
          email: session.user.email || '',
          full_name: session.user.user_metadata?.full_name,
          created_at: session.user.created_at,
        }
        set({ user, isAuthenticated: true })
        await get().refreshCredits()
      } else if (event === 'SIGNED_OUT') {
        set({ user: null, credits: null, isAuthenticated: false })
      }
    })
  },

  signIn: async (email, password) => {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password,
      })

      if (error) {
        return { error: error.message }
      }

      if (data.user) {
        const user: User = {
          id: data.user.id,
          email: data.user.email || '',
          full_name: data.user.user_metadata?.full_name,
          created_at: data.user.created_at,
        }
        set({ user, isAuthenticated: true })
        await get().refreshCredits()
      }

      return {}
    } catch (error: any) {
      return { error: error.message || 'Errore di connessione' }
    }
  },

  signUp: async (email, password, fullName) => {
    try {
      const { data, error } = await supabase.auth.signUp({
        email: email.trim(),
        password,
        options: {
          data: { full_name: fullName },
        },
      })

      if (error) {
        return { error: error.message }
      }

      // Check if email confirmation is needed
      if (data.user && !data.session) {
        return { needsConfirmation: true }
      }

      return {}
    } catch (error: any) {
      return { error: error.message || 'Errore di connessione' }
    }
  },

  signOut: async () => {
    await supabase.auth.signOut()
    set({ user: null, credits: null, isAuthenticated: false })
  },

  refreshCredits: async () => {
    const { user } = get()
    if (!user) return

    try {
      const { data, error } = await supabase
        .from('user_credits')
        .select('*')
        .eq('user_id', user.id)
        .single()

      if (!error && data) {
        set({ credits: data })
      }
    } catch (error) {
      console.error('Error fetching credits:', error)
    }
  },
}))
