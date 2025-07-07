// MongoDB Database Setup Script
// Run this in MongoDB shell or MongoDB Compass

// Connect to MongoDB
// use notes-app

// Create indexes for better performance
db.users.createIndex({ "email": 1 }, { unique: true })
db.users.createIndex({ "createdAt": 1 })

db.notes.createIndex({ "userId": 1 })
db.notes.createIndex({ "createdAt": -1 })
db.notes.createIndex({ "tags": 1 })
db.notes.createIndex({ "title": "text", "content": "text" })

// Sample data insertion (optional)
// Insert a test user
db.users.insertOne({
  name: "Test User",
  email: "test@example.com",
  password: "$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj/RK.s5uO.G", // password: "password123"
  createdAt: new Date(),
  updatedAt: new Date()
})

// Get the user ID for sample notes
var testUser = db.users.findOne({ email: "test@example.com" })

// Insert sample notes
db.notes.insertMany([
  {
    userId: testUser._id,
    title: "Welcome to Notes App",
    content: "This is your first note! You can edit or delete it anytime.",
    tags: ["welcome", "getting-started"],
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    userId: testUser._id,
    title: "Meeting Notes",
    content: "Discussed project timeline and deliverables for Q1.",
    tags: ["work", "meetings"],
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    userId: testUser._id,
    title: "Book Ideas",
    content: "List of books to read: 1. Clean Code 2. Design Patterns 3. System Design",
    tags: ["books", "learning"],
    createdAt: new Date(),
    updatedAt: new Date()
  }
])

print("Database setup completed successfully!")
print("Collections created: users, notes")
print("Indexes created for optimal performance")
print("Sample data inserted (optional)")
