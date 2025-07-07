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

export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const decoded = await verifyToken(request)
    const { title, content, tags } = await request.json()
    const noteId = params.id

    if (!title || !title.trim()) {
      return NextResponse.json({ message: "Title is required" }, { status: 400 })
    }

    if (!ObjectId.isValid(noteId)) {
      return NextResponse.json({ message: "Invalid note ID" }, { status: 400 })
    }

    const client = await clientPromise
    const db = client.db("notes-app")
    const notes = db.collection("notes")

    // Update the note (only if it belongs to the authenticated user)
    const result = await notes.updateOne(
      {
        _id: new ObjectId(noteId),
        userId: new ObjectId(decoded.userId),
      },
      {
        $set: {
          title: title.trim(),
          content: content || "",
          tags: Array.isArray(tags) ? tags : [],
          updatedAt: new Date(),
        },
      },
    )

    if (result.matchedCount === 0) {
      return NextResponse.json({ message: "Note not found" }, { status: 404 })
    }

    // Get the updated note
    const updatedNote = await notes.findOne({ _id: new ObjectId(noteId) })

    const transformedNote = {
      id: updatedNote._id.toString(),
      title: updatedNote.title,
      content: updatedNote.content,
      tags: updatedNote.tags || [],
      createdAt: updatedNote.createdAt.toISOString(),
      updatedAt: updatedNote.updatedAt.toISOString(),
    }

    return NextResponse.json({ note: transformedNote })
  } catch (error) {
    console.error("Update note error:", error)
    if (error.name === "JsonWebTokenError") {
      return NextResponse.json({ message: "Invalid token" }, { status: 401 })
    }
    return NextResponse.json({ message: "Server error" }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const decoded = await verifyToken(request)
    const noteId = params.id

    if (!ObjectId.isValid(noteId)) {
      return NextResponse.json({ message: "Invalid note ID" }, { status: 400 })
    }

    const client = await clientPromise
    const db = client.db("notes-app")
    const notes = db.collection("notes")

    // Delete the note (only if it belongs to the authenticated user)
    const result = await notes.deleteOne({
      _id: new ObjectId(noteId),
      userId: new ObjectId(decoded.userId),
    })

    if (result.deletedCount === 0) {
      return NextResponse.json({ message: "Note not found" }, { status: 404 })
    }

    return NextResponse.json({ message: "Note deleted successfully" })
  } catch (error) {
    console.error("Delete note error:", error)
    if (error.name === "JsonWebTokenError") {
      return NextResponse.json({ message: "Invalid token" }, { status: 401 })
    }
    return NextResponse.json({ message: "Server error" }, { status: 500 })
  }
}
