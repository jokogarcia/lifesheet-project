import axios, { Axios } from 'axios';
import { constants } from '../constants';
import { setupApiErrorInterceptor } from './api-error-interceptor';

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
  sectionTitles: { [key: string]: string };
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

// Helper function to create axios client
function createAxiosClient(baseUrl: string = constants.API_URL): Axios {
  const client = axios.create({
    baseURL: baseUrl,
    headers: {
      'Content-Type': 'application/json',
    },
  });

  setupApiErrorInterceptor(client);
  return client;
}

// Helper function to set auth token on client
function setAuthToken(client: Axios, token: string): void {
  client.defaults.headers.common['Authorization'] = `Bearer ${token}`;
}

// Helper method to transform Sets to Arrays for JSON serialization
function transformSetsToArrays(data: any): any {
  console.log('Transforming data:');
  if (data === null || data === undefined) {
    return data;
  }

  if (data instanceof Set) {
    return Array.from(data);
  }

  if (Array.isArray(data)) {
    return data.map(item => transformSetsToArrays(item));
  }

  if (typeof data === 'object') {
    const result: Record<string, any> = {};
    for (const key in data) {
      if (Object.prototype.hasOwnProperty.call(data, key)) {
        result[key] = transformSetsToArrays(data[key]);
      }
    }
    return result;
  }

  return data;
}

async function wait(milliseconds: number) {
  return new Promise(resolve => setTimeout(resolve, milliseconds));
}

// Get user's CV (single CV per user)
export async function getUserCV(authToken: string, cvId?: string, baseUrl?: string): Promise<CV | null> {
  console.log('🔄 CVsService: Fetching user CV ', cvId || '');
  const client = createAxiosClient(baseUrl);
  setAuthToken(client, authToken);

  const response = await client.get<CV>(`/user/me/cv${cvId ? `/${cvId}` : ''}`);
  return response.data;
}

export async function getUsersTailoredCvs(authToken: string, baseUrl?: string): Promise<CVListItem[]> {
  const client = createAxiosClient(baseUrl);
  setAuthToken(client, authToken);

  const response = await client.get<CVListItem[]>('/user/me/cv/tailored-list');
  return response.data;
}

// Create or update user's CV
export async function createOrUpdateCV(
  authToken: string,
  cvId: string,
  cvData: CreateOrUpdateCVRequest,
  baseUrl?: string
): Promise<CV> {
  const client = createAxiosClient(baseUrl);
  setAuthToken(client, authToken);

  const response = await client.put<CV>('/user/me/cv/' + cvId, cvData);
  if (!response.data) {
    throw new Error('Failed to create or update CV');
  }
  return response.data;
}

// Delete user's CV TODO: verify this is not missing an id
export async function deleteCV(authToken: string, baseUrl?: string): Promise<void> {
  console.log('🔄 CVsService: Deleting user CV...');
  const client = createAxiosClient(baseUrl);
  setAuthToken(client, authToken);

  await client.delete('/user/me/cv');
}

// Tailor CV to job description
export async function tailorCV(
  authToken: string,
  jobDescription: string,
  companyName: string,
  includeCoverLetter: boolean,
  useAiTailoring: boolean,
  translateTo: string,
  baseUrl?: string
): Promise<{ cvId: string }> {
  const client = createAxiosClient(baseUrl);
  setAuthToken(client, authToken);

  const { bullId } = await startTailoringOperation(
    client,
    jobDescription,
    companyName,
    includeCoverLetter,
    useAiTailoring,
    translateTo
  );
  do {
    await wait(1000);
    const status = await checkTailoringStatus(client, bullId);
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

async function startTailoringOperation(
  client: Axios,
  jobDescription: string,
  companyName: string,
  includeCoverLetter: boolean,
  useAiTailoring: boolean,
  translateTo: string
): Promise<{ bullId: string }> {
  console.log('🔄 CVsService: Tailoring CV to job description...');
  const response = await client.post<{ bullId: string }>('/user/me/cv/tailor', {
    jobDescription,
    companyName,
    includeCoverLetter,
    useAiTailoring,
    translateTo
  });
  if (!response.data) {
    throw new Error('Failed to tailor CV');
  }
  return response.data;
}

async function checkTailoringStatus(client: Axios, bullId: string): Promise<{
  state: string;
  progress: number;
  result?: { tailoredCVId: string; consumptionId: string };
}> {
  console.log('🔄 CVsService: Checking tailoring status...');
  const response = await client.get<{
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
export async function uploadCVFile(authToken: string, file: File, baseUrl?: string): Promise<{ fileUrl: string; fileName: string }> {
  // TODO: Implement file upload functionality
  console.log('File to upload:', file.name);
  throw new Error('Method not implemented.');
}

// Get CV PDF
export async function getCVPDF(
  authToken: string,
  cvId: string,
  options?: CVToPDFOptions,
  baseUrl?: string
): Promise<Blob> {
  const client = createAxiosClient(baseUrl);
  setAuthToken(client, authToken);

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
  const url = new URL(`/user/me/cv/${cvId}/pdf`, baseUrl || constants.API_URL);
  if (pictureId) url.searchParams.append('pictureId', pictureId);
  if (template) url.searchParams.append('template', template);
  if (primaryColorOverride) url.searchParams.append('primaryColor', primaryColorOverride);
  if (secondaryColorOverride) url.searchParams.append('secondaryColor', secondaryColorOverride);
  if (textColorOverride) url.searchParams.append('textColor', textColorOverride);
  if (text2ColorOverride) url.searchParams.append('text2Color', text2ColorOverride);
  if (backgroundColorOverride)
    url.searchParams.append('backgroundColor', backgroundColorOverride);

  const response = await client.get(url.toString(), {
    responseType: 'blob', // Important for binary data
  });

  if (!response.data) {
    throw new Error('Failed to fetch CV PDF');
  }
  return response.data;
}

export async function getPDFv2(
  authToken: string,
  html: string,
  pictureId?: string,
  docTitle?: string,
  baseUrl?: string
): Promise<Blob> {
  const client = createAxiosClient(baseUrl);
  setAuthToken(client, authToken);

  const response = await client.post(
    '/utils/generate-pdf',
    { html, pictureId, docTitle },
    { responseType: 'blob' }
  );
  if (!response.data) {
    throw new Error('Failed to generate PDF');
  }
  return response.data;
}

export function isCVOnboarded(cv: CV | null): boolean {
  if (!cv) return false;
  return cv.created_at !== cv.updated_at;
}
