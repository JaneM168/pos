import { sql } from "@vercel/postgres"
import bcrypt from "bcryptjs"

async function createAdmin() {
  const username = process.env.ADMIN_USERNAME
  const password = process.env.ADMIN_PASSWORD

  if (!username || !password) {
    console.error("Please provide ADMIN_USERNAME and ADMIN_PASSWORD environment variables")
    process.exit(1)
  }

  const hashedPassword = await bcrypt.hash(password, 10)

  try {
    await sql`
      INSERT INTO admin_users (username, password)
      VALUES (${username}, ${hashedPassword})
    `
    console.log("Admin user created successfully")
  } catch (error) {
    console.error("Error creating admin user:", error)
  }
}

createAdmin() 