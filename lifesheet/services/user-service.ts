import axios, { Axios } from "axios"
// User profile interface
export interface UserProfile {
  _id: string
  name: string
  email: string
}

// Update profile request structure
export interface UpdateProfileRequest {
  name?: string
  email?: string
}

class UserService {
  private client:Axios

  constructor(baseUrl: string = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:3001/api") {
    this.client = axios.create({
      baseURL: baseUrl,
      headers: {
        "Content-Type": "application/json",
      },
    })
    this.client.interceptors.response.use(
      response => response,
      error => {
        if (error.response?.status === 401) {
          // Could emit an event that components can listen to
          console.error("Authentication token expired or invalid")
        }
        return Promise.reject(error)
      }
    )
  }
  setAuthToken(token: string) {
    this.client.defaults.headers.common["Authorization"] = `Bearer ${token}`
  }

  

 
  // Get the current user's profile
  async getProfile(): Promise<UserProfile> {
    console.log("🔄 UserService: Fetching user profile...")

    const response = await this.client.get<UserProfile>('/auth/me')
      
     return response.data
      
  }

  // Update the current user's profile
  async updateProfile(profileData: UpdateProfileRequest): Promise<UserProfile> {
    console.log("🔄 UserService: Updating user profile...")

    const response = await this.client.put<UserProfile>('/auth/me', profileData)
    
    return response.data
  }
}

// Export a singleton instance
const userService = new UserService()
export default userService