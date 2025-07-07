import { type NextRequest, NextResponse } from "next/server"
import { MongoClient, ObjectId } from "mongodb"
import jwt from "jsonwebtoken"

const MONGODB_URI = process.env.MONGODB_URI || "mongodb://localhost:27017/notes-app"
const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key"

let client: MongoClient
let clientPromise: Promise<MongoClient>

if (!global._mongoClientPromise) {
  client = new MongoClient(MONGODB_URI)
  global._mongoClientPromise = client.connect()
}
clientPromise = global._mongoClientPromise

async function verifyToken(request: NextRequest) {
  const authHeader = request.headers.get("authorization")
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    throw new Error("No token provided")
  }

  const token = authHeader.substring(7)
  const decoded = jwt.verify(token, JWT_SECRET) as { userId: string; email: string }
  return decoded
}

export async function GET(request: NextRequest) {
  try {
    const decoded = await verifyToken(request)

    const client = await clientPromise
    const db = client.db("notes-app")
    const notes = db.collection("notes")

    // Get all notes for the authenticated user
    const userNotes = await notes
      .find({ userId: new ObjectId(decoded.userId) })
      .sort({ createdAt: -1 })
      .toArray()

    // Transform the data to match frontend expectations
    const transformedNotes = userNotes.map((note) => ({
      id: note._id.toString(),
      title: note.title,
      content: note.content,
      tags: note.tags || [],
      createdAt: note.createdAt.toISOString(),
      updatedAt: note.updatedAt.toISOString(),
    }))

    return NextResponse.json({ notes: transformedNotes })
  } catch (error) {
    console.error("Get notes error:", error)
    if (error.name === "JsonWebTokenError") {
      return NextResponse.json({ message: "Invalid token" }, { status: 401 })
    }
    return NextResponse.json({ message: "Server error" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const decoded = await verifyToken(request)
    const { title, content, tags } = await request.json()

    if (!title || !title.trim()) {
      return NextResponse.json({ message: "Title is required" }, { status: 400 })
    }

    const client = await clientPromise
    const db = client.db("notes-app")
    const notes = db.collection("notes")

    const newNote = {
      userId: new ObjectId(decoded.userId),
      title: title.trim(),
      content: content || "",
      tags: Array.isArray(tags) ? tags : [],
      createdAt: new Date(),
      updatedAt: new Date(),
    }

    const result = await notes.insertOne(newNote)

    const createdNote = {
      id: result.insertedId.toString(),
      title: newNote.title,
      content: newNote.content,
      tags: newNote.tags,
      createdAt: newNote.createdAt.toISOString(),
      updatedAt: newNote.updatedAt.toISOString(),
    }

    return NextResponse.json({ note: createdNote })
  } catch (error) {
    console.error("Create note error:", error)
    if (error.name === "JsonWebTokenError") {
      return NextResponse.json({ message: "Invalid token" }, { status: 401 })
    }
    return NextResponse.json({ message: "Server error" }, { status: 500 })
  }
}
