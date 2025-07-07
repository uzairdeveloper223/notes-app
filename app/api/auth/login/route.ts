import { type NextRequest, NextResponse } from "next/server"
import { MongoClient } from "mongodb"
import bcrypt from "bcryptjs"
import jwt from "jsonwebtoken"

// Debug: Log environment variables (remove in production)
console.log("🔍 Login Environment Check:")
console.log("MONGODB_URI exists:", !!process.env.MONGODB_URI)
console.log("JWT_SECRET exists:", !!process.env.JWT_SECRET)

const MONGODB_URI = process.env.MONGODB_URI
const JWT_SECRET = process.env.JWT_SECRET || "fallback-secret-key"

if (!MONGODB_URI) {
  console.error("❌ MONGODB_URI is not defined in environment variables")
  throw new Error("MONGODB_URI is not defined")
}

let client: MongoClient
let clientPromise: Promise<MongoClient>

declare global {
  var _mongoClientPromise: Promise<MongoClient> | undefined
}

if (!global._mongoClientPromise) {
  client = new MongoClient(MONGODB_URI)
  global._mongoClientPromise = client.connect()
}
clientPromise = global._mongoClientPromise

export async function POST(request: NextRequest) {
  try {
    console.log("🚀 Login request received")

    const { email, password } = await request.json()

    if (!email || !password) {
      return NextResponse.json({ message: "Email and password are required" }, { status: 400 })
    }

    console.log("🔄 Connecting to MongoDB...")
    const client = await clientPromise
    console.log("✅ Connected to MongoDB successfully")

    const db = client.db("notes-app")
    const users = db.collection("users")

    console.log("🔍 Finding user...")
    // Find user by email
    const user = await users.findOne({ email })

    if (!user) {
      return NextResponse.json({ message: "Invalid credentials" }, { status: 401 })
    }

    console.log("🔐 Verifying password...")
    // Verify password
    const isPasswordValid = await bcrypt.compare(password, user.password)

    if (!isPasswordValid) {
      return NextResponse.json({ message: "Invalid credentials" }, { status: 401 })
    }

    console.log("🎫 Generating JWT token...")
    // Generate JWT token
    const token = jwt.sign({ userId: user._id.toString(), email: user.email }, JWT_SECRET, { expiresIn: "7d" })

    console.log("✅ Login successful")
    return NextResponse.json({
      token,
      user: {
        id: user._id.toString(),
        name: user.name,
        email: user.email,
      },
    })
  } catch (error) {
    console.error("❌ Login error:", error)

    // More specific error messages
    if (error.name === "MongoServerSelectionError") {
      return NextResponse.json(
        {
          message: "Database connection failed. Please check your MongoDB connection string.",
        },
        { status: 500 },
      )
    }

    if (error.message.includes("authentication failed")) {
      return NextResponse.json(
        {
          message: "Database authentication failed. Please check your MongoDB credentials.",
        },
        { status: 500 },
      )
    }

    return NextResponse.json({ message: "Server error occurred during login" }, { status: 500 })
  }
}
