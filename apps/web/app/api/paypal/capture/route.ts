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
    const { orderId, packageId, userId } = await req.json()
    
    const accessToken = await getAccessToken()
    
    // Cattura pagamento
    const response = await fetch(`${PAYPAL_API_URL}/v2/checkout/orders/${orderId}/capture`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json'
      }
    })
    
    const captureData = await response.json()
    
    if (captureData.status === 'COMPLETED') {
      const supabase = createClient()
      
      // Recupera pacchetto
      const { data: pkg } = await supabase
        .from('credit_packages')
        .select('*')
        .eq('id', packageId)
        .single()
      
      // Aggiungi crediti
      await supabase.rpc('add_credits', {
        p_user_id: userId,
        p_amount: pkg.credits,
        p_type: 'purchase_web',
        p_reference: orderId,
        p_description: `Acquisto ${pkg.credits} crediti via PayPal`
      })
      
      return NextResponse.json({ success: true })
    }
    
    return NextResponse.json({ error: 'Pagamento non completato' }, { status: 400 })
  } catch (error) {
    console.error('PayPal capture error:', error)
    return NextResponse.json({ error: 'Errore server' }, { status: 500 })
  }
}
