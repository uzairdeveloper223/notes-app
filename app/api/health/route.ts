import { NextResponse } from "next/server"
import { MongoClient } from "mongodb"

const MONGODB_URI = process.env.MONGODB_URI

export async function GET() {
  if (!MONGODB_URI) {
    return NextResponse.json({ message: "MONGODB_URI not configured" }, { status: 500 })
  }

  try {
    const client = new MongoClient(MONGODB_URI)
    await client.connect()

    // Test database access
    const db = client.db("notes-app")
    await db.admin().ping()

    await client.close()

    return NextResponse.json({
      status: "connected",
      message: "MongoDB Atlas connection successful",
      timestamp: new Date().toISOString(),
    })
  } catch (error) {
    console.error("Health check failed:", error)

    return NextResponse.json(
      {
        status: "error",
        message: error.message || "Database connection failed",
        timestamp: new Date().toISOString(),
      },
      { status: 500 },
    )
  }
}
