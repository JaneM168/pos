"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useToast } from "@/components/ui/use-toast"

interface MenuItem {
  id: number
  name: string
  description: string
  price: number
  category_id: number
  image_url?: string
}

interface MenuDisplayProps {
  onAddToCart: (item: MenuItem) => void
}

export function MenuDisplay({ onAddToCart }: MenuDisplayProps) {
  const [categories, setCategories] = useState([])
  const [menuItems, setMenuItems] = useState({})
  const [loading, setLoading] = useState(true)
  const { toast } = useToast()

  useEffect(() => {
    fetchData()
  }, [])

  async function fetchData() {
    try {
      const [categoriesRes, menuRes] = await Promise.all([
        fetch("/api/categories"),
        fetch("/api/menu")
      ])

      const categoriesData = await categoriesRes.json()
      const menuData = await menuRes.json()

      setCategories(categoriesData)

      // Group menu items by category
      const grouped = menuData.reduce((acc, item) => {
        if (!acc[item.category_id]) {
          acc[item.category_id] = []
        }
        acc[item.category_id].push(item)
        return acc
      }, {})

      setMenuItems(grouped)
    } catch (error) {
      console.error("Failed to load menu data:", error)
      toast({
        title: "Error",
        description: "Failed to load menu items",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return <div>Loading...</div>
  }

  return (
    <Tabs defaultValue={categories[0]?.id?.toString()}>
      <TabsList className="w-full h-auto flex-wrap">
        {categories.map((category) => (
          <TabsTrigger 
            key={category.id} 
            value={category.id.toString()}
          >
            {category.name}
          </TabsTrigger>
        ))}
      </TabsList>
      {categories.map((category) => (
        <TabsContent key={category.id} value={category.id.toString()}>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {menuItems[category.id]?.map((item: MenuItem) => (
              <Card key={item.id}>
                <CardHeader>
                  {item.image_url && (
                    <div className="relative h-48 mb-2">
                      <img
                        src={item.image_url}
                        alt={item.name}
                        className="absolute inset-0 w-full h-full object-cover rounded-t-lg"
                      />
                    </div>
                  )}
                  <CardTitle>{item.name}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground mb-2">
                    {item.description}
                  </p>
                  <div className="flex justify-between items-center">
                    <p className="font-bold">${item.price.toFixed(2)}</p>
                    <Button onClick={() => onAddToCart(item)}>
                      Add to Cart
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
      ))}
    </Tabs>
  )
}

