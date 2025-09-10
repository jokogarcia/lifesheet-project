import axios, { Axios } from 'axios';
import { constants } from '../constants';

// Types for our CV data
export interface PersonalInfo {
  fullName: string;
  profilePictureUrl?: string;
  title?: string;
  email: string;
  phone?: string;
  dateOfBirth?: string;
  location?: string;
  linkedIn?: string;
  website?: string;
  github?: string;
  summary?: string;
}

export interface WorkExperience {
  id: string;
  company: string;
  position: string;
  startDate: string;
  endDate: string;
  current: boolean;
  description: string;
  location?: string;
  achievements?: string[];
}

export interface Education {
  id: string;
  institution: string;
  degree: string;
  field: string;
  startDate: string;
  endDate: string;
  gpa: string;
  location: string;
}

export interface Skill {
  id: string;
  name: string;
  level: string;
}

export interface LanguageSkill {
  id: string;
  language: string;
  level: string;
}
export interface CV {
  _id: string;

  personal_info: PersonalInfo;
  work_experience: WorkExperience[];
  education: Education[];
  skills: Skill[];
  language_skills: LanguageSkill[];
  created_at: string;
  updated_at: string;
  user_id: string;
  tailored?: TailoredData;
}
export interface CVListItem {
  _id: string;
  updatedAt: string;
  hasCoverLetter: boolean;
  companyName: string;
}

export interface CreateOrUpdateCVRequest {
  personal_info: PersonalInfo;
  work_experience: WorkExperience[];
  education: Education[];
  skills: Skill[];
  language_skills?: LanguageSkill[];
  tailored?: TailoredData;
}
export const defaultSectionOrder = ['cover-letter', 'personalInfo', 'summary', 'skills', 'workExperience', 'education', 'languages'];
export const defaultLeftColumnSections = ['personalInfo', 'skills', 'languages'];
export const defaultPdfOptions: CVToPDFOptions = {
  includeEmail: true,
  includePhone: true,
  includeAddress: true,
  primaryColorOverride: '',
  secondaryColorOverride: '',
  textColorOverride: '',
  text2ColorOverride: '',
  backgroundColorOverride: '',
  template: 'single-column-1',
};
// No need for mock data anymore, we're using real API calls
export interface CVToPDFOptions {
  pictureId?: string;
  template?: string;
  primaryColorOverride?: string;
  secondaryColorOverride?: string;
  textColorOverride?: string;
  text2ColorOverride?: string;
  backgroundColorOverride?: string;
  includeEmail?: boolean;
  includeAddress?: boolean;
  includeDateOfBirth?: boolean;
  includePhone?: boolean;
}
class CVsService {
  private client: Axios;

  constructor(baseUrl: string = constants.API_URL) {
    this.client = axios.create({
      baseURL: baseUrl,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    // Add response interceptor to handle 401 errors
    this.client.interceptors.response.use(
      response => response,
      error => {
        if (error.response?.status === 401) {
          // Could emit an event that components can listen to
          console.error('Authentication token expired or invalid');
        }
        return Promise.reject(error);
      }
    );
  }

  // Get user's CV (single CV per user)
  async getUserCV(cvId?: string): Promise<CV | null> {
    console.log('🔄 CVsService: Fetching user CV ', cvId || '');
    const response = await this.client.get<CV>(`/user/me/cv${cvId ? `/${cvId}` : ''}`);
    return response.data;
  }

  async getUsersTailoredCvs(): Promise<CVListItem[]> {
    const response = await this.client.get<CVListItem[]>('/user/me/cv/tailored-list');
    return response.data;
  }
  // Method to set the authentication token from your React component
  setAuthToken(token: string) {
    this.client.defaults.headers.common['Authorization'] = `Bearer ${token}`;
  }

  // Create or update user's CV
  async createOrUpdateCV(cvId: string, cvData: CreateOrUpdateCVRequest): Promise<CV> {
    const response = await this.client.put<CV>('/user/me/cv/' + cvId, cvData);
    if (!response.data) {
      throw new Error('Failed to create or update CV');
    }
    return response.data;
  }


  // Delete user's CV TODO: verify this is not missing an id
  async deleteCV(): Promise<void> {
    console.log('🔄 CVsService: Deleting user CV...');
    await this.client.delete('/user/me/cv');
  }

  // Helper method to transform Sets to Arrays for JSON serialization
  private static transformSetsToArrays(data: any): any {
    console.log('Transforming data:');
    if (data === null || data === undefined) {
      return data;
    }

    if (data instanceof Set) {
      return Array.from(data);
    }

    if (Array.isArray(data)) {
      return data.map(item => this.transformSetsToArrays(item));
    }

    if (typeof data === 'object') {
      const result: Record<string, any> = {};
      for (const key in data) {
        if (Object.prototype.hasOwnProperty.call(data, key)) {
          result[key] = this.transformSetsToArrays(data[key]);
        }
      }
      return result;
    }

    return data;
  }

  // Tailor CV to job description
  async tailorCV(
    jobDescription: string,
    companyName: string,
    includeCoverLetter: boolean,
    useAiTailoring: boolean
  ): Promise<{ cvId: string }> {
    const { bullId } = await this.startTailoringOperation(
      jobDescription,
      companyName,
      includeCoverLetter,
      useAiTailoring
    );
    do {
      await wait(1000);
      const status = await this.checkTailoringStatus(bullId);
      console.log('🔄 CVsService: Tailoring state:', status.state, status.progress);
      if (status.state === 'completed' && status.result) {
        return {
          cvId: status.result.tailoredCVId,
        };
      }
      if (status.state === 'failed') {
        throw new Error('Failed to tailor CV');
      }
    } while (true);
  }
  private async startTailoringOperation(
    jobDescription: string,
    companyName: string,
    includeCoverLetter: boolean,
    useAiTailoring: boolean
  ): Promise<{ bullId: string }> {
    console.log('🔄 CVsService: Tailoring CV to job description...');
    const response = await this.client.post<{ bullId: string }>('/user/me/cv/tailor', {
      jobDescription,
      companyName,
      includeCoverLetter,
      useAiTailoring,
    });
    if (!response.data) {
      throw new Error('Failed to tailor CV');
    }
    return response.data;
  }
  private async checkTailoringStatus(bullId: string): Promise<{
    state: string;
    progress: number;
    result?: { tailoredCVId: string; consumptionId: string };
  }> {
    console.log('🔄 CVsService: Checking tailoring status...');
    const response = await this.client.get<{
      state: string;
      progress: number;
      result?: { tailoredCVId: string; consumptionId: string };
    }>('/user/me/cv/tailor/progress/' + bullId);
    if (!response.data) {
      throw new Error('Failed to check tailoring status');
    }
    return response.data;
  }

  // Upload CV file
  async uploadCVFile(file: File): Promise<{ fileUrl: string; fileName: string }> {
    // TODO: Implement file upload functionality
    console.log('File to upload:', file.name);
    throw new Error('Method not implemented.');
  }

  // Get CV PDF
  async getCVPDF(cvId: string, options?: CVToPDFOptions): Promise<Blob> {
    const {
      pictureId,
      template,
      primaryColorOverride,
      secondaryColorOverride,
      textColorOverride,
      text2ColorOverride,
      backgroundColorOverride,
    } = options || {};

    console.log('🔄 CVsService: Fetching CV PDF...');
    const url = new URL(`/user/me/cv/${cvId}/pdf`);
    if (pictureId) url.searchParams.append('pictureId', pictureId);
    if (template) url.searchParams.append('template', template);
    if (primaryColorOverride) url.searchParams.append('primaryColor', primaryColorOverride);
    if (secondaryColorOverride) url.searchParams.append('secondaryColor', secondaryColorOverride);
    if (textColorOverride) url.searchParams.append('textColor', textColorOverride);
    if (text2ColorOverride) url.searchParams.append('text2Color', text2ColorOverride);
    if (backgroundColorOverride)
      url.searchParams.append('backgroundColor', backgroundColorOverride);

    const response = await this.client.get(url.toString(), {
      responseType: 'blob', // Important for binary data
    });

    if (!response.data) {
      throw new Error('Failed to fetch CV PDF');
    }
    return response.data;
  }
  async getPDFv2(html: string, pictureId?: string, docTitle?: string) {
    const response = await this.client.post(
      '/utils/generate-pdf',
      { html, pictureId, docTitle },
      { responseType: 'blob' }
    );
    if (!response.data) {
      throw new Error('Failed to generate PDF');
    }
    return response.data;
  }
}

// Export a singleton instance
export const cvsService = new CVsService();
export default cvsService;

export interface JobDescription {
  _id: string;
  userId: string;
  content: string;
  companyName: string;
  deletedAt: Date | null;
  createdAt: string;
  updatedAt: string;
  __v: number;
}

export interface TailoredData {
  jobDescription_id: JobDescription | string;
  coverLetter: string;
  tailoredDate: string;
  updatedByUser: boolean;
  sectionOrder?: string[];
  hiddenSections?: string[];
  leftColumnSections?: string[];
  coverLetterOnTop?: boolean;
  pdfOptions?: CVToPDFOptions;
}
async function wait(miliseconds: number) {
  return new Promise(resolve => setTimeout(resolve, miliseconds));
}

export function isCVOnboarded(cv: CV | null): boolean {
  if (!cv) return false;
  return cv.created_at !== cv.updated_at;
}
