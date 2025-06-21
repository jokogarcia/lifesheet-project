"use client"

import { useState, useEffect } from "react"
import { AuthForm } from "@/components/auth/auth-form"
import { CVMainDashboard } from "@/components/cv-main-dashboard"
import authService, { type User } from "@/services/auth-service"
import cvsService from "@/services/cvs-service"
import { Auth0Provider } from "@auth0/auth0-react"

type AppState = "loading" | "auth" | "dashboard"
export default function Page() {
  <Auth0Provider
    domain="dev-u01x2xo5hp3w05n4.us.auth0.com"
    clientId="BV8xrU1HMUZyorqLuZb1KO79uh7iJlbd"
    authorizationParams={{
      redirect_uri: window.location.origin
    }}
  ><PageContent></PageContent></Auth0Provider>
}
function PageContent() {
  const [appState, setAppState] = useState<AppState>("loading")
  const [user, setUser] = useState<User | null>(null)

  useEffect(() => {
    // Check if user is already logged in
    const currentUser = authService.getCurrentUser()
    const token = authService.getToken()

    console.log("🔍 Checking auth state:", { currentUser, hasToken: !!token })

    if (currentUser && token) {
      setUser(currentUser)
      cvsService.setAuthToken(token)
      setAppState("dashboard")
      console.log("✅ User authenticated, showing dashboard")
    } else {
      setAppState("auth")
      console.log("❌ No authentication, showing login")
    }
  }, [])

  const handleAuthSuccess = () => {
    console.log("🎉 Auth success callback triggered")
    const currentUser = authService.getCurrentUser()
    const token = authService.getToken()

    console.log("🔍 Auth success - user:", currentUser, "token:", !!token)

    if (currentUser && token) {
      setUser(currentUser)
      cvsService.setAuthToken(token)
      setAppState("dashboard")
      console.log("✅ Redirecting to dashboard")
    } else {
      console.error("❌ Auth success but no user/token found")
      setAppState("auth")
    }
  }

  const handleSignOut = async () => {
    console.log("🚪 Signing out...")
    await authService.logout()
    setUser(null)
    setAppState("auth")
  }

  console.log("🎯 Current app state:", appState, "User:", user?.email)

  if (appState === "loading") {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto"></div>
          <p className="mt-2">Loading...</p>
        </div>
      </div>
    )
  }

  if (appState === "auth") {
    return <AuthForm onAuthSuccess={handleAuthSuccess} />
  }

  if (appState === "dashboard" && user) {
    return <CVMainDashboard user={user} onSignOut={handleSignOut} />
  }

  // Fallback - should not reach here
  console.error("🚨 Unexpected state:", { appState, user })
  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <h2 className="text-xl font-bold mb-2">Something went wrong</h2>
        <p className="text-muted-foreground mb-4">Please refresh the page</p>
        <button
          onClick={() => window.location.reload()}
          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
        >
          Refresh Page
        </button>
      </div>
    </div>
  )
}
