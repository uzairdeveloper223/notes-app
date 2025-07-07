// Debug script to check environment variables
console.log("🔍 Environment Variables Debug:")
console.log("NODE_ENV:", process.env.NODE_ENV)
console.log("MONGODB_URI exists:", !!process.env.MONGODB_URI)
console.log("JWT_SECRET exists:", !!process.env.JWT_SECRET)

if (process.env.MONGODB_URI) {
  console.log("MONGODB_URI preview:", process.env.MONGODB_URI.substring(0, 50) + "...")

  // Check if it's pointing to localhost
  if (process.env.MONGODB_URI.includes("127.0.0.1") || process.env.MONGODB_URI.includes("localhost")) {
    console.log("⚠️ WARNING: MONGODB_URI is pointing to localhost!")
    console.log("Make sure you're using your MongoDB Atlas connection string")
  } else if (process.env.MONGODB_URI.includes("mongodb+srv")) {
    console.log("✅ MONGODB_URI appears to be a MongoDB Atlas connection string")
  }
} else {
  console.log("❌ MONGODB_URI is not set!")
}

if (!process.env.JWT_SECRET) {
  console.log("❌ JWT_SECRET is not set!")
}

console.log("\n📝 Make sure your .env.local file exists and contains:")
console.log(
  "MONGODB_URI=mongodb+srv://uzairxdev223:YOUR_PASSWORD@notes-app.g1tv0uj.mongodb.net/notes-app?retryWrites=true&w=majority&appName=notes-app",
)
console.log("JWT_SECRET=your-super-secret-jwt-key")
