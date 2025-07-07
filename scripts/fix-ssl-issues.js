// Script to diagnose and potentially fix SSL issues
import { MongoClient } from "mongodb"
import https from "https"
import { URL } from "url"

const MONGODB_URI = process.env.MONGODB_URI

if (!MONGODB_URI) {
  console.error("❌ Please set MONGODB_URI in your .env.local file")
  process.exit(1)
}

async function diagnoseSSLIssues() {
  console.log("🔍 Diagnosing SSL/TLS issues...")

  try {
    // Extract hostname from MongoDB URI
    const uri = new URL(MONGODB_URI.replace("mongodb+srv://", "https://"))
    const hostname = uri.hostname

    console.log(`🌐 Testing HTTPS connection to: ${hostname}`)

    // Test HTTPS connection
    const testHTTPS = () => {
      return new Promise((resolve, reject) => {
        const req = https.get(`https://${hostname}`, { timeout: 10000 }, (res) => {
          console.log(`✅ HTTPS connection successful (Status: ${res.statusCode})`)
          resolve(res.statusCode)
        })

        req.on("error", (error) => {
          console.log(`❌ HTTPS connection failed: ${error.message}`)
          reject(error)
        })

        req.on("timeout", () => {
          console.log(`❌ HTTPS connection timeout`)
          req.destroy()
          reject(new Error("HTTPS timeout"))
        })
      })
    }

    await testHTTPS()
  } catch (error) {
    console.log(`❌ Network connectivity issue: ${error.message}`)
  }

  // Test MongoDB connection with different Node.js TLS settings
  console.log("\n🔧 Testing MongoDB connection with different TLS settings...")

  // Temporarily disable strict SSL (NOT for production)
  process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0"

  try {
    const client = new MongoClient(MONGODB_URI, {
      tls: true,
      tlsAllowInvalidCertificates: true,
      tlsAllowInvalidHostnames: true,
      serverSelectionTimeoutMS: 15000,
    })

    await client.connect()
    console.log("✅ MongoDB connection successful with relaxed SSL!")

    const db = client.db("notes-app")
    await db.admin().ping()
    console.log("✅ Database operations working!")

    await client.close()

    console.log("\n💡 Solution found: Use relaxed SSL settings")
    console.log("Add these options to your MongoDB client:")
    console.log("  tlsAllowInvalidCertificates: true")
    console.log("  tlsAllowInvalidHostnames: true")
  } catch (error) {
    console.log(`❌ Even relaxed SSL failed: ${error.message}`)

    console.log("\n🆘 Advanced troubleshooting needed:")
    console.log("1. Check if your ISP blocks MongoDB Atlas")
    console.log("2. Try connecting from a different network")
    console.log("3. Contact MongoDB Atlas support")
    console.log("4. Consider using MongoDB connection string with different options")
  } finally {
    // Restore strict SSL
    delete process.env.NODE_TLS_REJECT_UNAUTHORIZED
  }
}

diagnoseSSLIssues()
