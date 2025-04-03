import { NextResponse } from "next/server"
import { testDatabaseConnection } from "@/lib/db-diagnostics"

export async function GET() {
  try {
    // Test database connection
    const dbTest = await testDatabaseConnection()

    // Return diagnostic information
    return NextResponse.json({
      environment: process.env.NODE_ENV,
      databaseConnection: dbTest,
      // Include a sanitized version of the DATABASE_URL (hide credentials)
      databaseUrlFormat: process.env.DATABASE_URL ? sanitizeDatabaseUrl(process.env.DATABASE_URL) : "Not set",
    })
  } catch (error) {
    console.error("Diagnostics error:", error)
    return NextResponse.json(
      {
        error: "Diagnostics failed",
        details: (error as Error).message,
      },
      { status: 500 },
    )
  }
}

// Helper function to hide sensitive information in the database URL
function sanitizeDatabaseUrl(url: string): string {
  try {
    const parsedUrl = new URL(url)
    // Hide username and password
    return `${parsedUrl.protocol}//${parsedUrl.host}${parsedUrl.pathname}`
  } catch {
    return "Invalid URL format"
  }
}

