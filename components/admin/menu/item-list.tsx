"use client"

import { useState, useEffect } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { useToast } from "@/components/ui/use-toast"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

interface MenuItem {
  id: number
  name: string
  description: string
  price: number
  category_id: number
  image_url: string
}

interface Category {
  id: number
  name: string
}

export function MenuItemList() {
  const [items, setItems] = useState<MenuItem[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editingItem, setEditingItem] = useState<MenuItem | null>(null)
  const { toast } = useToast()

  // Form state
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    price: "",
    category_id: "",
    image_url: ""
  })

  useEffect(() => {
    fetchMenuItems()
    fetchCategories()
  }, [])

  // Reset form when dialog closes
  useEffect(() => {
    if (!isDialogOpen) {
      setFormData({
        name: "",
        description: "",
        price: "",
        category_id: "",
        image_url: ""
      })
      setEditingItem(null)
    }
  }, [isDialogOpen])

  // Set form data when editing item
  useEffect(() => {
    if (editingItem) {
      setFormData({
        name: editingItem.name,
        description: editingItem.description || "",
        price: editingItem.price.toString(),
        category_id: editingItem.category_id.toString(),
        image_url: editingItem.image_url || ""
      })
    }
  }, [editingItem])

  async function fetchCategories() {
    try {
      const response = await fetch("/api/categories")
      if (!response.ok) throw new Error("Failed to fetch categories")
      const data = await response.json()
      setCategories(data)
    } catch (error) {
      console.error("Error fetching categories:", error)
      toast({
        title: "Error",
        description: "Failed to load categories",
        variant: "destructive",
      })
    }
  }

  async function fetchMenuItems() {
    try {
      const response = await fetch("/api/menu")
      if (!response.ok) throw new Error("Failed to fetch menu items")
      const data = await response.json()
      setItems(data)
      setLoading(false)
    } catch (error) {
      console.error("Error fetching menu items:", error)
      toast({
        title: "Error",
        description: "Failed to load menu items",
        variant: "destructive",
      })
      setLoading(false)
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    try {
      const response = await fetch(`/api/menu${editingItem ? `/${editingItem.id}` : ''}`, {
        method: editingItem ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...formData,
          price: parseFloat(formData.price),
          category_id: parseInt(formData.category_id)
        })
      })

      if (!response.ok) throw new Error("Failed to save menu item")

      toast({
        title: "Success",
        description: `Menu item ${editingItem ? "updated" : "created"} successfully`,
      })

      // Refresh the list and close dialog
      fetchMenuItems()
      setIsDialogOpen(false)
    } catch (error) {
      console.error("Error saving menu item:", error)
      toast({
        title: "Error",
        description: "Failed to save menu item",
        variant: "destructive",
      })
    }
  }

  async function handleDelete(id: number) {
    if (!confirm("Are you sure you want to delete this item?")) return

    try {
      const response = await fetch(`/api/menu/${id}`, {
        method: "DELETE"
      })

      if (!response.ok) throw new Error("Failed to delete menu item")

      toast({
        title: "Success",
        description: "Menu item deleted successfully",
      })

      fetchMenuItems()
    } catch (error) {
      console.error("Error deleting menu item:", error)
      toast({
        title: "Error",
        description: "Failed to delete menu item",
        variant: "destructive",
      })
    }
  }

  function handleEdit(item: MenuItem) {
    setEditingItem(item)
    setIsDialogOpen(true)
  }

  if (loading) {
    return <div>Loading...</div>
  }

  return (
    <div className="space-y-4">
      <Button onClick={() => setIsDialogOpen(true)}>Add Menu Item</Button>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editingItem ? "Edit" : "Add"} Menu Item</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label htmlFor="name">Name</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                required
              />
            </div>
            <div>
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              />
            </div>
            <div>
              <Label htmlFor="price">Price</Label>
              <Input
                id="price"
                type="number"
                step="0.01"
                value={formData.price}
                onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                required
              />
            </div>
            <div>
              <Label htmlFor="category">Category</Label>
              <Select
                value={formData.category_id}
                onValueChange={(value) => setFormData({ ...formData, category_id: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((category) => (
                    <SelectItem key={category.id} value={category.id.toString()}>
                      {category.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="image_url">Image URL</Label>
              <Input
                id="image_url"
                value={formData.image_url}
                onChange={(e) => setFormData({ ...formData, image_url: e.target.value })}
                placeholder="https://example.com/image.jpg"
              />
            </div>
            <Button type="submit">{editingItem ? "Update" : "Create"}</Button>
          </form>
        </DialogContent>
      </Dialog>

      {items.map((item) => (
        <Card key={item.id}>
          <CardContent className="p-4 flex justify-between items-center">
            <div>
              <h3 className="font-bold">{item.name}</h3>
              <p className="text-sm text-muted-foreground">{item.description}</p>
              <p className="mt-1">${item.price.toFixed(2)}</p>
              {item.image_url && (
                <img 
                  src={item.image_url} 
                  alt={item.name} 
                  className="w-20 h-20 object-cover mt-2 rounded"
                />
              )}
            </div>
            <div className="space-x-2">
              <Button variant="outline" onClick={() => handleEdit(item)}>
                Edit
              </Button>
              <Button variant="destructive" onClick={() => handleDelete(item.id)}>
                Delete
              </Button>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}

