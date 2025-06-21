export interface User {
  id: string
  email: string
  name?: string
}

export interface LoginRequest {
  email: string
  password: string
}

export interface RegisterRequest {
  email: string
  password: string
  name?: string
}

class AuthService {
  private baseUrl: string
  private currentUser: User | null = null

  constructor(baseUrl: string = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:3001/api") {
    this.baseUrl = baseUrl
  }

  // Simulate API delay
  private async delay(ms = 500): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms))
  }

  // Login user
  async login(credentials: LoginRequest): Promise<{ user: User; token: string }> {
    console.log("🔄 AuthService: Logging in user...", credentials.email)

    await this.delay()

    // In real implementation:
    // const response = await fetch(`${this.baseUrl}/auth/login`, {
    //   method: 'POST',
    //   headers: { 'Content-Type': 'application/json' },
    //   body: JSON.stringify(credentials),
    // })
    //
    // if (!response.ok) {
    //   throw new Error('Invalid credentials')
    // }
    //
    // const data = await response.json()
    // return data

    // Mock validation
    if (credentials.email === "demo@example.com" && credentials.password === "password") {
      const mockResponse = {
        user: {
          id: "user-123",
          email: credentials.email,
          name: "Demo User",
        },
        token: "mock-jwt-token-" + Date.now(),
      }

      this.currentUser = mockResponse.user
      localStorage.setItem("auth_token", mockResponse.token)
      localStorage.setItem("user", JSON.stringify(mockResponse.user))

      console.log("✅ AuthService: Login successful", mockResponse.user)
      return mockResponse
    }

    throw new Error("Invalid credentials. Use demo@example.com / password")
  }

  // Register user
  async register(userData: RegisterRequest): Promise<{ user: User; token: string }> {
    console.log("🔄 AuthService: Registering user...", userData.email)

    await this.delay()

    // Mock registration (always succeeds)
    const mockResponse = {
      user: {
        id: "user-" + Date.now(),
        email: userData.email,
        name: userData.name || "New User",
      },
      token: "mock-jwt-token-" + Date.now(),
    }

    this.currentUser = mockResponse.user
    localStorage.setItem("auth_token", mockResponse.token)
    localStorage.setItem("user", JSON.stringify(mockResponse.user))

    console.log("✅ AuthService: Registration successful", mockResponse.user)
    return mockResponse
  }

  // Logout user
  async logout(): Promise<void> {
    console.log("🔄 AuthService: Logging out user...")

    await this.delay(200)

    this.currentUser = null
    localStorage.removeItem("auth_token")
    localStorage.removeItem("user")

    console.log("✅ AuthService: Logout successful")
  }

  // Get current user
  getCurrentUser(): User | null {
    if (this.currentUser) {
      return this.currentUser
    }

    // Check if we're in the browser
    if (typeof window === "undefined") {
      return null
    }

    // Try to get user from localStorage
    try {
      const storedUser = localStorage.getItem("user")
      if (storedUser) {
        this.currentUser = JSON.parse(storedUser)
        return this.currentUser
      }
    } catch (error) {
      console.error("Error parsing stored user:", error)
      localStorage.removeItem("user")
    }

    return null
  }

  // Get auth token
  getToken(): string | null {
    if (typeof window === "undefined") {
      return null
    }
    return localStorage.getItem("auth_token")
  }

  // Check if user is authenticated
  isAuthenticated(): boolean {
    return this.getCurrentUser() !== null && this.getToken() !== null
  }
}

// Export a singleton instance
export const authService = new AuthService()
export default authService
