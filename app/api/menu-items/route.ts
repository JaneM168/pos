import { NextResponse } from "next/server"
import { Pool } from 'pg'

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
})

export async function GET() {
  try {
    const client = await pool.connect()
    const result = await client.query('SELECT * FROM menu_items ORDER BY name ASC')
    client.release()
    
    return NextResponse.json(result.rows)
  } catch (error) {
    console.error('Error fetching menu items:', error)
    return NextResponse.json(
      { error: 'Failed to fetch menu items' },
      { status: 500 }
    )
  }
} 