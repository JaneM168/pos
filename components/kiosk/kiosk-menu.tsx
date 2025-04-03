"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useToast } from "@/components/ui/use-toast"

interface MenuItem {
  id: number
  name: string
  description: string
  price: string | number
  category_id: number
  image_url?: string
}

interface Category {
  id: number
  name: string
}

interface KioskMenuProps {
  onAddToCart: (item: MenuItem) => void
}

export function KioskMenu({ onAddToCart }: KioskMenuProps) {
  const [categories, setCategories] = useState<Category[]>([])
  const [menuItems, setMenuItems] = useState<MenuItem[]>([])
  const [loading, setLoading] = useState(true)
  const { toast } = useToast()

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Log the fetch attempts
        console.log('Fetching data...')

        const [categoriesRes, menuItemsRes] = await Promise.all([
          fetch('/api/categories'),
          fetch('/api/menu-items')
        ])

        // Log the responses
        console.log('Categories status:', categoriesRes.status)
        console.log('Menu items status:', menuItemsRes.status)

        if (!categoriesRes.ok || !menuItemsRes.ok) {
          throw new Error('Failed to fetch data')
        }

        const categoriesData = await categoriesRes.json()
        const menuItemsData = await menuItemsRes.json()

        // Log the data
        console.log('Categories:', categoriesData)
        console.log('Menu items:', menuItemsData)

        // Convert price strings to numbers if needed
        const processedMenuItems = menuItemsData.map((item: MenuItem) => ({
          ...item,
          price: typeof item.price === 'string' ? parseFloat(item.price) : item.price
        }))

        setCategories(categoriesData)
        setMenuItems(processedMenuItems)
      } catch (error) {
        console.error('Fetch error:', error)
        toast({
          title: "Error",
          description: "Failed to load menu items",
          variant: "destructive",
        })
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [toast])

  const formatPrice = (price: string | number): string => {
    const numPrice = typeof price === 'string' ? parseFloat(price) : price
    return numPrice.toFixed(2)
  }

  if (loading) {
    return <div className="flex items-center justify-center h-screen">
      <div className="text-2xl">Loading menu...</div>
    </div>
  }

  if (categories.length === 0 || menuItems.length === 0) {
    return <div className="flex items-center justify-center h-screen">
      <div className="text-2xl">No menu items available</div>
    </div>
  }

  return (
    <div className="p-4">
      <Tabs defaultValue={categories[0]?.id?.toString()} className="w-full">
        <TabsList className="w-full justify-start flex-wrap h-auto gap-2 bg-transparent mb-4">
          {categories.map((category) => (
            <TabsTrigger
              key={category.id}
              value={category.id.toString()}
              className="text-xl py-6 px-8"
            >
              {category.name}
            </TabsTrigger>
          ))}
        </TabsList>

        {categories.map((category) => (
          <TabsContent
            key={category.id}
            value={category.id.toString()}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4"
          >
            {menuItems
              .filter((item) => item.category_id === category.id)
              .map((item) => (
                <Card key={item.id} className="overflow-hidden">
                  {item.image_url && (
                    <div className="aspect-video w-full overflow-hidden">
                      <img
                        src={item.image_url}
                        alt={item.name}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  )}
                  <CardContent className="p-4">
                    <div className="flex justify-between items-start mb-2">
                      <h3 className="text-xl font-bold">{item.name}</h3>
                      <span className="text-xl font-bold">
                        ${formatPrice(item.price)}
                      </span>
                    </div>
                    <p className="text-muted-foreground mb-4">
                      {item.description}
                    </p>
                    <Button
                      className="w-full text-lg py-6"
                      onClick={() => onAddToCart({
                        ...item,
                        price: typeof item.price === 'string' ? parseFloat(item.price) : item.price
                      })}
                    >
                      Add to Order
                    </Button>
                  </CardContent>
                </Card>
              ))}
          </TabsContent>
        ))}
      </Tabs>
    </div>
  )
}

