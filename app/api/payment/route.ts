import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import Stripe from 'stripe'
import pool from '@/lib/db'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2023-10-16'
})

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { amount, orderId, isKiosk } = await request.json()

    // Create payment intent with different configurations based on payment type
    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(amount * 100),
      currency: 'usd',
      payment_method_types: isKiosk ? ['card_present'] : ['card'],
      capture_method: isKiosk ? 'manual' : 'automatic',
      metadata: { 
        orderId,
        orderType: isKiosk ? 'kiosk' : 'online'
      }
    })

    // Update order with payment intent
    await pool.query(
      'UPDATE orders SET payment_intent_id = $1, status = $2 WHERE id = $3',
      [paymentIntent.id, 'processing', orderId]
    )

    return NextResponse.json({ 
      clientSecret: paymentIntent.client_secret,
      paymentIntentId: paymentIntent.id
    })
  } catch (error) {
    console.error('Payment error:', error)
    return NextResponse.json({ error: 'Payment failed' }, { status: 500 })
  }
} 