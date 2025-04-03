import { NextResponse } from "next/server"
import { Pool } from 'pg'
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"
import { query } from "@/lib/db"

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
})

// GET /api/categories - Get all categories
export async function GET() {
  try {
    const client = await pool.connect()
    const result = await client.query('SELECT * FROM categories ORDER BY name ASC')
    client.release()
    
    return NextResponse.json(result.rows)
  } catch (error) {
    console.error('Error fetching categories:', error)
    return NextResponse.json(
      { error: 'Failed to fetch categories' },
      { status: 500 }
    )
  }
}

// POST /api/categories - Create a new category (admin only)
export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions)

    if (!session || !session.user.isAdmin) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await request.json()

    // Validate the request body
    if (!body.name) {
      return NextResponse.json({ error: "Category name is required" }, { status: 400 })
    }

    const result = await query("INSERT INTO categories (name) VALUES ($1) RETURNING *", [body.name])

    return NextResponse.json(result[0], { status: 201 })
  } catch (error) {
    console.error("Error creating category:", error)
    return NextResponse.json({ error: "Failed to create category" }, { status: 500 })
  }
}

