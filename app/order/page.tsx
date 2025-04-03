"use client"

import { useState } from "react"
import { MenuDisplay } from "@/components/order/menu-display"
import { OnlineCart } from "@/components/order/online-cart"
import { useToast } from "@/components/ui/use-toast"

interface MenuItem {
  id: number
  name: string
  description: string
  price: number
  category_id: number
  image_url?: string
}

export default function OrderPage() {
  const [cartItems, setCartItems] = useState<CartItem[]>([])
  const { toast } = useToast()

  const handleAddToCart = (item: MenuItem) => {
    setCartItems(prev => {
      const existingItem = prev.find(i => i.id === item.id)
      if (existingItem) {
        return prev.map(i => 
          i.id === item.id 
            ? { ...i, quantity: i.quantity + 1 }
            : i
        )
      }
      return [...prev, { ...item, quantity: 1 }]
    })
    toast({
      description: `Added ${item.name} to cart`
    })
  }

  const handleUpdateQuantity = (itemId: number, change: number) => {
    setCartItems(prev => 
      prev.map(item => {
        if (item.id === itemId) {
          const newQuantity = item.quantity + change
          return newQuantity > 0 ? { ...item, quantity: newQuantity } : item
        }
        return item
      }).filter(item => item.quantity > 0)
    )
  }

  const handleRemoveItem = (itemId: number) => {
    setCartItems(prev => prev.filter(item => item.id !== itemId))
  }

  return (
    <div className="container mx-auto py-6">
      <h1 className="text-3xl font-bold mb-6">Order Menu</h1>
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        <div className="lg:col-span-3">
          <MenuDisplay onAddToCart={handleAddToCart} />
        </div>
        <div className="lg:col-span-1">
          <OnlineCart 
            items={cartItems}
            onUpdateQuantity={handleUpdateQuantity}
            onRemoveItem={handleRemoveItem}
          />
        </div>
      </div>
    </div>
  )
}

