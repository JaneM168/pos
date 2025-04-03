"use client"

import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { MinusCircle, PlusCircle, Trash2 } from "lucide-react"
import { useToast } from "@/components/ui/use-toast"
import { useState } from "react"

interface CartItem {
  id: number
  name: string
  price: number
  quantity: number
}

interface KioskCartProps {
  items: CartItem[]
  onUpdateQuantity: (itemId: number, change: number) => void
  onRemoveItem: (itemId: number) => void
}

export function KioskCart({ items = [], onUpdateQuantity, onRemoveItem }: KioskCartProps) {
  const { toast } = useToast()
  const [isProcessing, setIsProcessing] = useState(false)

  const subtotal = items.reduce((sum, item) => {
    const price = typeof item.price === 'string' ? parseFloat(item.price) : item.price
    return sum + (price * item.quantity)
  }, 0)
  const tax = subtotal * 0.08
  const total = subtotal + tax

  const handleCheckout = async () => {
    if (items.length === 0) {
      toast({
        title: "Cart is empty",
        description: "Please add items to your order",
        variant: "destructive",
      })
      return
    }

    setIsProcessing(true)

    try {
      // Log the order data being sent
      console.log('Sending order:', {
        items,
        subtotal,
        tax,
        total,
        orderType: "kiosk"
      })

      const response = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          items,
          subtotal,
          tax,
          total,
          orderType: "kiosk"
        })
      })

      const data = await response.json()
      console.log('Response received:', data)

      if (!response.ok) {
        throw new Error(data.details || data.error || "Failed to create order")
      }

      const { orderId } = data
      window.location.href = `/kiosk/payment/${orderId}`
    } catch (error) {
      console.error('Checkout error:', {
        message: error.message,
        stack: error.stack
      })
      toast({
        title: "Error",
        description: error.message || "Failed to process order",
        variant: "destructive",
      })
    } finally {
      setIsProcessing(false)
    }
  }

  return (
    <Card className="h-screen">
      <CardHeader>
        <CardTitle className="text-2xl text-red-600">Your Order</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {items.length === 0 ? (
          <p className="text-center text-muted-foreground py-8 text-xl">
            Your cart is empty
          </p>
        ) : (
          <>
            {items.map((item) => (
              <div key={item.id} className="flex justify-between items-center">
                <div className="flex-1">
                  <p className="font-medium text-lg">{item.name}</p>
                  <p className="text-muted-foreground">${item.price.toFixed(2)} each</p>
                </div>
                <div className="flex items-center gap-3">
                  <Button 
                    variant="outline" 
                    size="icon"
                    onClick={() => onUpdateQuantity(item.id, -1)}
                  >
                    <MinusCircle className="h-5 w-5" />
                  </Button>
                  <span className="w-8 text-center text-lg">{item.quantity}</span>
                  <Button 
                    variant="outline" 
                    size="icon"
                    onClick={() => onUpdateQuantity(item.id, 1)}
                  >
                    <PlusCircle className="h-5 w-5" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => onRemoveItem(item.id)}
                  >
                    <Trash2 className="h-5 w-5" />
                  </Button>
                </div>
              </div>
            ))}

            <Separator className="my-4" />

            <div className="space-y-3 text-lg">
              <div className="flex justify-between">
                <span>Subtotal</span>
                <span>${subtotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span>Tax (8%)</span>
                <span>${tax.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-xl font-bold">
                <span>Total</span>
                <span>${total.toFixed(2)}</span>
              </div>
            </div>
          </>
        )}
      </CardContent>
      <CardFooter>
        <Button 
          className="w-full text-lg py-6 bg-red-600 hover:bg-red-700"
          onClick={handleCheckout}
          disabled={items.length === 0 || isProcessing}
        >
          {isProcessing ? "Processing..." : "Place Order"}
        </Button>
      </CardFooter>
    </Card>
  )
}

