"use client"
import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { useToast } from "@/components/ui/use-toast"
import { loadStripeTerminal } from '@stripe/terminal-js'

interface KioskPaymentProps {
  orderId: string
  amount: number
  orderType: string
}

export function KioskPayment({ orderId, amount, orderType }: KioskPaymentProps) {
  const [status, setStatus] = useState("Initializing...")
  const [loading, setLoading] = useState(false)
  const router = useRouter()
  const { toast } = useToast()

  useEffect(() => {
    let terminal: any = null // Initialize terminal as null to start with.

    const initializePayment = async () => {
      try {
        setLoading(true)
        // Create payment intent
        const paymentResponse = await fetch("/api/payment", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ orderId, amount, isKiosk: true })
        })

        if (!paymentResponse.ok) {
          throw new Error("Failed to create payment intent")
        }

        const { paymentIntentId } = await paymentResponse.json()

        // Initialize terminal
        const fetchConnectionToken = async () => {
          const response = await fetch('/connection_token', { method: 'POST' })
          const data = await response.json()
          return data.secret
        }

        terminal = await loadStripeTerminal()

        if (!terminal) {
          throw new Error("Failed to load Stripe Terminal")
        }

        const stripeTerminalInstance = terminal.create({
          onFetchConnectionToken: fetchConnectionToken,
          onUnexpectedReaderDisconnect: () => {
            console.error('Reader disconnected unexpectedly')
          },
        })

        setStatus("Connecting to reader...")

        // Connect to reader
        const config = { simulated: true }
        const discoverResult = await stripeTerminalInstance.discoverReaders(config)
        if (discoverResult.error) {
          console.log('Failed to discover: ', discoverResult.error)
          setStatus('Failed to discover readers')
          return
        }

        if (discoverResult.readers.length === 0) {
          console.log('No available readers.')
          setStatus('No readers found')
          return
        }

        const selectedReader = discoverResult.readers[0]

        const connectResult = await stripeTerminalInstance.connectReader(selectedReader)
        if (connectResult.error) {
          console.log('Failed to connect: ', connectResult.error)
          setStatus('Failed to connect to reader')
          return
        }

        console.log('Connected to reader: ', connectResult.reader.label)

        // Collect payment
        const result = await stripeTerminalInstance.collectPaymentMethod(paymentIntentId)
        if (result.error) {
          throw result.error
        }

        setStatus("Processing payment...")
        const processResult = await stripeTerminalInstance.processPayment(result.paymentIntent)
        if (processResult.error) {
          throw processResult.error
        }

        setStatus("Payment successful!")
        router.push(`/kiosk/success/${orderId}`)
      } catch (error) {
        console.error('Payment error:', error)
        toast({
          title: "Error",
          description: "Payment failed. Please try again.",
          variant: "destructive",
        })
        setStatus("Payment failed")
      } finally {
        setLoading(false)
      }
    }

    initializePayment()

    return () => {
      if (terminal) {
        terminal.disconnect()
      }
    }
  }, [orderId, amount, orderType, router, toast]) // Added orderType as a dependency

  return (
    <Card className="w-full max-w-md mx-auto mt-8">
      <CardHeader>
        <CardTitle>Payment Required</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="text-center space-y-4">
          <p className="text-2xl font-bold">${Number(amount).toFixed(2)}</p>
          <p className="text-lg">{status}</p>
          {loading && <p className="text-gray-500">Please wait...</p>} {/* Optional loading message */}
        </div>
      </CardContent>
    </Card>
  )
}
