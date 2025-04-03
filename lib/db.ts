import { Pool } from "pg"
import dotenv from "dotenv"

// Load environment variables from .env.local
dotenv.config({ path: ".env.local" })

if (!process.env.DATABASE_URL) {
  throw new Error('DATABASE_URL environment variable is not set')
}

// Create a PostgreSQL connection pool with a timeout
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === "production" ? { rejectUnauthorized: false } : false,
  connectionTimeoutMillis: 5000, // 5 second timeout
  query_timeout: 10000, // 10 second timeout for queries
})

// Test the connection
pool.query('SELECT NOW()', (err) => {
  if (err) {
    console.error('Database connection error:', err)
  } else {
    console.log('Database connected successfully')
  }
})

// Helper function to make queries
export async function query(text: string, params?: any[]) {
  try {
    const result = await pool.query(text, params)
    return result.rows
  } catch (error) {
    console.error('Database query error:', error)
    throw error
  }
}

export default pool

// Initialize database tables
export async function initDb() {
  const createTables = `
    CREATE TABLE IF NOT EXISTS categories (
      id SERIAL PRIMARY KEY,
      name VARCHAR(255) NOT NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS menu_items (
      id SERIAL PRIMARY KEY,
      name VARCHAR(255) NOT NULL,
      description TEXT,
      price DECIMAL(10, 2) NOT NULL,
      image_url TEXT,
      category_id INTEGER REFERENCES categories(id),
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS orders (
      id VARCHAR(255) PRIMARY KEY,
      customer_name VARCHAR(255),
      customer_email VARCHAR(255),
      status VARCHAR(50) NOT NULL,
      subtotal DECIMAL(10, 2) NOT NULL,
      tax DECIMAL(10, 2) NOT NULL,
      total DECIMAL(10, 2) NOT NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS order_items (
      id SERIAL PRIMARY KEY,
      order_id VARCHAR(255) REFERENCES orders(id),
      menu_item_id INTEGER REFERENCES menu_items(id),
      quantity INTEGER NOT NULL,
      price DECIMAL(10, 2) NOT NULL
    );
  `

  try {
    await query(createTables)
    console.log("Database tables initialized")

    // Check if categories exist, if not, seed initial data
    const categoriesCount = await query("SELECT COUNT(*) FROM categories")
    if (categoriesCount[0].count === "0") {
      await seedInitialData()
    }
  } catch (error) {
    console.error("Error initializing database tables:", error)
    throw error
  }
}

// Seed initial data for testing
async function seedInitialData() {
  try {
    // Insert categories
    const categories = ["Nigiri & Sashimi", "Rolls", "Combos", "Special Rolls", "Poke Bowls"]

    for (const category of categories) {
      await query("INSERT INTO categories (name) VALUES ($1)", [category])
    }

    // Get category IDs
    const categoryRows = await query("SELECT id, name FROM categories")
    const categoryMap = categoryRows.reduce(
      (map, row) => {
        map[row.name] = row.id
        return map
      },
      {} as Record<string, number>,
    )

    // Insert menu items
    const menuItems = [
      {
        name: "Salmon Nigiri",
        description: "Fresh salmon over rice",
        price: 5.99,
        image_url: "/images/nigiri-menu.png",
        category: "Nigiri & Sashimi",
      },
      {
        name: "Tuna Nigiri",
        description: "Fresh tuna over rice",
        price: 6.5,
        image_url: "/images/nigiri-menu.png",
        category: "Nigiri & Sashimi",
      },
      {
        name: "California Roll",
        description: "Crab, avocado, cucumber",
        price: 6.49,
        image_url: "/images/nigiri-menu.png",
        category: "Rolls",
      },
      {
        name: "Spicy Tuna Roll",
        description: "Spicy tuna, cucumber",
        price: 6.99,
        image_url: "/images/nigiri-menu.png",
        category: "Rolls",
      },
      {
        name: "Sushi Deluxe",
        description: "12 pcs of chef's choice sushi",
        price: 16.99,
        image_url: "/images/combo-menu.png",
        category: "Combos",
      },
      {
        name: "Rainbow Roll",
        description: "California roll topped with assorted fish",
        price: 11.99,
        image_url: "/images/combo-menu.png",
        category: "Special Rolls",
      },
      {
        name: "Salmon Poke Bowl",
        description: "Salmon, avocado, edamame, rice",
        price: 12.99,
        image_url: "/images/combo-menu.png",
        category: "Poke Bowls",
      },
    ]

    for (const item of menuItems) {
      await query(
        "INSERT INTO menu_items (name, description, price, image_url, category_id) VALUES ($1, $2, $3, $4, $5)",
        [item.name, item.description, item.price, item.image_url, categoryMap[item.category]],
      )
    }

    console.log("Initial data seeded successfully")
  } catch (error) {
    console.error("Error seeding initial data:", error)
    throw error
  }
}

