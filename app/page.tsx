"use client"

import { useAuth } from "@/hooks/use-auth"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Loader2, AlertCircle, ExternalLink } from "lucide-react"
import Dashboard from "@/components/dashboard"

export default function Home() {
  const { user, loading, error, signInWithGoogle } = useAuth()

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    )
  }

  if (error) {
    const isUnauthorizedDomain = error.includes("not authorized for Google sign-in")
    const isConfigError = error.includes("Firebase configuration") || error.includes("environment variables")

    return (
      <div className="min-h-screen flex items-center justify-center bg-muted/30 p-4">
        <Card className="w-full max-w-lg">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl font-bold text-destructive">
              {isUnauthorizedDomain ? "Domain Authorization Required" : "Configuration Error"}
            </CardTitle>
            <CardDescription>
              {isUnauthorizedDomain ? "Firebase domain setup needed" : "Firebase setup required"}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>{isUnauthorizedDomain ? "Unauthorized Domain" : "Firebase Configuration Missing"}</AlertTitle>
              <AlertDescription className="mt-2">{error}</AlertDescription>
            </Alert>

            {isUnauthorizedDomain ? (
              <div className="text-sm text-muted-foreground space-y-3">
                <p className="font-medium">To fix this issue:</p>
                <ol className="list-decimal list-inside space-y-2 text-xs">
                  <li>
                    Go to your{" "}
                    <a
                      href="https://console.firebase.google.com"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-primary hover:underline inline-flex items-center gap-1"
                    >
                      Firebase Console <ExternalLink className="h-3 w-3" />
                    </a>
                  </li>
                  <li>
                    Navigate to <strong>Authentication → Settings → Authorized domains</strong>
                  </li>
                  <li>
                    Click <strong>"Add domain"</strong> and add:{" "}
                    <code className="bg-muted px-1 py-0.5 rounded text-xs">
                      {typeof window !== "undefined" ? window.location.hostname : "your-domain.com"}
                    </code>
                  </li>
                  <li>Save and try signing in again</li>
                </ol>
                <p className="text-xs mt-3 p-2 bg-muted rounded">
                  <strong>Note:</strong> For v0 previews, you'll need to add each preview domain. For production, add
                  your actual domain.
                </p>
              </div>
            ) : isConfigError ? (
              <div className="text-sm text-muted-foreground space-y-2">
                <p className="font-medium">Required environment variables:</p>
                <ul className="list-disc list-inside space-y-1 text-xs">
                  <li>NEXT_PUBLIC_FIREBASE_API_KEY</li>
                  <li>NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN</li>
                  <li>NEXT_PUBLIC_FIREBASE_PROJECT_ID</li>
                  <li>NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET</li>
                  <li>NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID</li>
                  <li>NEXT_PUBLIC_FIREBASE_APP_ID</li>
                </ul>
                <p className="text-xs mt-3">
                  Add these variables in your Vercel project settings or create a Firebase project at
                  console.firebase.google.com
                </p>
              </div>
            ) : null}
          </CardContent>
        </Card>
      </div>
    )
  }

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-muted/30">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl font-bold">Team Task Dashboard</CardTitle>
            <CardDescription>Sign in with Google to access your team's task management system</CardDescription>
          </CardHeader>
          <CardContent>
            <Button onClick={signInWithGoogle} className="w-full" size="lg">
              Sign in with Google
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return <Dashboard />
}
