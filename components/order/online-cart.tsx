"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import { MinusCircle, PlusCircle, Trash2 } from "lucide-react"
import { useToast } from "@/components/ui/use-toast"

interface CartItem {
  id: number
  name: string
  price: number
  quantity: number
}

interface OnlineCartProps {
  items: CartItem[]
  onUpdateQuantity: (itemId: number, change: number) => void
  onRemoveItem: (itemId: number) => void
}

export function OnlineCart({ items = [], onUpdateQuantity, onRemoveItem }: OnlineCartProps) {
  const { toast } = useToast()
  const [isProcessing, setIsProcessing] = useState(false)
  const [address, setAddress] = useState({
    line1: "",
    line2: "",
    city: "",
    state: "",
    postal_code: "",
    instructions: ""
  })
  const [errors, setErrors] = useState({
    line1: false,
    line2: false,
    city: false,
    state: false,
    postal_code: false,
    instructions: false
  });

  const subtotal = items.reduce((sum, item) => {
    const price = typeof item.price === 'string' ? parseFloat(item.price) : item.price
    return sum + (price * item.quantity)
  }, 0)
  const tax = subtotal * 0.08
  const total = subtotal + tax

  const validateAddress = () => {
    const newErrors = {
      line1: address.line1.length < 3,
      city: address.city.length < 2,
      state: address.state.length < 2,
      postal_code: address.postal_code.length < 5,
      line2: false,
      instructions: false
    };
    setErrors(newErrors);
    return !Object.values(newErrors).some(Boolean);
  }

  const handleCheckout = async () => {
    if (items.length === 0) {
      toast({
        title: "Cart is empty",
        description: "Please add items to your order",
        variant: "destructive",
      })
      return
    }

    if (!validateAddress()) {
      return
    }

    setIsProcessing(true)

    try {
      const response = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          items,
          subtotal,
          tax,
          total,
          orderType: "delivery",
          deliveryAddress: address
        })
      })

      if (!response.ok) {
        throw new Error("Failed to create order")
      }

      const { orderId } = await response.json()

      window.location.href = `/order/payment/${orderId}`
    } catch (error) {
      console.error('Checkout error:', error)
      toast({
        title: "Error",
        description: "Failed to process order",
        variant: "destructive",
      })
    } finally {
      setIsProcessing(false)
    }
  }

  return (
    <Card className="sticky top-4">
      <CardHeader>
        <CardTitle>Your Order</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {items.length === 0 ? (
          <p className="text-center text-muted-foreground">Your cart is empty</p>
        ) : (
          <>
            {items.map((item) => (
              <div key={item.id} className="flex justify-between items-center">
                <div className="flex-1">
                  <p className="font-medium">{item.name}</p>
                  <p className="text-muted-foreground">${item.price.toFixed(2)} each</p>
                </div>
                <div className="flex items-center gap-2">
                  <Button 
                    variant="outline" 
                    size="icon"
                    onClick={() => onUpdateQuantity(item.id, -1)}
                  >
                    <MinusCircle className="h-4 w-4" />
                  </Button>
                  <span className="w-8 text-center">{item.quantity}</span>
                  <Button 
                    variant="outline" 
                    size="icon"
                    onClick={() => onUpdateQuantity(item.id, 1)}
                  >
                    <PlusCircle className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => onRemoveItem(item.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))}

            <Separator />

            <div className="space-y-2">
              <div className="flex justify-between">
                <span>Subtotal</span>
                <span>${subtotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span>Tax (8%)</span>
                <span>${tax.toFixed(2)}</span>
              </div>
              <div className="flex justify-between font-bold">
                <span>Total</span>
                <span>${total.toFixed(2)}</span>
              </div>
            </div>

            <div className="space-y-3">
              <h3 className="font-semibold">Delivery Address</h3>
              <div>
                <Label htmlFor="line1">Street Address*</Label>
                <Input
                  id="line1"
                  value={address.line1}
                  onChange={(e) => {
                    setAddress({ ...address, line1: e.target.value })
                    setErrors({ ...errors, line1: e.target.value.length < 3 })
                  }}
                  className={errors.line1 ? "border-red-500" : ""}
                  required
                />
              </div>
              <div>
                <Label htmlFor="line2">Apartment, Suite, etc.</Label>
                <Input
                  id="line2"
                  value={address.line2}
                  onChange={(e) => {
                    setAddress({ ...address, line2: e.target.value })
                    setErrors({ ...errors, line2: e.target.value.length < 3 })
                  }}
                  className={errors.line2 ? "border-red-500" : ""}
                />
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <Label htmlFor="city">City*</Label>
                  <Input
                    id="city"
                    value={address.city}
                    onChange={(e) => {
                      setAddress({ ...address, city: e.target.value })
                      setErrors({ ...errors, city: e.target.value.length < 2 })
                    }}
                    className={errors.city ? "border-red-500" : ""}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="state">State*</Label>
                  <Input
                    id="state"
                    value={address.state}
                    onChange={(e) => {
                      setAddress({ ...address, state: e.target.value })
                      setErrors({ ...errors, state: e.target.value.length < 2 })
                    }}
                    className={errors.state ? "border-red-500" : ""}
                    required
                  />
                </div>
              </div>
              <div>
                <Label htmlFor="postal_code">ZIP Code*</Label>
                <Input
                  id="postal_code"
                  value={address.postal_code}
                  onChange={(e) => {
                    setAddress({ ...address, postal_code: e.target.value })
                    setErrors({ ...errors, postal_code: e.target.value.length < 5 })
                  }}
                  className={errors.postal_code ? "border-red-500" : ""}
                  required
                />
              </div>
              <div>
                <Label htmlFor="instructions">Delivery Instructions</Label>
                <Input
                  id="instructions"
                  value={address.instructions}
                  onChange={(e) => {
                    setAddress({ ...address, instructions: e.target.value })
                    setErrors({ ...errors, instructions: e.target.value.length < 3 })
                  }}
                  className={errors.instructions ? "border-red-500" : ""}
                  placeholder="Optional: Gate code, landmarks, etc."
                />
              </div>
            </div>
          </>
        )}
      </CardContent>
      <CardFooter>
        <Button 
          className="w-full"
          onClick={handleCheckout}
          disabled={items.length === 0 || isProcessing}
        >
          {isProcessing ? "Processing..." : "Proceed to Checkout"}
        </Button>
      </CardFooter>
    </Card>
  )
}