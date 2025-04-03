import { NextResponse } from 'next/server';
import pool from '@/lib/db';

export async function POST(request: Request) {
  const client = await pool.connect();
  try {
    const body = await request.json();
    console.log('Received order request:', body);

    const { items, subtotal, tax, total, orderType } = body;

    if (!items || items.length === 0) {
      console.log('Validation Error: No items in order');
      return NextResponse.json({ error: 'No items in order' }, { status: 400 });
    }

    await client.query('BEGIN');

    console.log('Order details:', {
      status: 'pending',
      subtotal,
      tax,
      total
    });

    const orderResult = await client.query(
      `INSERT INTO orders (status, subtotal, tax, total) VALUES ($1, $2::decimal, $3::decimal, $4::decimal) RETURNING id`,
      ['pending', subtotal, tax, total]
    );

    const orderId = orderResult.rows[0].id;
    console.log('Created order with ID:', orderId);

    for (const item of items) {
      console.log('Inserting order item:', item);
      await client.query(
        `INSERT INTO order_items (order_id, menu_item_id, quantity, price) VALUES ($1, $2, $3, $4::decimal)`,
        [orderId, item.id, item.quantity, item.price]
      );
    }

    await client.query('COMMIT');
    console.log('Order committed successfully with ID:', orderId);
    return NextResponse.json({ orderId });
    
  } catch (error) {
    await client.query('ROLLBACK');
    let errorMessage = 'Failed to create order';
    
    if (error instanceof Error) {
      console.error('Database error during order creation:', error);
      errorMessage = error.message;
    } else {
      console.error('Unknown error during order creation:', error);
    }

    return NextResponse.json({ error: errorMessage }, { status: 500 });
  } finally {
    client.release();
  }
}