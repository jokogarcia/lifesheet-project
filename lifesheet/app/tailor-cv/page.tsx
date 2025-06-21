"use client"

import { TailorCV } from "@/components/tailor-cv"
import { useEffect, useState } from "react"
import authService from "@/services/auth-service"
import { useRouter } from "next/navigation"

export default function TailorCVPage() {
  const [user, setUser] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)
  const router = useRouter()
  
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const currentUser = await authService.getCurrentUser()
        if (currentUser) {
          setUser(currentUser)
        } else {
          router.replace("/")
        }
      } catch (error) {
        console.error("Auth error:", error)
        router.replace("/")
      } finally {
        setIsLoading(false)
      }
    }
    
    checkAuth()
  }, [router])

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto"></div>
          <p className="mt-2">Loading...</p>
        </div>
      </div>
    )
  }

  return user ? <TailorCV user={user} /> : null
}
