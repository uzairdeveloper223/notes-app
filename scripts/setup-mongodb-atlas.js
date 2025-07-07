// Script to test MongoDB Atlas connection and set up initial data
import { MongoClient } from "mongodb"

const MONGODB_URI = process.env.MONGODB_URI

if (!MONGODB_URI) {
  console.error("❌ Please set MONGODB_URI in your .env.local file")
  process.exit(1)
}

async function setupMongoDBAtlas() {
  let client

  try {
    console.log("🚀 Starting MongoDB Atlas setup...")
    console.log("🔄 Connecting to MongoDB Atlas...")

    // Connect to MongoDB
    client = new MongoClient(MONGODB_URI)
    await client.connect()

    console.log("✅ Successfully connected to MongoDB Atlas!")

    const db = client.db("notes-app")

    // Create indexes for better performance
    console.log("📊 Creating database indexes...")

    // Users collection indexes
    const usersCollection = db.collection("users")
    await usersCollection.createIndex({ email: 1 }, { unique: true })
    await usersCollection.createIndex({ createdAt: 1 })

    // Notes collection indexes
    const notesCollection = db.collection("notes")
    await notesCollection.createIndex({ userId: 1 })
    await notesCollection.createIndex({ createdAt: -1 })
    await notesCollection.createIndex({ tags: 1 })
    await notesCollection.createIndex({ title: "text", content: "text" })

    console.log("✅ Database indexes created successfully!")

    // Check if we can write to the database
    console.log("🧪 Testing database write permissions...")

    const testResult = await db.collection("test").insertOne({
      message: "Test connection successful",
      timestamp: new Date(),
    })

    console.log("✅ Write test successful! Document ID:", testResult.insertedId)

    // Clean up test document
    await db.collection("test").deleteOne({ _id: testResult.insertedId })
    console.log("🧹 Test document cleaned up")

    // Show database stats
    const stats = await db.stats()
    console.log("📈 Database stats:")
    console.log(`   - Database: ${stats.db}`)
    console.log(`   - Collections: ${stats.collections}`)
    console.log(`   - Data Size: ${(stats.dataSize / 1024).toFixed(2)} KB`)

    console.log("\n🎉 MongoDB Atlas setup completed successfully!")
    console.log("🚀 Your app is ready to use MongoDB Atlas!")
  } catch (error) {
    console.error("❌ Setup failed:", error.message)

    if (error.message.includes("authentication failed")) {
      console.log("\n🔑 Authentication Error Solutions:")
      console.log("1. Check your username and password in the connection string")
      console.log("2. Make sure the database user exists in MongoDB Atlas")
      console.log("3. Verify the user has 'Read and write to any database' permissions")
    }

    if (error.message.includes("IP not in whitelist")) {
      console.log("\n🌐 Network Access Error Solutions:")
      console.log("1. Go to MongoDB Atlas → Network Access")
      console.log("2. Add your current IP address")
      console.log("3. Or temporarily allow access from anywhere (0.0.0.0/0)")
    }

    if (error.name === "MongoServerSelectionError") {
      console.log("\n🔗 Connection Error Solutions:")
      console.log("1. Check your internet connection")
      console.log("2. Verify the connection string is correct")
      console.log("3. Make sure your cluster is running (not paused)")
    }
  } finally {
    if (client) {
      await client.close()
      console.log("🔐 Connection closed")
    }
  }
}

setupMongoDBAtlas()
