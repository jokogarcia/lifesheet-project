import axios, { Axios } from 'axios';
import { constants } from '../constants';
import { setupApiErrorInterceptor } from './api-error-interceptor';
// User profile interface
export interface UserProfile {
  _id: string;
  name: string;
  email: string;
}

// Update profile request structure
export interface UpdateProfileRequest {
  name?: string;
  email?: string;
}
function getClient(token?: string): Axios {
  const client = axios.create({
    baseURL: constants.API_URL,
    headers: {
      'Content-Type': 'application/json',
    },
  });
  if (token) {
    client.defaults.headers.common['Authorization'] = `Bearer ${token}`;
  }
  setupApiErrorInterceptor(client);
  return client;
}


// Get the current user's profile
export async function getProfile(token: string): Promise<UserProfile> {
  console.log('🔄 UserService: Fetching user profile...');

  const response = await getClient(token).get<UserProfile>('/user/me');

  return response.data;
}

// Update the current user's profile
export async function updateProfile(profileData: UpdateProfileRequest, token: string): Promise<UserProfile> {
  console.log('🔄 UserService: Updating user profile...');

  const response = await getClient(token).put<UserProfile>('/user/me', profileData);

  return response.data;
}
export async function getUserPictures(token: string): Promise<string[]> {
  console.log('🔄 UserService: Fetching user pictures...');
  const response = await getClient(token).get<{ pictureIds: string[] }>('/user/me/pictures');
  return response.data.pictureIds;
}

export async function uploadPicture(file: File, token: string): Promise<string> {
  console.log('🔄 UserService: Uploading picture...');
  const formData = new FormData();
  formData.append('picture', file);

  const response = await getClient(token).post<{ pictureId: string }>('/user/me/picture', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });

  return response.data.pictureId;
}

export async function deletePicture(pictureId: string, token: string): Promise<void> {
  console.log('🔄 UserService: Deleting picture...');
  await getClient(token).delete(`/user/me/picture/${pictureId}`);
}

export async function getPicture(pictureId: string, token: string): Promise<string> {
  console.log('🔄 UserService: Fetching picture...');
  const response = await getClient(token).get(`/user/me/picture/${pictureId}`, {
    responseType: 'blob',
  });

  // Create blob URL from the response
  const blob = new Blob([response.data], {
    type: response.headers['content-type'] || 'image/jpeg',
  });
  const blobUrl = URL.createObjectURL(blob);

  return blobUrl;
}
export async function getPictureShareLink(pictureId: string, token: string): Promise<string> {
  console.log('🔄 UserService: Fetching picture share link...');
  const response = await getClient(token).get<{ shareLink: string }>(
    `/user/me/picture/${pictureId}/share-link`
  );
  return response.data.shareLink;
}
export async function deleteUserAccount(token: string): Promise<void> {
  console.log('🔄 UserService: Deleting user account...');
  await getClient(token).delete('/user/me');
}
export async function resetUserAccount(token: string): Promise<void> {
  console.log('🔄 UserService: Resetting user account...');
  await getClient(token).post('/user/me/reset');
}
export interface GetTermsOfServiceResponse {
  accepted: boolean;
  version: string;
  content: string;
  lastAcceptedVersion: string;
}
export async function getTermsOfService(token: string): Promise<GetTermsOfServiceResponse> {
  console.log('🔄 UserService: Checking if user has accepted terms of service...');
  const response = await getClient(token).get<GetTermsOfServiceResponse>('/user/me/terms-of-service');
  return response.data;
}
export async function acceptTermsOfService(token: string, version: string): Promise<void> {
  console.log('🔄 UserService: Accepting terms of service...');
  await getClient(token).post('/user/me/terms-of-service', { version, accepted: true });
}

