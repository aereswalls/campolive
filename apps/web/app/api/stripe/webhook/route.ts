import { NextRequest, NextResponse } from 'next/server'
import Stripe from 'stripe'
import { createClient } from '@/utils/supabase/server'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2024-11-20.acacia'
})

export async function POST(req: NextRequest) {
  const body = await req.text()
  const signature = req.headers.get('stripe-signature')!
  
  let event: Stripe.Event
  
  try {
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET!
    )
  } catch (err) {
    return NextResponse.json({ error: 'Invalid signature' }, { status: 400 })
  }
  
  if (event.type === 'checkout.session.completed') {
    const session = event.data.object as Stripe.Checkout.Session
    
    const supabase = createClient()
    
    // Aggiungi crediti
    const { error } = await supabase.rpc('add_credits', {
      p_user_id: session.metadata!.userId,
      p_amount: parseInt(session.metadata!.credits),
      p_type: 'purchase_web',
      p_reference: session.id,
      p_description: `Acquisto ${session.metadata!.credits} crediti`
    })
    
    if (error) {
      console.error('Error adding credits:', error)
      return NextResponse.json({ error: 'Database error' }, { status: 500 })
    }
  }
  
  return NextResponse.json({ received: true })
}
