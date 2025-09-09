import { NextRequest, NextResponse } from 'next/server'
import Stripe from 'stripe'
import { createClient } from '@/utils/supabase/server'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2024-11-20.acacia'
})

export async function POST(req: NextRequest) {
  try {
    const { packageId, userId } = await req.json()
    
    const supabase = createClient()
    
    // Recupera dettagli pacchetto
    const { data: pkg } = await supabase
      .from('credit_packages')
      .select('*')
      .eq('id', packageId)
      .single()
    
    if (!pkg) {
      return NextResponse.json({ error: 'Pacchetto non trovato' }, { status: 404 })
    }
    
    // Crea sessione Stripe
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [{
        price_data: {
          currency: 'eur',
          product_data: {
            name: `CampoLive - ${pkg.name}`,
            description: `${pkg.credits} crediti per dirette streaming`,
          },
          unit_amount: Math.round(pkg.price_web * 100),
        },
        quantity: 1,
      }],
      mode: 'payment',
      success_url: `${process.env.NEXT_PUBLIC_URL}/credits/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.NEXT_PUBLIC_URL}/credits`,
      metadata: {
        userId,
        packageId,
        credits: pkg.credits.toString(),
      },
    })
    
    return NextResponse.json({ sessionId: session.id })
  } catch (error) {
    console.error('Stripe checkout error:', error)
    return NextResponse.json({ error: 'Errore server' }, { status: 500 })
  }
}
