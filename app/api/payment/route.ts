
import { NextResponse } from 'next/server'
import Stripe from 'stripe'
import pool from '@/lib/db'

if (!process.env.STRIPE_SECRET_KEY) {
  throw new Error('Missing STRIPE_SECRET_KEY')
}

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY)

export async function POST(request: Request) {
  try {
    const { amount, orderId, isKiosk } = await request.json()

    if (!amount || !orderId) {
      return NextResponse.json(
        { error: 'Missing amount or orderId' },
        { status: 400 }
      )
    }

    if (amount <= 0) {
      return NextResponse.json(
        { error: 'Amount must be greater than 0' },
        { status: 400 }
      )
    }

    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(amount * 100), // Convert to cents
      currency: 'usd',
      payment_method_types: isKiosk ? ['card_present'] : ['card'],
      capture_method: isKiosk ? 'manual' : 'automatic',
      metadata: { 
        orderId,
        orderType: isKiosk ? 'kiosk' : 'online'
      }
    }).catch(err => {
      console.error('Stripe paymentIntent creation error:', err);
      throw new Error('PaymentIntent creation failed');
    });

    // Update order with payment intent
    const client = await pool.connect()
    try {
      await client.query(
        'UPDATE orders SET payment_intent_id = $1, status = $2 WHERE id = $3',
        [paymentIntent.id, 'processing', orderId]
      )
    } finally {
      client.release()
    }

    return NextResponse.json({ 
      clientSecret: paymentIntent.client_secret,
      paymentIntentId: paymentIntent.id
    })
  } catch (error) {
    console.error('Payment error:', error)
    const message = error instanceof Error ? error.message : 'Payment initialization failed'
    return NextResponse.json(
      { error: message }, 
      { status: 500 }
    )
  }
}
