"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { useToast } from "@/components/ui/use-toast"
import { loadStripe } from "@stripe/stripe-js"

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!)

export function KioskPayment({ orderId, amount }: { orderId: string; amount: number }) {
  const [status, setStatus] = useState("Initializing payment...")
  const router = useRouter()
  const { toast } = useToast()

  useEffect(() => {
    const initializePayment = async () => {
      try {
        // Create payment intent
        const response = await fetch("/api/payment/create-intent", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            orderId,
            amount,
            orderType: "kiosk"
          })
        })

        if (!response.ok) throw new Error("Failed to create payment intent")

        setStatus("Ready for payment. Please tap, insert, or swipe your card.")

        // Handle card reader payment here...
        // This will depend on your specific card reader implementation

      } catch (error) {
        console.error("Payment error:", error)
        toast({
          title: "Error",
          description: "Payment failed. Please try again.",
          variant: "destructive"
        })
        setStatus("Payment failed")
      }
    }

    initializePayment()
  }, [orderId, amount, router, toast])

  return (
    <Card className="max-w-md mx-auto mt-8">
      <CardHeader>
        <CardTitle>Payment Required</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="text-center space-y-4">
          <p className="text-2xl font-bold">${amount.toFixed(2)}</p>
          <p className="text-lg">{status}</p>
        </div>
      </CardContent>
    </Card>
  )
} 