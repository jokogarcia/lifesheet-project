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

class UserService {
  private client: Axios;

  constructor(baseUrl: string = constants.API_URL) {
    this.client = axios.create({
      baseURL: baseUrl,
      headers: {
        'Content-Type': 'application/json',
      },
    });
    setupApiErrorInterceptor(this.client);
  }
  setAuthToken(token: string) {
    this.client.defaults.headers.common['Authorization'] = `Bearer ${token}`;
  }

  // Get the current user's profile
  async getProfile(): Promise<UserProfile> {
    console.log('🔄 UserService: Fetching user profile...');

    const response = await this.client.get<UserProfile>('/user/me');

    return response.data;
  }

  // Update the current user's profile
  async updateProfile(profileData: UpdateProfileRequest): Promise<UserProfile> {
    console.log('🔄 UserService: Updating user profile...');

    const response = await this.client.put<UserProfile>('/user/me', profileData);

    return response.data;
  }
  async getUserPictures(): Promise<string[]> {
    console.log('🔄 UserService: Fetching user pictures...');
    const response = await this.client.get<{ pictureIds: string[] }>('/user/me/pictures');
    return response.data.pictureIds;
  }

  async uploadPicture(file: File): Promise<string> {
    console.log('🔄 UserService: Uploading picture...');
    const formData = new FormData();
    formData.append('picture', file);

    const response = await this.client.post<{ pictureId: string }>('/user/me/picture', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });

    return response.data.pictureId;
  }

  async deletePicture(pictureId: string): Promise<void> {
    console.log('🔄 UserService: Deleting picture...');
    await this.client.delete(`/user/me/picture/${pictureId}`);
  }

  async getPicture(pictureId: string): Promise<string> {
    console.log('🔄 UserService: Fetching picture...');
    const response = await this.client.get(`/user/me/picture/${pictureId}`, {
      responseType: 'blob',
    });

    // Create blob URL from the response
    const blob = new Blob([response.data], {
      type: response.headers['content-type'] || 'image/jpeg',
    });
    const blobUrl = URL.createObjectURL(blob);

    return blobUrl;
  }
  async getPictureShareLink(pictureId: string): Promise<string> {
    console.log('🔄 UserService: Fetching picture share link...');
    const response = await this.client.get<{ shareLink: string }>(
      `/user/me/picture/${pictureId}/share-link`
    );
    return response.data.shareLink;
  }
}

// Export a singleton instance
const userService = new UserService();
export default userService;
