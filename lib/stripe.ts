import { loadStripe } from '@stripe/stripe-js'
import { StripeTerminal } from '@stripe/terminal-js'

export const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!)

// Initialize Stripe Terminal for kiosk
export const initializeTerminal = async () => {
  const terminal = await StripeTerminal.create({
    onFetchConnectionToken: async () => {
      const response = await fetch('/api/stripe/connection-token')
      const { secret } = await response.json()
      return secret
    },
    onUnexpectedReaderDisconnect: () => {
      console.error('Reader disconnected')
    },
  })
  return terminal
} 