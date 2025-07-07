import { type NextRequest, NextResponse } from "next/server"
import { MongoClient } from "mongodb"
import bcrypt from "bcryptjs"
import jwt from "jsonwebtoken"

// Debug: Log environment variables (remove in production)
console.log("🔍 Environment Check:")
console.log("MONGODB_URI exists:", !!process.env.MONGODB_URI)
console.log("JWT_SECRET exists:", !!process.env.JWT_SECRET)
console.log("MONGODB_URI preview:", process.env.MONGODB_URI?.substring(0, 50) + "...")

const MONGODB_URI = process.env.MONGODB_URI
const JWT_SECRET = process.env.JWT_SECRET || "fallback-secret-key"

if (!MONGODB_URI) {
  console.error("❌ MONGODB_URI is not defined in environment variables")
  throw new Error("MONGODB_URI is not defined")
}

if (!JWT_SECRET || JWT_SECRET === "fallback-secret-key") {
  console.warn("⚠️ JWT_SECRET is not properly configured")
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
    console.log("🚀 Signup request received")

    const { name, email, password } = await request.json()

    if (!name || !email || !password) {
      return NextResponse.json({ message: "All fields are required" }, { status: 400 })
    }

    if (password.length < 6) {
      return NextResponse.json({ message: "Password must be at least 6 characters" }, { status: 400 })
    }

    console.log("🔄 Connecting to MongoDB...")
    const client = await clientPromise
    console.log("✅ Connected to MongoDB successfully")

    const db = client.db("notes-app")
    const users = db.collection("users")

    console.log("🔍 Checking if user exists...")
    // Check if user already exists
    const existingUser = await users.findOne({ email })
    if (existingUser) {
      return NextResponse.json({ message: "User already exists" }, { status: 400 })
    }

    console.log("🔐 Hashing password...")
    // Hash password
    const hashedPassword = await bcrypt.hash(password, 12)

    console.log("💾 Creating new user...")
    // Create new user
    const result = await users.insertOne({
      name,
      email,
      password: hashedPassword,
      createdAt: new Date(),
      updatedAt: new Date(),
    })

    console.log("🎫 Generating JWT token...")
    // Generate JWT token
    const token = jwt.sign({ userId: result.insertedId.toString(), email }, JWT_SECRET, { expiresIn: "7d" })

    console.log("✅ User created successfully")
    return NextResponse.json({
      token,
      user: {
        id: result.insertedId.toString(),
        name,
        email,
      },
    })
  } catch (error) {
    console.error("❌ Signup error:", error)

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

    return NextResponse.json({ message: "Server error occurred during signup" }, { status: 500 })
  }
}
