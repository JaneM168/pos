"use client"

import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { MinusCircle, PlusCircle, Trash2 } from "lucide-react"
import { useToast } from "@/components/ui/use-toast"

export interface CartItem {
  id: number
  name: string
  price: number
  quantity: number
}

interface CartProps {
  items: CartItem[]
  onUpdateQuantity: (itemId: number, change: number) => void
  onRemoveItem: (itemId: number) => void
  isKiosk?: boolean
}

export function Cart({ items = [], onUpdateQuantity, onRemoveItem, isKiosk = false }: CartProps) {
  const { toast } = useToast()

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

    try {
      const response = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          items,
          subtotal,
          tax,
          total,
          orderType: isKiosk ? "kiosk" : "online"
        })
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.details || data.error || "Failed to create order")
      }

      const { orderId } = data
      
      window.location.href = isKiosk 
        ? `/kiosk/payment/${orderId}`
        : `/order/payment/${orderId}`
    } catch (error) {
      console.error('Checkout error:', error)
      toast({
        title: "Error",
        description: error.message || "Failed to process order",
        variant: "destructive",
      })
    }
  }

  return (
    <Card className={isKiosk ? "h-screen" : "sticky top-4"}>
      <CardHeader>
        <CardTitle className={isKiosk ? "text-2xl text-red-600" : ""}>
          Your Order
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {items.length === 0 ? (
          <p className="text-center text-muted-foreground py-8 text-lg">
            Your cart is empty
          </p>
        ) : (
          <div className="space-y-6">
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
                  <span className="w-6 text-center text-lg">{item.quantity}</span>
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
                    className="text-muted-foreground"
                    onClick={() => onRemoveItem(item.id)}
                  >
                    <Trash2 className="h-5 w-5" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}

        <Separator className="my-4" />
        
        <div className="space-y-2">
          <div className="flex justify-between">
            <span>Subtotal</span>
            <span>${subtotal.toFixed(2)}</span>
          </div>
          <div className="flex justify-between">
            <span>Tax (8%)</span>
            <span>${tax.toFixed(2)}</span>
          </div>
          <div className="flex justify-between text-lg font-bold">
            <span>Total</span>
            <span>${total.toFixed(2)}</span>
          </div>
        </div>
      </CardContent>
      <CardFooter>
        <Button 
          className={`w-full ${isKiosk ? 'text-lg py-6 bg-red-600 hover:bg-red-700' : ''}`}
          onClick={handleCheckout}
          disabled={items.length === 0}
        >
          {isKiosk ? 'Place Order' : 'Proceed to Checkout'}
        </Button>
      </CardFooter>
    </Card>
  )
} 