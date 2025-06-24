"use client"

import { useState, useEffect, use } from "react"
import { CVMainDashboard } from "@/components/cv-main-dashboard"
import { Welcome } from "@/components/welcome"
import Auth0ProviderWrapper from "./auth-provider-wrapper"
import userService,{type UserProfile} from "@/services/user-service"
import cvsService from "@/services/cvs-service"
import { useAuth0 } from "@auth0/auth0-react"


type AppState = "loading" | "dashboard" | "welcome"
export default function Page() {
  return (
    <Auth0ProviderWrapper>
      <PageContent />
    </Auth0ProviderWrapper>
  )
}
function PageContent() {
  const [appState, setAppState] = useState<AppState>("loading")
  const [user, setUser] = useState<UserProfile | undefined>(undefined)
  const { isAuthenticated, isLoading, logout, loginWithRedirect, getAccessTokenSilently } = useAuth0();

useEffect(() => {
  const setupAuth = async () => {
    try {
      console.log("Setting Token for services...", isAuthenticated)
      const token = await getAccessTokenSilently();
      cvsService.setAuthToken(token);
      userService.setAuthToken(token);
      // Now you can make authenticated API calls
    } catch (error) {
      console.error("Error getting access token:", error);
    }
  };
  
  setupAuth();
}, []);

  useEffect(() => {
    if(isLoading) {
      setAppState("loading")
      console.log("🔄 Loading authentication state...")
      return;
    }
    if (isAuthenticated) {
      
      setAppState("dashboard")
      console.log("✅ User authenticated, showing dashboard")
      // Fetch user profile and CV data
      userService.getProfile()
        .then(user => {
          console.log("✅ User profile fetched:", user)
          setUser(user)
        })
        .catch(error => {
          console.error("❌ Error fetching user profile:", error)
          setAppState("welcome") // Fallback to welcome if profile fetch fails
        })
    } else {
      setAppState("welcome")
      console.log("❌ No authentication, showing welcome page")
    }
  }, [isAuthenticated, isLoading])



  const handleSignOut = async () => {
    console.log("🚪 Signing out...")
    await logout({ logoutParams: { returnTo: window.location.origin } })
  }
  
  const handleStartLogin = async () => {
    await loginWithRedirect();
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

  if (appState === "welcome") {
    return <Welcome onLogin={handleStartLogin} />
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
