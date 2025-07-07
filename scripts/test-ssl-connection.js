// Script to test SSL connection with different configurations
import { MongoClient } from "mongodb"

const MONGODB_URI = process.env.MONGODB_URI

if (!MONGODB_URI) {
  console.error("❌ Please set MONGODB_URI in your .env.local file")
  process.exit(1)
}

async function testSSLConnection() {
  console.log("🔐 Testing SSL/TLS connection to MongoDB Atlas...")

  // Test different SSL configurations
  const configurations = [
    {
      name: "Default SSL Configuration",
      options: {
        tls: true,
        serverSelectionTimeoutMS: 10000,
      },
    },
    {
      name: "Relaxed SSL Configuration",
      options: {
        tls: true,
        tlsAllowInvalidCertificates: true,
        tlsAllowInvalidHostnames: true,
        serverSelectionTimeoutMS: 15000,
      },
    },
    {
      name: "No SSL (Not recommended for Atlas)",
      options: {
        tls: false,
        serverSelectionTimeoutMS: 10000,
      },
    },
  ]

  for (const config of configurations) {
    console.log(`\n🧪 Testing: ${config.name}`)

    let client
    try {
      client = new MongoClient(MONGODB_URI, config.options)

      // Test connection with timeout
      await Promise.race([
        client.connect(),
        new Promise((_, reject) => setTimeout(() => reject(new Error("Connection timeout")), 20000)),
      ])

      console.log("✅ Connection successful!")

      // Test database operations
      const db = client.db("notes-app")
      await db.admin().ping()
      console.log("✅ Database ping successful!")

      const collections = await db.listCollections().toArray()
      console.log(`✅ Found ${collections.length} collections`)

      break // Success! Stop testing other configurations
    } catch (error) {
      console.log(`❌ Failed: ${error.message}`)

      if (error.message.includes("SSL") || error.message.includes("TLS")) {
        console.log("   → SSL/TLS related error")
      }
      if (error.message.includes("timeout")) {
        console.log("   → Connection timeout")
      }
      if (error.message.includes("authentication")) {
        console.log("   → Authentication issue")
      }
    } finally {
      if (client) {
        try {
          await client.close()
        } catch (e) {
          // Ignore close errors
        }
      }
    }
  }

  console.log("\n🔍 Troubleshooting Tips:")
  console.log("1. Check your MongoDB Atlas cluster is running")
  console.log("2. Verify your connection string password")
  console.log("3. Check Network Access settings in MongoDB Atlas")
  console.log("4. Try connecting from a different network")
  console.log("5. Update your MongoDB driver: npm update mongodb")
}

testSSLConnection()
