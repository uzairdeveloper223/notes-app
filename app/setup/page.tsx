import { ConnectionStatus } from "@/components/connection-status"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { CheckCircle, Database, Key, Globe } from "lucide-react"

export default function SetupPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-8">
      <div className="container mx-auto max-w-4xl">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">MongoDB Atlas Setup</h1>
          <p className="text-xl text-gray-600">Let's verify your database connection</p>
        </div>

        <div className="grid md:grid-cols-2 gap-8 mb-8">
          <ConnectionStatus />

          <Card>
            <CardHeader>
              <CardTitle>Setup Checklist</CardTitle>
              <CardDescription>Make sure you've completed these steps</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-3">
                <Database className="h-5 w-5 text-blue-500" />
                <span>Created MongoDB Atlas cluster</span>
                <CheckCircle className="h-4 w-4 text-green-500 ml-auto" />
              </div>
              <div className="flex items-center gap-3">
                <Key className="h-5 w-5 text-blue-500" />
                <span>Created database user</span>
                <CheckCircle className="h-4 w-4 text-green-500 ml-auto" />
              </div>
              <div className="flex items-center gap-3">
                <Globe className="h-5 w-5 text-blue-500" />
                <span>Configured network access</span>
                <CheckCircle className="h-4 w-4 text-green-500 ml-auto" />
              </div>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Environment Configuration</CardTitle>
            <CardDescription>Your .env.local file should contain:</CardDescription>
          </CardHeader>
          <CardContent>
            <pre className="bg-gray-100 p-4 rounded-md text-sm overflow-x-auto">
              {`MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/notes-app
JWT_SECRET=your-super-secret-jwt-key
NODE_ENV=development`}
            </pre>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
