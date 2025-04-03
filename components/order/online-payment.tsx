"use client"

import { useEffect, useState } from "react"
import { loadStripe } from "@stripe/stripe-js"
import { Elements, PaymentElement, useStripe, useElements } from "@stripe/react-stripe-js"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!)

function PaymentForm({ orderId, amount }: { orderId: string; amount: number }) {
  const stripe = useStripe()
  const elements = useElements()
  const [error, setError] = useState<string>()
  const [processing, setProcessing] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!stripe || !elements) return

    setProcessing(true)
    setError(undefined)

    try {
      const { error } = await stripe.confirmPayment({
        elements,
        confirmParams: {
          return_url: `${window.location.origin}/order/success/${orderId}`,
        },
      })

      if (error) {
        setError(error.message)
      }
    } catch (err) {
      setError("An unexpected error occurred.")
    } finally {
      setProcessing(false)
    }
  }

  return (
    <form onSubmit={handleSubmit}>
      <PaymentElement />
      {error && <div className="text-red-600 mt-2">{error}</div>}
      <Button
        type="submit"
        className="w-full mt-4"
        disabled={!stripe || processing}
      >
        {processing ? "Processing..." : `Pay $${Number(amount).toFixed(2)}`}
      </Button>
    </form>
  )
}

export function OnlinePayment({ orderId, amount }: { orderId: string; amount: number }) {
  const [clientSecret, setClientSecret] = useState<string>()

  useEffect(() => {
    const initializePayment = async () => {
      const response = await fetch("/api/payment", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          orderId,
          amount,
          orderType: "online"
        })
      })

      const data = await response.json()
      setClientSecret(data.clientSecret)
    }

    initializePayment()
  }, [orderId, amount])

  if (!clientSecret) return <div>Loading...</div>

  return (
    <Card className="max-w-md mx-auto mt-8">
      <CardHeader>
        <CardTitle>Complete Payment</CardTitle>
      </CardHeader>
      <CardContent>
        <Elements stripe={stripePromise} options={{ clientSecret }}>
          <PaymentForm orderId={orderId} amount={amount} />
        </Elements>
      </CardContent>
    </Card>
  )
} 