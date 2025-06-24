import axios, { Axios } from "axios"

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
  private client:Axios

  constructor(baseUrl: string = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:3001/api") {
    this.client = axios.create({
      baseURL: baseUrl,
      headers: {
        "Content-Type": "application/json",
      },
    });

    // Add response interceptor to handle 401 errors
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

  
  // Get user's CV (single CV per user)
  async getUserCV(): Promise<CV | null> {
    console.log("🔄 CVsService: Fetching user CV...")
    const response = await this.client.get<CV>('/cvs/user')
    return response.data;
    
  }
  // Method to set the authentication token from your React component
  setAuthToken(token: string) {
    this.client.defaults.headers.common["Authorization"] = `Bearer ${token}`
  }

  // Create or update user's CV
  async createOrUpdateCV(cvData: CreateOrUpdateCVRequest): Promise<CV> {
    const response = await this.client.put<CV>('/cvs', cvData)
    if (!response.data) {
      throw new Error("Failed to create or update CV")
    }
    return response.data;
   
  }

  // Delete user's CV TODO: verify this is not missing an id
  async deleteCV(): Promise<void> {
    console.log("🔄 CVsService: Deleting user CV...")
    await this.client.delete('/cvs')
    
  }
  
  // Tailor CV to job description
  async tailorCV(jobDescription: string): Promise<CV> {
    console.log("🔄 CVsService: Tailoring CV to job description...")
    const response = await this.client.post<CV>('/cvs/tailor', { jobDescription })
    if (!response.data) {
      throw new Error("Failed to tailor CV")
    }
    return response.data;
   
  }

  // Upload CV file
  async uploadCVFile(file: File): Promise<{ fileUrl: string; fileName: string }> {
    throw new Error("Method not implemented.");
  }
}

// Export a singleton instance
export const cvsService = new CVsService()
export default cvsService
