import { MongoClient, type MongoClientOptions } from "mongodb"

const MONGODB_URI = process.env.MONGODB_URI

if (!MONGODB_URI) {
  throw new Error("Please define the MONGODB_URI environment variable inside .env.local")
}

// MongoDB connection options to fix SSL issues
const options: MongoClientOptions = {
  // SSL/TLS Configuration
  tls: true,
  tlsAllowInvalidCertificates: false,
  tlsAllowInvalidHostnames: false,

  // Connection settings
  serverSelectionTimeoutMS: 10000, // 10 seconds
  connectTimeoutMS: 10000, // 10 seconds
  socketTimeoutMS: 30000, // 30 seconds

  // Retry settings
  retryWrites: true,
  retryReads: true,
  maxPoolSize: 10,
  minPoolSize: 1,

  // Additional options for stability
  heartbeatFrequencyMS: 10000,
  serverMonitoringMode: "auto",
}

let client: MongoClient
let clientPromise: Promise<MongoClient>

declare global {
  var _mongoClientPromise: Promise<MongoClient> | undefined
}

if (process.env.NODE_ENV === "development") {
  if (!global._mongoClientPromise) {
    client = new MongoClient(MONGODB_URI, options)
    global._mongoClientPromise = client.connect()
  }
  clientPromise = global._mongoClientPromise
} else {
  client = new MongoClient(MONGODB_URI, options)
  clientPromise = client.connect()
}

export default clientPromise
