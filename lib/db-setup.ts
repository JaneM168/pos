import { query } from './db'

async function setupDatabase() {
  try {
    // Drop existing tables if they exist
    await query(`
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

    // Get categories for reference
    const categories = await query('SELECT * FROM categories')
    const categoryMap = categories.reduce((acc: any, cat: any) => {
      acc[cat.name] = cat.id
      return acc
    }, {})

    // Insert sample menu items
    await query(`
      INSERT INTO menu_items (name, description, price, category_id, image_url) VALUES 
        ('California Roll', 'Crab, avocado, and cucumber', 8.99, $1, '/images/california-roll.jpg'),
        ('Salmon Nigiri', 'Fresh salmon over rice', 6.99, $2, '/images/salmon-nigiri.jpg'),
        ('Spicy Tuna Roll', 'Fresh tuna with spicy sauce', 9.99, $1, '/images/spicy-tuna.jpg'),
        ('Miso Soup', 'Traditional Japanese soup', 3.99, $3, '/images/miso-soup.jpg'),
        ('Green Tea', 'Hot Japanese green tea', 2.99, $4, '/images/green-tea.jpg')
    `, [
      categoryMap['Rolls'],
      categoryMap['Nigiri & Sashimi'],
      categoryMap['Appetizers'],
      categoryMap['Drinks']
    ])

    console.log('Menu items inserted successfully')

  } catch (error) {
    console.error('Database setup failed:', error)
    throw error
  }
}

setupDatabase() 