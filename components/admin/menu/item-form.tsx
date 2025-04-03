"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { useToast } from "@/components/ui/use-toast"
import { ImageUpload } from "./image-upload"

interface MenuItem {
  id?: number
  name: string
  description: string
  price: number
  category_id: number
  image_url?: string
}

interface MenuItemFormProps {
  item?: MenuItem
  onSubmit: () => void
  onCancel: () => void
}

export function MenuItemForm({ item, onSubmit, onCancel }: MenuItemFormProps) {
  const [formData, setFormData] = useState({
    name: item?.name || "",
    description: item?.description || "",
    price: item?.price?.toString() || "",
    category_id: item?.category_id?.toString() || "",
    image_url: item?.image_url || ""
  })
  const [loading, setLoading] = useState(false)
  const { toast } = useToast()

  const handleImageUpload = (imageUrl: string) => {
    setFormData(prev => ({ ...prev, image_url: imageUrl }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const response = await fetch('/api/menu' + (item ? `/${item.id}` : ''), {
        method: item ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          price: parseFloat(formData.price),
          category_id: parseInt(formData.category_id)
        })
      })

      if (!response.ok) throw new Error('Failed to save menu item')

      toast({
        title: "Success",
        description: `Menu item ${item ? 'updated' : 'created'} successfully`,
      })
      onSubmit()
    } catch (error) {
      console.error('Form submission error:', error)
      toast({
        title: "Error",
        description: "Failed to save menu item",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-sm font-medium mb-1">Name</label>
        <Input
          value={formData.name}
          onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
          required
        />
      </div>

      <div>
        <label className="block text-sm font-medium mb-1">Description</label>
        <Textarea
          value={formData.description}
          onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
        />
      </div>

      <div>
        <label className="block text-sm font-medium mb-1">Price</label>
        <Input
          type="number"
          step="0.01"
          value={formData.price}
          onChange={(e) => setFormData(prev => ({ ...prev, price: e.target.value }))}
          required
        />
      </div>

      <div>
        <label className="block text-sm font-medium mb-1">Image</label>
        <ImageUpload
          onUploadComplete={handleImageUpload}
          currentImageUrl={formData.image_url}
        />
      </div>

      <div className="flex justify-end gap-2">
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit" disabled={loading}>
          {loading ? 'Saving...' : (item ? 'Update' : 'Create')}
        </Button>
      </div>
    </form>
  )
} 