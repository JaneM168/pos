import { NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"
import { query } from "@/lib/db"

export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.isAdmin) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { name, description, price, category_id, image_url } = await request.json()
    
    const result = await query(
      `UPDATE menu_items 
       SET name = $1, description = $2, price = $3, category_id = $4, image_url = $5 
       WHERE id = $6 
       RETURNING *`,
      [name, description, price, category_id, image_url, params.id]
    )
    
    if (result.length === 0) {
      return NextResponse.json({ error: "Menu item not found" }, { status: 404 })
    }
    
    return NextResponse.json(result[0])
  } catch (error) {
    console.error("Database error:", error)
    return NextResponse.json({ error: "Failed to update menu item" }, { status: 500 })
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.isAdmin) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    await query('DELETE FROM menu_items WHERE id = $1', [params.id])
    
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Database error:", error)
    return NextResponse.json({ error: "Failed to delete menu item" }, { status: 500 })
  }
} 