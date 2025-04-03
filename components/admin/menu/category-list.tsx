"use client"

import { useState, useEffect } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Edit, Trash2 } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

type Category = {
  id: number
  name: string
  itemCount?: number
}

export function MenuCategoryList() {
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)
  const { toast } = useToast()

  useEffect(() => {
    async function fetchCategories() {
      try {
        const response = await fetch("/api/categories")
        if (!response.ok) {
          throw new Error("Failed to fetch categories")
        }

        const data = await response.json()

        // Get item counts for each category
        const menuResponse = await fetch("/api/menu")
        if (!menuResponse.ok) {
          throw new Error("Failed to fetch menu items")
        }

        const menuItems = await menuResponse.json()

        // Count items per category
        const itemCounts: Record<number, number> = {}
        menuItems.forEach((item: any) => {
          const categoryId = item.category_id
          itemCounts[categoryId] = (itemCounts[categoryId] || 0) + 1
        })

        // Add item counts to categories
        const categoriesWithCounts = data.map((category: Category) => ({
          ...category,
          itemCount: itemCounts[category.id] || 0,
        }))

        setCategories(categoriesWithCounts)
      } catch (error) {
        console.error("Error fetching categories:", error)
        toast({
          title: "Error",
          description: "Failed to load categories",
          variant: "destructive",
        })
      } finally {
        setLoading(false)
      }
    }

    fetchCategories()
  }, [toast])

  if (loading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3, 4, 5].map((i) => (
          <Card key={i}>
            <CardContent className="p-4 flex justify-between items-center">
              <div className="w-full h-12 bg-muted animate-pulse rounded" />
            </CardContent>
          </Card>
        ))}
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {categories.map((category) => (
        <Card key={category.id}>
          <CardContent className="p-4 flex justify-between items-center">
            <div>
              <h4 className="font-medium">{category.name}</h4>
              <p className="text-sm text-muted-foreground">{category.itemCount} items</p>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" size="icon">
                <Edit className="h-4 w-4" />
              </Button>
              <Button variant="outline" size="icon">
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}

