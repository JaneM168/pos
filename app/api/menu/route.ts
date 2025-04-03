import { NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"
import { query } from "@/lib/db"

// GET /api/menu - Get all menu items
export async function GET() {
  try {
    // For testing purposes, temporarily remove authentication check
    // const session = await getServerSession(authOptions)
    // if (!session) {
    //   return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    // }

    const menuItems = await query(`
      SELECT 
        m.id,
        m.name,
        m.description,
        m.price::float as price,
        m.image_url,
        m.category_id,
        c.name as category_name
      FROM menu_items m
      LEFT JOIN categories c ON m.category_id = c.id
      ORDER BY c.name, m.name
    `)
    
    // Convert price strings to numbers
    const formattedItems = menuItems.map(item => ({
      ...item,
      price: parseFloat(item.price)
    }))
    
    // Always return an array, even if empty
    return NextResponse.json(formattedItems || [])
  } catch (error) {
    console.error('Menu route error:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

// POST /api/menu - Create a new menu item
export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.isAdmin) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { name, description, price, category_id, image_url } = await request.json()
    
    const result = await query(
      'INSERT INTO menu_items (name, description, price, category_id, image_url) VALUES ($1, $2, $3, $4, $5) RETURNING *',
      [name, description, price, category_id, image_url]
    )
    
    return NextResponse.json(result[0])
  } catch (error) {
    console.error('Database error:', error)
    return NextResponse.json({ error: 'Failed to create menu item' }, { status: 500 })
  }
}

export async function PUT(request: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.isAdmin) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { id, name, description, price, category_id, image_url } = await request.json()
    
    const result = await query(
      `UPDATE menu_items 
       SET name = $1, description = $2, price = $3, category_id = $4, image_url = $5 
       WHERE id = $6 
       RETURNING *`,
      [name, description, price, category_id, image_url, id]
    )
    
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

