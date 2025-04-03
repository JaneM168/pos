"use client"

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { useToast } from '@/components/ui/use-toast'

interface MenuItem {
  id: number
  name: string
  description: string
  price: number
  category: string
  image_url: string
}

export default function Menu() {
  const [menuItems, setMenuItems] = useState<MenuItem[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const { toast } = useToast()

  useEffect(() => {
    fetchMenu()
  }, [])

  const fetchMenu = async () => {
    try {
      setLoading(true)
      setError(null)
      
      const response = await fetch('/api/menu')
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }
      
      const data = await response.json()
      
      if (data.error) {
        throw new Error(data.error)
      }
      
      setMenuItems(Array.isArray(data) ? data : [])
    } catch (error) {
      console.error('Failed to fetch menu:', error)
      setError('Failed to load menu items. Please try again later.')
      toast({
        title: "Error",
        description: "Failed to load menu items. Please try again later.",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[200px]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="text-center p-4">
        <p className="text-red-500">{error}</p>
        <Button onClick={fetchMenu} className="mt-4">
          Try Again
        </Button>
      </div>
    )
  }

  if (!menuItems.length) {
    return (
      <div className="text-center p-4">
        <p>No menu items available.</p>
      </div>
    )
  }

  return (
    <div className="container mx-auto p-4">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {menuItems.map((item) => (
          <Card key={item.id}>
            <CardHeader>
              <CardTitle>{item.name}</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">{item.description}</p>
              <p className="mt-2 font-bold">${item.price.toFixed(2)}</p>
              <Button className="mt-4">
                Add to Order
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
} 