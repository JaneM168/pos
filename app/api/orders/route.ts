import { NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"
import { query } from "@/lib/db"
import { Pool } from 'pg'

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
})

// GET /api/orders - Get all orders (admin only)
export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const query = session.user.isAdmin 
      ? 'SELECT * FROM orders ORDER BY created_at DESC'
      : 'SELECT * FROM orders WHERE user_id = $1 ORDER BY created_at DESC'
    
    const result = await pool.query(
      query,
      session.user.isAdmin ? [] : [session.user.id]
    )
    
    return NextResponse.json(result.rows)
  } catch (error) {
    console.error('Database error:', error)
    return NextResponse.json({ error: 'Failed to fetch orders' }, { status: 500 })
  }
}

// POST /api/orders - Create a new order
export async function POST(request: Request) {
  try {
    // Log the raw request body
    const body = await request.json()
    console.log('Received order request:', body)

    const { items, subtotal, tax, total, orderType } = body

    // Validate the input
    if (!items?.length) {
      console.log('No items in order')
      return NextResponse.json({ error: 'No items in order' }, { status: 400 })
    }

    // Log the database connection string (remove sensitive info)
    console.log('Database URL format:', process.env.DATABASE_URL?.split('@')[1])

    const client = await pool.connect()
    try {
      await client.query('BEGIN')
      
      // Test database connection
      const testQuery = await client.query('SELECT NOW()')
      console.log('Database connected, current time:', testQuery.rows[0])

      // Log the order data
      console.log('Creating order:', {
        status: 'pending',
        orderType,
        subtotal,
        tax,
        total
      })

      // Create order with explicit type casting
      const orderResult = await client.query(
        `INSERT INTO orders (
          status, 
          order_type, 
          subtotal, 
          tax, 
          total
        ) VALUES ($1, $2, $3::decimal, $4::decimal, $5::decimal) 
        RETURNING id`,
        ['pending', orderType, subtotal, tax, total]
      )

      const orderId = orderResult.rows[0].id
      console.log('Created order with ID:', orderId)

      // Log the items being inserted
      console.log('Inserting order items:', items)

      // Add order items with explicit type casting
      for (const item of items) {
        await client.query(
          `INSERT INTO order_items (
            order_id, 
            menu_item_id, 
            quantity, 
            price
          ) VALUES ($1, $2, $3, $4::decimal)`,
          [orderId, item.id, item.quantity, item.price]
        )
      }

      await client.query('COMMIT')
      console.log('Order committed successfully')
      return NextResponse.json({ orderId })
    } catch (error) {
      await client.query('ROLLBACK')
      console.error('Database error:', {
        message: error.message,
        code: error.code,
        detail: error.detail,
        stack: error.stack
      })
      throw error
    } finally {
      client.release()
    }
  } catch (error) {
    console.error('Order creation error:', {
      message: error.message,
      code: error.code,
      detail: error.detail,
      stack: error.stack
    })
    return NextResponse.json({ 
      error: 'Failed to create order',
      details: error.message 
    }, { status: 500 })
  }
}

