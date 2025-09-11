'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { createClient } from '@/utils/supabase/client'
import { AlertCircle, Mail } from 'lucide-react'

export default function RegisterPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [fullName, setFullName] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
  const [loading, setLoading] = useState(false)
  const router = useRouter()
  const supabase = createClient()

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    if (password !== confirmPassword) {
      setError('Le password non coincidono')
      return
    }

    if (password.length < 6) {
      setError('La password deve essere di almeno 6 caratteri')
      return
    }

    setLoading(true)

    const { data, error: signUpError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: fullName,
        },
        emailRedirectTo: `${window.location.origin}/auth/confirm`
      }
    })

    if (signUpError) {
      setError(signUpError.message)
      setLoading(false)
    } else {
      setSuccess(true)
      setLoading(false)
    }
  }

  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="max-w-md w-full space-y-8 p-8 bg-white rounded-lg shadow text-center">
          <div className="text-5xl mb-4">📧</div>
          <h2 className="text-2xl font-bold text-green-600">
            Controlla la tua email!
          </h2>
          <div className="bg-green-50 border border-green-200 rounded-lg p-4 text-left">
            <div className="flex items-start space-x-2">
              <Mail className="w-5 h-5 text-green-600 mt-0.5" />
              <div className="text-sm text-green-800">
                <p className="font-medium mb-1">Email di conferma inviata</p>
                <p>Abbiamo inviato un link di conferma a <strong>{email}</strong></p>
                <p className="mt-2">Clicca sul link nell'email per attivare il tuo account.</p>
              </div>
            </div>
          </div>
          <div className="text-sm text-gray-600">
            <p>Non hai ricevuto l'email?</p>
            <button 
              onClick={() => setSuccess(false)}
              className="text-green-600 hover:text-green-700 font-medium"
            >
              Riprova la registrazione
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-md w-full space-y-8 p-8 bg-white rounded-lg shadow">
        <div>
          <Link href="/" className="text-2xl font-bold text-green-600">
            🏟️ CampoLive
          </Link>
          <h2 className="mt-6 text-3xl font-bold text-gray-900">
            Crea il tuo account
          </h2>
          <p className="mt-2 text-sm text-gray-600">
            Inizia con 10 crediti gratuiti!
          </p>
        </div>
        
        <form className="mt-8 space-y-6" onSubmit={handleRegister}>
          {error && (
            <div className="bg-red-50 text-red-500 p-3 rounded flex items-start space-x-2">
              <AlertCircle className="w-5 h-5 mt-0.5" />
              <span>{error}</span>
            </div>
          )}
          
          <div className="space-y-4">
            <div>
              <label htmlFor="fullName" className="block text-sm font-medium text-gray-700">
                Nome completo
              </label>
              <input
                id="fullName"
                type="text"
                required
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 focus:ring-green-500 focus:border-green-500"
              />
            </div>

            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                Email
              </label>
              <input
                id="email"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 focus:ring-green-500 focus:border-green-500"
              />
            </div>
            
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                Password
              </label>
              <input
                id="password"
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 focus:ring-green-500 focus:border-green-500"
                placeholder="Minimo 6 caratteri"
              />
            </div>

            <div>
              <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700">
                Conferma Password
              </label>
              <input
                id="confirmPassword"
                type="password"
                required
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 focus:ring-green-500 focus:border-green-500"
              />
            </div>
          </div>

          <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
            <div className="flex items-start space-x-2">
              <AlertCircle className="w-5 h-5 text-blue-600 mt-0.5" />
              <div className="text-sm text-blue-800">
                <p className="font-medium">Conferma richiesta</p>
                <p>Dopo la registrazione riceverai un'email di conferma</p>
              </div>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-green-600 text-white py-2 px-4 rounded-md hover:bg-green-700 disabled:opacity-50"
          >
            {loading ? 'Creazione account...' : 'Registrati'}
          </button>

          <div className="text-center">
            <span className="text-sm text-gray-600">
              Hai già un account?{' '}
              <Link href="/login" className="text-green-600 hover:text-green-700">
                Accedi
              </Link>
            </span>
          </div>
        </form>
      </div>
    </div>
  )
}
