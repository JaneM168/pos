import { NextResponse } from "next/server"
import { query } from "@/lib/db"

export async function GET() {
  try {
    const categories = await query('SELECT * FROM categories')
    const menuItems = await query('SELECT * FROM menu_items')
    
    return NextResponse.json({
      categories,
      menuItems,
      categoriesCount: categories.length,
      menuItemsCount: menuItems.length
    })
  } catch (error) {
    console.error('Debug route error:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
} 