import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { BookOpen, Search, Tag, Shield } from "lucide-react"

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="container mx-auto px-4 py-16">
        <div className="text-center mb-16">
          <h1 className="text-5xl font-bold text-gray-900 mb-6">Personal Notes App</h1>
          <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
            Organize your thoughts, ideas, and important information with our powerful note-taking app. Tag, search, and
            manage your notes effortlessly.
          </p>
          <div className="flex gap-4 justify-center">
            <Link href="/auth/login">
              <Button size="lg" className="px-8">
                Get Started
              </Button>
            </Link>
            <Link href="/auth/signup">
              <Button variant="outline" size="lg" className="px-8 bg-transparent">
                Sign Up
              </Button>
            </Link>
          </div>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
          <Card className="text-center">
            <CardHeader>
              <BookOpen className="h-12 w-12 mx-auto text-blue-600 mb-4" />
              <CardTitle>Rich Notes</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription>Create and edit notes with a clean, intuitive interface</CardDescription>
            </CardContent>
          </Card>

          <Card className="text-center">
            <CardHeader>
              <Tag className="h-12 w-12 mx-auto text-green-600 mb-4" />
              <CardTitle>Smart Tags</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription>Organize notes with custom tags for easy categorization</CardDescription>
            </CardContent>
          </Card>

          <Card className="text-center">
            <CardHeader>
              <Search className="h-12 w-12 mx-auto text-purple-600 mb-4" />
              <CardTitle>Powerful Search</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription>Find any note instantly with keyword and tag-based search</CardDescription>
            </CardContent>
          </Card>

          <Card className="text-center">
            <CardHeader>
              <Shield className="h-12 w-12 mx-auto text-red-600 mb-4" />
              <CardTitle>Secure</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription>Your notes are protected with JWT authentication</CardDescription>
            </CardContent>
          </Card>
        </div>

        <div className="text-center">
          <h2 className="text-3xl font-bold text-gray-900 mb-8">Ready to get organized?</h2>
          <Link href="/auth/signup">
            <Button size="lg" className="px-12">
              Start Taking Notes
            </Button>
          </Link>
        </div>
      </div>
    </div>
  )
}
