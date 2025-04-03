"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { useStripe, useElements, PaymentElement } from "@stripe/react-stripe-js"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { useToast } from "@/components/ui/use-toast"

interface PaymentFormProps {
  orderId: string
  amount: number
}

export function PaymentForm({ orderId, amount }: PaymentFormProps) {
  const stripe = useStripe()
  const elements = useElements()
  const [processing, setProcessing] = useState(false)
  const [address, setAddress] = useState({
    line1: "",
    line2: "",
    city: "",
    state: "",
    postal_code: "",
  })
  const router = useRouter()
  const { toast } = useToast()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!stripe || !elements) {
      return
    }

    setProcessing(true)

    try {
      const { error } = await stripe.confirmPayment({
        elements,
        confirmParams: {
          return_url: `${window.location.origin}/order/success/${orderId}`,
          payment_method_data: {
            billing_details: {
              address: {
                ...address,
                country: "US",
              },
            },
          },
        },
      })

      if (error) {
        throw error
      }
    } catch (error) {
      console.error('Payment error:', error)
      toast({
        title: "Error",
        description: "Payment failed. Please try again.",
        variant: "destructive",
      })
    } finally {
      setProcessing(false)
    }
  }

  return (
    <Card className="w-full max-w-2xl mx-auto mt-8">
      <CardHeader>
        <CardTitle>Complete Your Order</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Delivery Address</h3>
            <Input
              placeholder="Street Address"
              value={address.line1}
              onChange={(e) => setAddress({ ...address, line1: e.target.value })}
              required
            />
            <Input
              placeholder="Apartment, suite, etc. (optional)"
              value={address.line2}
              onChange={(e) => setAddress({ ...address, line2: e.target.value })}
            />
            <div className="grid grid-cols-2 gap-4">
              <Input
                placeholder="City"
                value={address.city}
                onChange={(e) => setAddress({ ...address, city: e.target.value })}
                required
              />
              <Input
                placeholder="State"
                value={address.state}
                onChange={(e) => setAddress({ ...address, state: e.target.value })}
                required
              />
            </div>
            <Input
              placeholder="ZIP Code"
              value={address.postal_code}
              onChange={(e) => setAddress({ ...address, postal_code: e.target.value })}
              required
            />
          </div>

          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Payment Details</h3>
            <PaymentElement />
          </div>

          <div className="text-right">
            <Button type="submit" disabled={processing}>
              {processing ? "Processing..." : `Pay $${Number(amount).toFixed(2)}`}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  )
} 