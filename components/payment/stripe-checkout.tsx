"use client"

import type React from "react"

import { useState } from "react"
import { loadStripe } from "@stripe/stripe-js"
import { Elements, PaymentElement, useStripe, useElements } from "@stripe/react-stripe-js"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"

// Initialize Stripe
const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY || "")

export function StripeCheckout({
  clientSecret,
  orderId,
  amount,
}: {
  clientSecret: string
  orderId: string
  amount: number
}) {
  return (
    <Elements stripe={stripePromise} options={{ clientSecret }}>
      <CheckoutForm orderId={orderId} amount={amount} />
    </Elements>
  )
}

function CheckoutForm({ orderId, amount }: { orderId: string; amount: number }) {
  const stripe = useStripe()
  const elements = useElements()
  const [isLoading, setIsLoading] = useState(false)
  const [errorMessage, setErrorMessage] = useState<string | undefined>()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!stripe || !elements) {
      return
    }

    setIsLoading(true)
    setErrorMessage(undefined)

    try {
      const { error } = await stripe.confirmPayment({
        elements,
        confirmParams: {
          return_url: `${window.location.origin}/order/confirmation?order_id=${orderId}`,
        },
      })

      if (error) {
        setErrorMessage(error.message)
      }
    } catch (error) {
      setErrorMessage("An unexpected error occurred.")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Payment Details</CardTitle>
      </CardHeader>
      <form onSubmit={handleSubmit}>
        <CardContent>
          <PaymentElement />
          {errorMessage && <div className="text-destructive mt-4">{errorMessage}</div>}
        </CardContent>
        <CardFooter>
          <Button type="submit" className="w-full" disabled={!stripe || isLoading}>
            {isLoading ? "Processing..." : `Pay $${amount.toFixed(2)}`}
          </Button>
        </CardFooter>
      </form>
    </Card>
  )
}

