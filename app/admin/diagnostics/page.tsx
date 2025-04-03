"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { CheckCircle2, XCircle, RefreshCw } from "lucide-react"

export default function DiagnosticsPage() {
  const [diagnostics, setDiagnostics] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const runDiagnostics = async () => {
    setLoading(true)
    setError(null)

    try {
      const response = await fetch("/api/diagnostics")
      if (!response.ok) {
        throw new Error(`HTTP error ${response.status}`)
      }

      const data = await response.json()
      setDiagnostics(data)
    } catch (err) {
      setError((err as Error).message)
      console.error("Error running diagnostics:", err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    runDiagnostics()
  }, [])

  return (
    <div className="flex-1 space-y-4 p-8 pt-6">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold tracking-tight">System Diagnostics</h2>
        <Button onClick={runDiagnostics} disabled={loading}>
          <RefreshCw className={`mr-2 h-4 w-4 ${loading ? "animate-spin" : ""}`} />
          {loading ? "Running..." : "Run Diagnostics"}
        </Button>
      </div>

      {error && (
        <Alert variant="destructive">
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Database Connection</CardTitle>
          <CardDescription>Status of your PostgreSQL database connection</CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex items-center space-x-2">
              <div className="h-4 w-4 rounded-full border-2 border-primary border-t-transparent animate-spin"></div>
              <p>Testing database connection...</p>
            </div>
          ) : diagnostics?.databaseConnection ? (
            <div>
              <div className="flex items-center space-x-2 mb-4">
                {diagnostics.databaseConnection.success ? (
                  <>
                    <CheckCircle2 className="h-5 w-5 text-green-500" />
                    <span className="font-medium text-green-500">Connection Successful</span>
                  </>
                ) : (
                  <>
                    <XCircle className="h-5 w-5 text-red-500" />
                    <span className="font-medium text-red-500">Connection Failed</span>
                  </>
                )}
              </div>

              {diagnostics.databaseConnection.success ? (
                <div className="space-y-2">
                  <p>
                    <strong>Database Time:</strong> {diagnostics.databaseConnection.timestamp}
                  </p>
                  <p>
                    <strong>Message:</strong> {diagnostics.databaseConnection.message}
                  </p>
                </div>
              ) : (
                <div className="space-y-2">
                  <p>
                    <strong>Error:</strong> {diagnostics.databaseConnection.error}
                  </p>
                  <p className="text-sm text-muted-foreground">{diagnostics.databaseConnection.originalError}</p>
                </div>
              )}

              <div className="mt-4 p-3 bg-muted rounded-md">
                <p className="text-sm font-medium">Database URL Format:</p>
                <code className="text-xs">{diagnostics.databaseUrlFormat}</code>
              </div>

              <div className="mt-4">
                <h4 className="font-medium mb-2">Common Solutions:</h4>
                <ul className="list-disc pl-5 space-y-1 text-sm">
                  <li>Verify your DATABASE_URL environment variable is correctly set</li>
                  <li>Check that your database server is running and accessible</li>
                  <li>Ensure your IP is allowed in the database firewall settings</li>
                  <li>For SSL issues, make sure SSL is properly configured</li>
                  <li>Try initializing the database from the admin dashboard</li>
                </ul>
              </div>
            </div>
          ) : (
            <p>No diagnostic information available</p>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Environment Information</CardTitle>
        </CardHeader>
        <CardContent>
          <p>
            <strong>Node Environment:</strong> {diagnostics?.environment || "Unknown"}
          </p>
        </CardContent>
      </Card>
    </div>
  )
}

