import { NextResponse } from "next/server"
import Stripe from "stripe"
import { Pool } from 'pg'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2023-10-16"
})

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
})

export async function POST(request: Request) {
  try {
    const { orderId, amount, isKiosk } = await request.json()

    // Create payment intent with different settings based on payment type
    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(amount * 100), // Convert to cents
      currency: 'usd',
      payment_method_types: isKiosk ? ['card_present'] : ['card'],
      capture_method: isKiosk ? 'manual' : 'automatic',
      // Add metadata for order tracking
      metadata: {
        orderId,
        orderType: isKiosk ? 'kiosk' : 'online'
      }
    })

    // Update order with payment intent ID
    const client = await pool.connect()
    await client.query(
      'UPDATE orders SET payment_intent_id = $1 WHERE id = $2',
      [paymentIntent.id, orderId]
    )
    client.release()

    return NextResponse.json({ 
      clientSecret: paymentIntent.client_secret,
      paymentIntentId: paymentIntent.id
    })
  } catch (error) {
    console.error('Error creating payment intent:', error)
    return NextResponse.json(
      { error: 'Failed to create payment intent' },
      { status: 500 }
    )
  }
} 