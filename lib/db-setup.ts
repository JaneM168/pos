import { query } from './db'

async function setupDatabase() {
  try {
    // Drop existing tables if they exist
    await query(`
      DROP TABLE IF EXISTS order_items CASCADE;
      DROP TABLE IF EXISTS orders CASCADE;
      DROP TABLE IF EXISTS menu_items CASCADE;
      DROP TABLE IF EXISTS categories CASCADE;
    `)

    // Create categories table with unique constraint on name
    await query(`
      CREATE TABLE categories (
        id SERIAL PRIMARY KEY,
        name VARCHAR(255) NOT NULL UNIQUE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE orders (
        id SERIAL PRIMARY KEY,
        total DECIMAL(10, 2) NOT NULL,
        status VARCHAR(50) NOT NULL DEFAULT 'pending',
        payment_intent_id VARCHAR(255),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE order_items (
        id SERIAL PRIMARY KEY,
        order_id INTEGER REFERENCES orders(id),
        menu_item_id INTEGER REFERENCES menu_items(id),
        quantity INTEGER NOT NULL,
        price DECIMAL(10, 2) NOT NULL
      );
    `)

    // Create menu_items table with unique constraint on name
    await query(`
      CREATE TABLE menu_items (
        id SERIAL PRIMARY KEY,
        name VARCHAR(255) NOT NULL UNIQUE,
        description TEXT,
        price DECIMAL(10, 2) NOT NULL,
        image_url TEXT,
        category_id INTEGER REFERENCES categories(id),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `)

    console.log('Tables created successfully')

    // Insert sample categories
    await query(`
      INSERT INTO categories (name) VALUES 
        ('Nigiri & Sashimi'),
        ('Rolls'),
        ('Special Rolls'),
        ('Appetizers'),
        ('Drinks');
    `)

    console.log('Categories inserted successfully')

  } catch (error) {
    console.error('Database setup failed:', error)
    throw error
  }
}

setupDatabase()