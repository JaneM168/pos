"use client"

import { useState } from "react"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import { MinusCircle, PlusCircle, Trash2 } from "lucide-react"

export function OrderSummary() {
  const [items, setItems] = useState([
    { id: 1, name: "Cappuccino", price: 4.99, quantity: 2 },
    { id: 8, name: "Margherita Pizza", price: 12.99, quantity: 1 },
    { id: 13, name: "French Fries", price: 3.99, quantity: 1 },
  ])

  const subtotal = items.reduce((sum, item) => sum + item.price * item.quantity, 0)
  const tax = subtotal * 0.08 // 8% tax
  const total = subtotal + tax

  const updateQuantity = (id: number, change: number) => {
    setItems(
      items.map((item) => {
        if (item.id === id) {
          const newQuantity = Math.max(1, item.quantity + change)
          return { ...item, quantity: newQuantity }
        }
        return item
      }),
    )
  }

  const removeItem = (id: number) => {
    setItems(items.filter((item) => item.id !== id))
  }

  return (
    <Card className="sticky top-4">
      <CardHeader>
        <CardTitle>Your Order</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {items.length === 0 ? (
          <p className="text-center text-muted-foreground py-4">Your cart is empty</p>
        ) : (
          <div className="space-y-4">
            {items.map((item) => (
              <div key={item.id} className="flex justify-between">
                <div className="flex-1">
                  <p className="font-medium">{item.name}</p>
                  <p className="text-sm text-muted-foreground">${item.price.toFixed(2)} each</p>
                </div>
                <div className="flex items-center gap-2">
                  <Button variant="outline" size="icon" className="h-7 w-7" onClick={() => updateQuantity(item.id, -1)}>
                    <MinusCircle className="h-4 w-4" />
                  </Button>
                  <span className="w-4 text-center">{item.quantity}</span>
                  <Button variant="outline" size="icon" className="h-7 w-7" onClick={() => updateQuantity(item.id, 1)}>
                    <PlusCircle className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-7 w-7 text-muted-foreground"
                    onClick={() => removeItem(item.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}

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

        <div className="space-y-2">
          <Label htmlFor="notes">Special Instructions</Label>
          <Input id="notes" placeholder="Allergies, special requests, etc." />
        </div>
      </CardContent>
      <CardFooter>
        <Button className="w-full" size="lg">
          Proceed to Checkout
        </Button>
      </CardFooter>
    </Card>
  )
}

