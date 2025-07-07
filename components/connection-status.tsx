"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { CheckCircle, XCircle, RefreshCw } from "lucide-react"

export function ConnectionStatus() {
  const [status, setStatus] = useState<"checking" | "connected" | "error">("checking")
  const [error, setError] = useState<string>("")

  const checkConnection = async () => {
    setStatus("checking")
    setError("")

    try {
      const response = await fetch("/api/health")
      if (response.ok) {
        setStatus("connected")
      } else {
        const data = await response.json()
        setStatus("error")
        setError(data.message || "Connection failed")
      }
    } catch (err) {
      setStatus("error")
      setError("Failed to check connection")
    }
  }

  useEffect(() => {
    checkConnection()
  }, [])

  return (
    <Card className="w-full max-w-md">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          Database Connection
          {status === "connected" && <CheckCircle className="h-5 w-5 text-green-500" />}
          {status === "error" && <XCircle className="h-5 w-5 text-red-500" />}
          {status === "checking" && <RefreshCw className="h-5 w-5 animate-spin text-blue-500" />}
        </CardTitle>
        <CardDescription>MongoDB Atlas connection status</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center justify-between">
          <span>Status:</span>
          <Badge variant={status === "connected" ? "default" : status === "error" ? "destructive" : "secondary"}>
            {status === "connected" && "Connected"}
            {status === "error" && "Error"}
            {status === "checking" && "Checking..."}
          </Badge>
        </div>

        {error && (
          <div className="p-3 bg-red-50 border border-red-200 rounded-md">
            <p className="text-sm text-red-700">{error}</p>
          </div>
        )}

        <Button onClick={checkConnection} variant="outline" className="w-full bg-transparent">
          <RefreshCw className="h-4 w-4 mr-2" />
          Check Connection
        </Button>
      </CardContent>
    </Card>
  )
}
