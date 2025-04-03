import { NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"
import { initDb } from "@/lib/db"

// POST /api/init-db - Initialize the database (admin only)
export async function POST() {
  try {
    const session = await getServerSession(authOptions)

    if (!session || !session.user.isAdmin) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    await initDb()

    return NextResponse.json({ success: true, message: "Database initialized successfully" })
  } catch (error) {
    console.error("Error initializing database:", error)
    return NextResponse.json(
      {
        error: "Failed to initialize database",
        details: (error as Error).message,
      },
      { status: 500 },
    )
  }
}

