import { NextResponse } from "next/server"
import Stripe from "stripe"
import { emitToRoom } from "@/lib/websocket"

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || "", {
  apiVersion: "2023-10-16",
})

const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET || ""

export async function POST(request: Request) {
  const body = await request.text()
  const signature = request.headers.get("stripe-signature") || ""

  let event: Stripe.Event

  try {
    event = stripe.webhooks.constructEvent(body, signature, endpointSecret)
  } catch (err) {
    return NextResponse.json({ error: `Webhook signature verification failed: ${err}` }, { status: 400 })
  }

  // Handle the event
  switch (event.type) {
    case "payment_intent.succeeded":
      const paymentIntent = event.data.object as Stripe.PaymentIntent

      // Update order status in database
      // In a real app, you would update your database
      console.log(`Payment succeeded: ${paymentIntent.id}`)

      // Emit real-time update via WebSocket
      if (paymentIntent.metadata.orderId) {
        emitToRoom("orders", "order-updated", {
          orderId: paymentIntent.metadata.orderId,
          status: "paid",
        })
      }

      break
    default:
      console.log(`Unhandled event type: ${event.type}`)
  }

  return NextResponse.json({ received: true })
}

