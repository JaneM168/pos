
import pool from '../lib/db'
import bcrypt from 'bcryptjs'

async function createAdmin() {
  const username = process.env.ADMIN_USERNAME
  const password = process.env.ADMIN_PASSWORD

  if (!username || !password) {
    console.error("Please provide ADMIN_USERNAME and ADMIN_PASSWORD environment variables")
    process.exit(1)
  }

  const hashedPassword = await bcrypt.hash(password, 10)

  try {
    // Create admin_users table if it doesn't exist
    await pool.query(`
      CREATE TABLE IF NOT EXISTS admin_users (
        id SERIAL PRIMARY KEY,
        email VARCHAR(255) NOT NULL UNIQUE,
        password_hash VARCHAR(255) NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `)

    // Insert admin user
    await pool.query(
      'INSERT INTO admin_users (email, password_hash) VALUES ($1, $2)',
      [username, hashedPassword]
    )
    
    console.log("Admin user created successfully")
    process.exit(0)
  } catch (error) {
    console.error("Error creating admin user:", error)
    process.exit(1)
  }
}

createAdmin()
