"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { useToast } from "@/components/ui/use-toast"
import { Upload, Loader2 } from "lucide-react"
import Image from "next/image"

interface ImageUploadProps {
  onUploadComplete: (imageUrl: string) => void
  currentImageUrl?: string
}

export function ImageUpload({ onUploadComplete, currentImageUrl }: ImageUploadProps) {
  const [uploading, setUploading] = useState(false)
  const { toast } = useToast()

  async function handleUpload(e: React.ChangeEvent<HTMLInputElement>) {
    if (!e.target.files?.[0]) return

    const file = e.target.files[0]
    if (!file.type.startsWith('image/')) {
      toast({
        title: "Invalid file type",
        description: "Please upload an image file",
        variant: "destructive",
      })
      return
    }

    setUploading(true)
    const formData = new FormData()
    formData.append('file', file)

    try {
      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      })

      if (!response.ok) throw new Error('Upload failed')

      const data = await response.json()
      onUploadComplete(data.url)
      
      toast({
        title: "Upload successful",
        description: "Image has been uploaded",
      })
    } catch (error) {
      console.error('Upload error:', error)
      toast({
        title: "Upload failed",
        description: "Failed to upload image. Please try again.",
        variant: "destructive",
      })
    } finally {
      setUploading(false)
    }
  }

  return (
    <div className="space-y-4">
      {currentImageUrl && (
        <div className="relative w-full h-48">
          <Image
            src={currentImageUrl}
            alt="Current menu item image"
            fill
            className="object-cover rounded-md"
          />
        </div>
      )}
      <div className="flex items-center gap-4">
        <Input
          type="file"
          accept="image/*"
          onChange={handleUpload}
          disabled={uploading}
          className="cursor-pointer"
        />
        {uploading && (
          <Loader2 className="h-4 w-4 animate-spin" />
        )}
      </div>
    </div>
  )
} 