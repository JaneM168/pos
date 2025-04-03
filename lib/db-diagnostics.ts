import { Pool } from "pg"

// This file is for diagnosing database connection issues

export async function testDatabaseConnection() {
  console.log("Testing database connection...")

  try {
    // Check if DATABASE_URL exists
    if (!process.env.DATABASE_URL) {
      return {
        success: false,
        error: "DATABASE_URL environment variable is not set",
      }
    }

    console.log("DATABASE_URL exists, attempting to connect...")

    // Create a temporary pool for testing
    const testPool = new Pool({
      connectionString: process.env.DATABASE_URL,
      ssl: process.env.NODE_ENV === "production" ? { rejectUnauthorized: false } : false,
      connectionTimeoutMillis: 5000, // 5 second timeout
    })

    // Try to connect
    const client = await testPool.connect()

    // If we get here, connection was successful
    console.log("Successfully connected to database")

    // Run a simple query to verify database functionality
    const result = await client.query("SELECT NOW()")
    console.log("Database query successful:", result.rows[0])

    // Release the client
    client.release()

    // End the pool
    await testPool.end()

    return {
      success: true,
      message: "Database connection successful",
      timestamp: result.rows[0].now,
    }
  } catch (error) {
    console.error("Database connection test failed:", error)

    // Analyze the error to provide more helpful information
    const errorMessage = (error as Error).message
    let detailedError = errorMessage

    if (errorMessage.includes("connection refused")) {
      detailedError = "Connection refused. The database server might be down or not accepting connections from this IP."
    } else if (errorMessage.includes("password authentication failed")) {
      detailedError = "Authentication failed. Check your database username and password."
    } else if (errorMessage.includes("does not exist")) {
      detailedError = "Database does not exist. Check your database name."
    } else if (errorMessage.includes("SSL")) {
      detailedError = "SSL error. Your database might require SSL connections."
    } else if (errorMessage.includes("timeout")) {
      detailedError = "Connection timeout. The database server might be too slow to respond or unreachable."
    }

    return {
      success: false,
      error: detailedError,
      originalError: errorMessage,
    }
  }
}

