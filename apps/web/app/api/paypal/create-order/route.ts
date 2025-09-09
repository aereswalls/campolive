import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/utils/supabase/server'

const PAYPAL_API_URL = process.env.NODE_ENV === 'production' 
  ? 'https://api-m.paypal.com' 
  : 'https://api-m.sandbox.paypal.com'

async function getAccessToken() {
  const auth = Buffer.from(
    `${process.env.PAYPAL_CLIENT_ID}:${process.env.PAYPAL_SECRET}`
  ).toString('base64')
  
  const response = await fetch(`${PAYPAL_API_URL}/v1/oauth2/token`, {
    method: 'POST',
    headers: {
      'Authorization': `Basic ${auth}`,
      'Content-Type': 'application/x-www-form-urlencoded'
    },
    body: 'grant_type=client_credentials'
  })
  
  const data = await response.json()
  return data.access_token
}

export async function POST(req: NextRequest) {
  try {
    const { packageId, userId } = await req.json()
    
    const supabase = createClient()
    
    // Recupera pacchetto
    const { data: pkg } = await supabase
      .from('credit_packages')
      .select('*')
      .eq('id', packageId)
      .single()
    
    if (!pkg) {
      return NextResponse.json({ error: 'Pacchetto non trovato' }, { status: 404 })
    }
    
    const accessToken = await getAccessToken()
    
    const order = {
      intent: 'CAPTURE',
      purchase_units: [{
        amount: {
          currency_code: 'EUR',
          value: pkg.price_web.toFixed(2)
        },
        description: `CampoLive - ${pkg.credits} crediti`
      }],
      application_context: {
        return_url: `${process.env.NEXT_PUBLIC_URL}/credits/success`,
        cancel_url: `${process.env.NEXT_PUBLIC_URL}/credits`
      }
    }
    
    const response = await fetch(`${PAYPAL_API_URL}/v2/checkout/orders`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(order)
    })
    
    const orderData = await response.json()
    
    return NextResponse.json({ orderId: orderData.id })
  } catch (error) {
    console.error('PayPal error:', error)
    return NextResponse.json({ error: 'Errore server' }, { status: 500 })
  }
}
