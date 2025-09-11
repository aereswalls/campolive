'use client'

import { Suspense } from 'react'
import { useEffect, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'

function ConfirmEmailContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading')
  
  useEffect(() => {
    const code = searchParams.get('code')
    if (code) {
      setStatus('success')
      setTimeout(() => {
        router.push('/dashboard')
      }, 3000)
    } else {
      setStatus('error')
    }
  }, [searchParams, router])
  
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-md w-full space-y-8 p-8 bg-white rounded-lg shadow text-center">
        {status === 'loading' && (
          <>
            <div className="text-4xl">⏳</div>
            <h2 className="text-2xl font-bold">Conferma in corso...</h2>
          </>
        )}
        
        {status === 'success' && (
          <>
            <div className="text-4xl">✅</div>
            <h2 className="text-2xl font-bold text-green-600">Email confermata!</h2>
            <p className="text-gray-600">
              Il tuo account è stato verificato con successo. 
              Verrai reindirizzato alla dashboard...
            </p>
            <Link 
              href="/dashboard" 
              className="inline-block bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700"
            >
              Vai alla Dashboard
            </Link>
          </>
        )}
        
        {status === 'error' && (
          <>
            <div className="text-4xl">❌</div>
            <h2 className="text-2xl font-bold text-red-600">Errore nella conferma</h2>
            <p className="text-gray-600">
              Il link potrebbe essere scaduto o non valido.
            </p>
            <Link 
              href="/login" 
              className="inline-block bg-gray-600 text-white px-6 py-2 rounded-lg hover:bg-gray-700"
            >
              Vai al Login
            </Link>
          </>
        )}
      </div>
    </div>
  )
}

export default function ConfirmEmailPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="text-4xl mb-4">⏳</div>
          <p className="text-gray-600">Caricamento...</p>
        </div>
      </div>
    }>
      <ConfirmEmailContent />
    </Suspense>
  )
}
