// Script to create a test user for development
import { MongoClient } from "mongodb"
import bcrypt from "bcryptjs"

const MONGODB_URI = process.env.MONGODB_URI

if (!MONGODB_URI) {
  console.error("❌ Please set MONGODB_URI in your .env.local file")
  process.exit(1)
}

async function createTestUser() {
  let client

  try {
    console.log("🚀 Creating test user...")

    client = new MongoClient(MONGODB_URI)
    await client.connect()

    const db = client.db("notes-app")
    const users = db.collection("users")

    // Check if test user already exists
    const existingUser = await users.findOne({ email: "test@example.com" })

    if (existingUser) {
      console.log("ℹ️ Test user already exists")
      console.log("📧 Email: test@example.com")
      console.log("🔑 Password: password123")
      return
    }

    // Create test user
    const hashedPassword = await bcrypt.hash("password123", 12)

    const result = await users.insertOne({
      name: "Test User",
      email: "test@example.com",
      password: hashedPassword,
      createdAt: new Date(),
      updatedAt: new Date(),
    })

    console.log("✅ Test user created successfully!")
    console.log("📧 Email: test@example.com")
    console.log("🔑 Password: password123")
    console.log("🆔 User ID:", result.insertedId)

    // Create some sample notes for the test user
    const notes = db.collection("notes")

    await notes.insertMany([
      {
        userId: result.insertedId,
        title: "Welcome to Notes App",
        content: "This is your first note! You can edit or delete it anytime.",
        tags: ["welcome", "getting-started"],
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        userId: result.insertedId,
        title: "Meeting Notes",
        content: "Discussed project timeline and deliverables for Q1.",
        tags: ["work", "meetings"],
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        userId: result.insertedId,
        title: "Book Ideas",
        content: "List of books to read:\n1. Clean Code\n2. Design Patterns\n3. System Design",
        tags: ["books", "learning"],
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ])

    console.log("📝 Sample notes created for test user")
  } catch (error) {
    console.error("❌ Failed to create test user:", error.message)
  } finally {
    if (client) {
      await client.close()
    }
  }
}

createTestUser()
