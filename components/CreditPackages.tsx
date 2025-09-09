'use client'

import { useState } from 'react'
import { loadStripe } from '@stripe/stripe-js'
import { PayPalScriptProvider, PayPalButtons } from '@paypal/react-paypal-js'

const stripePromise = process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY && 
  process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY !== 'pk_test_YOUR_KEY'
  ? loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY)
  : null

const PAYPAL_CONFIGURED = process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID && 
  process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID !== 'YOUR_CLIENT_ID'

interface Package {
  id: string
  name: string
  credits: number
  price_web: number
  discount_percentage: number
  is_popular: boolean
}

interface CreditPackagesProps {
  packages: Package[]
  userId: string
}

export default function CreditPackages({ packages, userId }: CreditPackagesProps) {
  const [loading, setLoading] = useState<string | null>(null)
  const [paymentMethod, setPaymentMethod] = useState<'stripe' | 'paypal'>('stripe')
  
  const handleStripeCheckout = async (packageId: string) => {
    if (!stripePromise) {
      alert('Stripe non è configurato. Configura le API keys nel file .env.local')
      return
    }
    
    setLoading(packageId)
    
    try {
      const response = await fetch('/api/stripe/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ packageId, userId })
      })
      
      const { sessionId } = await response.json()
      const stripe = await stripePromise
      
      if (stripe) {
        const { error } = await stripe.redirectToCheckout({ sessionId })
        if (error) {
          alert('Errore: ' + error.message)
        }
      }
    } catch (error) {
      alert('Errore durante il checkout')
    } finally {
      setLoading(null)
    }
  }
  
  const handlePayPalApprove = async (packageId: string, orderId: string) => {
    try {
      const response = await fetch('/api/paypal/capture', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ orderId, packageId, userId })
      })
      
      if (response.ok) {
        window.location.href = '/credits/success?method=paypal'
      }
    } catch (error) {
      alert('Errore nel processamento PayPal')
    }
  }
  
  // Demo mode per testing
  const handleDemoPayment = async (pkg: Package) => {
    if (confirm(`DEMO MODE: Vuoi simulare l'acquisto di ${pkg.credits} crediti per €${pkg.price_web}?`)) {
      setLoading(pkg.id)
      
      // Simula delay pagamento
      await new Promise(resolve => setTimeout(resolve, 2000))
      
      // In produzione questo sarebbe fatto dal webhook
      alert(`DEMO: Acquisto completato! ${pkg.credits} crediti aggiunti (simulazione)`)
      window.location.href = '/credits/success?demo=true'
    }
  }
  
  return (
    <div>
      {/* Selettore Metodo Pagamento */}
      <div className="flex justify-center mb-6">
        <div className="bg-white rounded-lg shadow p-1 inline-flex">
          <button
            onClick={() => setPaymentMethod('stripe')}
            className={`px-6 py-2 rounded-md transition ${
              paymentMethod === 'stripe' 
                ? 'bg-blue-600 text-white' 
                : 'text-gray-600 hover:bg-gray-100'
            }`}
          >
            💳 Carta di Credito
          </button>
          {PAYPAL_CONFIGURED && (
            <button
              onClick={() => setPaymentMethod('paypal')}
              className={`px-6 py-2 rounded-md transition ${
                paymentMethod === 'paypal' 
                  ? 'bg-yellow-500 text-white' 
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              <span className="font-bold">Pay</span>Pal
            </button>
          )}
        </div>
      </div>
      
      {/* Avviso Demo Mode se non configurato */}
      {!stripePromise && !PAYPAL_CONFIGURED && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
          <h3 className="font-semibold text-yellow-800 mb-1">🧪 Demo Mode</h3>
          <p className="text-sm text-yellow-700">
            I sistemi di pagamento non sono configurati. Usando la modalità demo per testing.
          </p>
          <p className="text-xs text-yellow-600 mt-2">
            Per configurare: aggiungi le API keys di Stripe/PayPal in .env.local
          </p>
        </div>
      )}
      
      {/* Pacchetti */}
      <div className="grid md:grid-cols-4 gap-6">
        {packages.map((pkg) => (
          <div 
            key={pkg.id}
            className={`bg-white rounded-lg shadow-lg overflow-hidden ${
              pkg.is_popular ? 'ring-2 ring-green-500' : ''
            }`}
          >
            {pkg.is_popular && (
              <div className="bg-green-500 text-white text-center py-1 text-sm font-medium">
                PIÙ POPOLARE
              </div>
            )}
            
            <div className="p-6">
              <h3 className="text-xl font-bold mb-2">{pkg.name}</h3>
              <div className="mb-4">
                <span className="text-3xl font-bold">€{pkg.price_web}</span>
                <span className="text-gray-600 ml-2">/ {pkg.credits} crediti</span>
              </div>
              
              <div className="text-sm text-gray-600 mb-4">
                <p>€{(pkg.price_web / pkg.credits).toFixed(2)} per diretta</p>
                {pkg.discount_percentage > 0 && (
                  <p className="text-green-600 font-medium">
                    Risparmi il {pkg.discount_percentage}%
                  </p>
                )}
              </div>
              
              <ul className="text-sm space-y-2 mb-6">
                <li className="flex items-center">
                  <span className="text-green-500 mr-2">✓</span>
                  {pkg.credits} dirette complete
                </li>
                <li className="flex items-center">
                  <span className="text-green-500 mr-2">✓</span>
                  Highlights inclusi
                </li>
                <li className="flex items-center">
                  <span className="text-green-500 mr-2">✓</span>
                  Nessuna scadenza
                </li>
              </ul>
              
              {/* Bottone pagamento basato su configurazione */}
              {!stripePromise && !PAYPAL_CONFIGURED ? (
                // Demo mode
                <button
                  onClick={() => handleDemoPayment(pkg)}
                  disabled={loading === pkg.id}
                  className="w-full bg-orange-600 text-white py-3 rounded-lg hover:bg-orange-700 disabled:opacity-50"
                >
                  {loading === pkg.id ? 'Elaborazione...' : '🧪 Demo Acquisto'}
                </button>
              ) : paymentMethod === 'stripe' && stripePromise ? (
                // Stripe
                <button
                  onClick={() => handleStripeCheckout(pkg.id)}
                  disabled={loading === pkg.id}
                  className="w-full bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 disabled:opacity-50"
                >
                  {loading === pkg.id ? 'Caricamento...' : 'Acquista con Carta'}
                </button>
              ) : paymentMethod === 'paypal' && PAYPAL_CONFIGURED ? (
                // PayPal
                <PayPalScriptProvider 
                  options={{ 
                    clientId: process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID!,
                    currency: "EUR"
                  }}
                >
                  <PayPalButtons
                    style={{ layout: 'vertical' }}
                    createOrder={async () => {
                      const response = await fetch('/api/paypal/create-order', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ packageId: pkg.id, userId })
                      })
                      const { orderId } = await response.json()
                      return orderId
                    }}
                    onApprove={async (data) => {
                      await handlePayPalApprove(pkg.id, data.orderID)
                    }}
                  />
                </PayPalScriptProvider>
              ) : (
                // Fallback
                <button
                  disabled
                  className="w-full bg-gray-400 text-white py-3 rounded-lg cursor-not-allowed"
                >
                  Configura Pagamenti
                </button>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
