// Types for our CV data
export interface PersonalInfo {
  fullName: string
  email: string
  phone: string
  location: string
  linkedIn: string
  website: string
  summary: string
}

export interface WorkExperience {
  id: string
  company: string
  position: string
  startDate: string
  endDate: string
  current: boolean
  description: string
}

export interface Education {
  id: string
  institution: string
  degree: string
  field: string
  startDate: string
  endDate: string
  gpa: string
}

export interface Skill {
  id: string
  name: string
  level: string
}

export interface CV {
  id: string
  personal_info: PersonalInfo
  work_experience: WorkExperience[]
  education: Education[]
  skills: Skill[]
  created_at: string
  updated_at: string
  user_id: string
}

export interface CreateOrUpdateCVRequest {
  personal_info: PersonalInfo
  work_experience: WorkExperience[]
  education: Education[]
  skills: Skill[]
}

// No need for mock data anymore, we're using real API calls

class CVsService {
  private baseUrl: string
  private authToken: string | null = null

  constructor(baseUrl: string = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:3001/api") {
    this.baseUrl = baseUrl
  }

  // Set authentication token
  setAuthToken(token: string) {
    this.authToken = token
  }

  // Get headers with authentication
  private getHeaders(): HeadersInit {
    const headers: HeadersInit = {
      "Content-Type": "application/json",
    }

    if (this.authToken) {
      headers["Authorization"] = `Bearer ${this.authToken}`
    }

    return headers
  }

  // No need for simulated delays anymore

  // Get user's CV (single CV per user)
  async getUserCV(): Promise<CV | null> {
    console.log("🔄 CVsService: Fetching user CV...")

    try {
      const response = await fetch(`${this.baseUrl}/cvs/user`, {
        method: 'GET',
        headers: this.getHeaders(),
      })

      if (response.status === 404) {
        console.log("✅ CVsService: No CV found for user")
        return null // User has no CV yet
      }

      if (!response.ok) {
        throw new Error(`Failed to fetch CV: ${response.statusText}`)
      }

      const data = await response.json()
      console.log("✅ CVsService: CV fetched successfully", data.cv)
      return data.cv
    } catch (error) {
      console.error("❌ CVsService: Error fetching CV", error)
      throw error
    }
  }

  // Create or update user's CV
  async createOrUpdateCV(cvData: CreateOrUpdateCVRequest): Promise<CV> {
    console.log("🔄 CVsService: Creating/updating user CV...", cvData)

    try {
      const response = await fetch(`${this.baseUrl}/cvs`, {
        method: 'PUT', // Use PUT for create or update
        headers: this.getHeaders(),
        body: JSON.stringify(cvData),
      })

      if (!response.ok) {
        throw new Error(`Failed to save CV: ${response.statusText}`)
      }

      const data = await response.json()
      console.log("✅ CVsService: CV saved successfully", data.cv)
      return data.cv
    } catch (error) {
      console.error("❌ CVsService: Error saving CV", error)
      throw error
    }
  }

  // Delete user's CV
  async deleteCV(): Promise<void> {
    console.log("🔄 CVsService: Deleting user CV...")

    try {
      const response = await fetch(`${this.baseUrl}/cvs`, {
        method: 'DELETE',
        headers: this.getHeaders(),
      })

      if (!response.ok) {
        throw new Error(`Failed to delete CV: ${response.statusText}`)
      }

      console.log("✅ CVsService: CV deleted successfully")
    } catch (error) {
      console.error("❌ CVsService: Error deleting CV", error)
      throw error
    }
  }
  
  // Tailor CV to job description
  async tailorCV(jobDescription: string): Promise<CV> {
    console.log("🔄 CVsService: Tailoring CV to job description...")
    
    try {
      const response = await fetch(`${this.baseUrl}/cvs/tailor`, {
        method: 'POST',
        headers: this.getHeaders(),
        body: JSON.stringify({ jobDescription }),
      })
      
      if (!response.ok) {
        throw new Error(`Failed to tailor CV: ${response.statusText}`)
      }
      
      const data = await response.json()
      console.log("✅ CVsService: CV tailored successfully", data.tailoredCV)
      return data.tailoredCV
    } catch (error) {
      console.error("❌ CVsService: Error tailoring CV", error)
      throw error
    }
  }

  // Upload CV file
  async uploadCVFile(file: File): Promise<{ fileUrl: string; fileName: string }> {
    console.log("🔄 CVsService: Uploading CV file...", file.name)

    try {
      const formData = new FormData()
      formData.append('file', file)

      const response = await fetch(`${this.baseUrl}/cvs/upload`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.authToken}`
          // Note: Don't set Content-Type here as the browser will set it with the boundary for FormData
        },
        body: formData,
      })

      if (!response.ok) {
        throw new Error(`Failed to upload file: ${response.statusText}`)
      }

      const data = await response.json()
      console.log("✅ CVsService: File uploaded successfully", data)
      return data
    } catch (error) {
      console.error("❌ CVsService: Error uploading file", error)
      throw error
    }
  }
}

// Export a singleton instance
export const cvsService = new CVsService()
export default cvsService
