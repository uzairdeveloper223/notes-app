import { MongoClient } from "mongodb"

const MONGODB_URI =
  "mongodb+srv://uzairxdev223:YOUR_PASSWORD_HERE@notes-app.g1tv0uj.mongodb.net/notes-app?retryWrites=true&w=majority&appName=notes-app"

async function testConnection() {
  try {
    console.log("🔄 Connecting to MongoDB Atlas...")

    const client = new MongoClient(MONGODB_URI)
    await client.connect()

    console.log("✅ Successfully connected to MongoDB Atlas!")

    // Test database access
    const db = client.db("notes-app")
    const collections = await db.listCollections().toArray()

    console.log(
      "📊 Available collections:",
      collections.map((c) => c.name),
    )

    await client.close()
    console.log("🔐 Connection closed successfully")
  } catch (error) {
    console.error("❌ Connection failed:", error.message)

    if (error.message.includes("authentication failed")) {
      console.log("🔑 Check your username and password")
    }
    if (error.message.includes("network")) {
      console.log("🌐 Check your internet connection and IP whitelist")
    }
  }
}

testConnection()
