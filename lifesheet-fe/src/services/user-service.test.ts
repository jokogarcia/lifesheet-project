import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import axios from 'axios';
import {
    getProfile,
    updateProfile,
    getUserPictures,
    uploadPicture,
    deletePicture,
    getPicture,
    getPictureShareLink,
    deleteUserAccount,
    resetUserAccount,
    getTermsOfService,
    acceptTermsOfService,
    type UserProfile,
    type UpdateProfileRequest,
} from './user-service';
import { constants } from '../constants';
import { setupApiErrorInterceptor } from './api-error-interceptor';

// Mock axios and its create method
vi.mock('axios', () => ({
    default: {
        create: vi.fn(),
    },
}));

// Mock constants
vi.mock('../constants', () => ({
    constants: {
        API_URL: 'https://api.example.com',
    },
}));

// Mock api-error-interceptor
vi.mock('./api-error-interceptor', () => ({
    setupApiErrorInterceptor: vi.fn(),
}));

// Mock URL.createObjectURL and URL.revokeObjectURL
const mockCreateObjectURL = vi.fn();
const mockRevokeObjectURL = vi.fn();

Object.defineProperty(global, 'URL', {
    value: {
        createObjectURL: mockCreateObjectURL,
        revokeObjectURL: mockRevokeObjectURL,
    },
    writable: true,
});

describe('user-service', () => {
    let mockAxiosInstance: any;
    let mockAxiosCreate: any;

    beforeEach(() => {
        vi.clearAllMocks();

        // Create a fresh mock instance for each test
        mockAxiosInstance = {
            get: vi.fn(),
            post: vi.fn(),
            put: vi.fn(),
            delete: vi.fn(),
            defaults: {
                headers: {
                    common: {},
                },
            },
            interceptors: {
                response: {
                    use: vi.fn(),
                },
            },
        };

        mockAxiosCreate = vi.mocked(axios.create);
        mockAxiosCreate.mockReturnValue(mockAxiosInstance);

        // Reset URL mocks
        mockCreateObjectURL.mockReturnValue('blob:mock-url-123');
        mockRevokeObjectURL.mockImplementation(() => { });
    });

    afterEach(() => {
        vi.restoreAllMocks();
    });

    describe('getProfile', () => {
        const mockProfile: UserProfile = {
            _id: 'user-123',
            name: 'John Doe',
            email: 'john.doe@example.com',
        };

        it('should fetch user profile successfully', async () => {
            mockAxiosInstance.get.mockResolvedValue({ data: mockProfile });

            const result = await getProfile('test-token');

            expect(result).toEqual(mockProfile);
            expect(mockAxiosInstance.get).toHaveBeenCalledWith('/user/me');
            expect(mockAxiosInstance.defaults.headers.common['Authorization']).toBe('Bearer test-token');
        });

        it('should handle API errors', async () => {
            const error = new Error('Profile not found');
            mockAxiosInstance.get.mockRejectedValue(error);

            await expect(getProfile('test-token')).rejects.toThrow('Profile not found');
        });

        it('should require token parameter', async () => {
            mockAxiosInstance.get.mockResolvedValue({ data: mockProfile });

            await getProfile('required-token');

            expect(mockAxiosInstance.defaults.headers.common['Authorization']).toBe('Bearer required-token');
        });
    });

    describe('updateProfile', () => {
        const mockProfile: UserProfile = {
            _id: 'user-123',
            name: 'Jane Doe',
            email: 'jane.doe@example.com',
        };

        const updateData: UpdateProfileRequest = {
            name: 'Jane Doe',
            email: 'jane.doe@example.com',
        };

        it('should update user profile successfully', async () => {
            mockAxiosInstance.put.mockResolvedValue({ data: mockProfile });

            const result = await updateProfile(updateData, 'test-token');

            expect(result).toEqual(mockProfile);
            expect(mockAxiosInstance.put).toHaveBeenCalledWith('/user/me', updateData);
            expect(mockAxiosInstance.defaults.headers.common['Authorization']).toBe('Bearer test-token');
        });

        it('should handle partial updates', async () => {
            const partialUpdate: UpdateProfileRequest = { name: 'New Name' };
            const updatedProfile = { ...mockProfile, name: 'New Name' };
            mockAxiosInstance.put.mockResolvedValue({ data: updatedProfile });

            const result = await updateProfile(partialUpdate, 'test-token');

            expect(result).toEqual(updatedProfile);
            expect(mockAxiosInstance.put).toHaveBeenCalledWith('/user/me', partialUpdate);
        });

        it('should handle API errors', async () => {
            const error = new Error('Update failed');
            mockAxiosInstance.put.mockRejectedValue(error);

            await expect(updateProfile(updateData, 'test-token')).rejects.toThrow('Update failed');
        });

        it('should require token parameter', async () => {
            mockAxiosInstance.put.mockResolvedValue({ data: mockProfile });

            await updateProfile(updateData, 'required-token');

            expect(mockAxiosInstance.defaults.headers.common['Authorization']).toBe('Bearer required-token');
        });
    });

    describe('getUserPictures', () => {
        const mockPictures = ['pic-1', 'pic-2', 'pic-3'];

        it('should fetch user pictures successfully', async () => {
            mockAxiosInstance.get.mockResolvedValue({ data: { pictureIds: mockPictures } });

            const result = await getUserPictures('test-token');

            expect(result).toEqual(mockPictures);
            expect(mockAxiosInstance.get).toHaveBeenCalledWith('/user/me/pictures');
            expect(mockAxiosInstance.defaults.headers.common['Authorization']).toBe('Bearer test-token');
        });

        it('should return empty array when no pictures', async () => {
            mockAxiosInstance.get.mockResolvedValue({ data: { pictureIds: [] } });

            const result = await getUserPictures('test-token');

            expect(result).toEqual([]);
        });

        it('should handle API errors', async () => {
            const error = new Error('Pictures not found');
            mockAxiosInstance.get.mockRejectedValue(error);

            await expect(getUserPictures('test-token')).rejects.toThrow('Pictures not found');
        });

        it('should require token parameter', async () => {
            mockAxiosInstance.get.mockResolvedValue({ data: { pictureIds: mockPictures } });

            await getUserPictures('required-token');

            expect(mockAxiosInstance.defaults.headers.common['Authorization']).toBe('Bearer required-token');
        });
    });

    describe('uploadPicture', () => {
        const mockFile = new File(['test content'], 'test.jpg', { type: 'image/jpeg' });
        const mockPictureId = 'pic-123';

        it('should upload picture successfully', async () => {
            mockAxiosInstance.post.mockResolvedValue({ data: { pictureId: mockPictureId } });

            const result = await uploadPicture(mockFile, 'test-token');

            expect(result).toBe(mockPictureId);
            expect(mockAxiosInstance.post).toHaveBeenCalledWith(
                '/user/me/picture',
                expect.any(FormData),
                {
                    headers: {
                        'Content-Type': 'multipart/form-data',
                    },
                }
            );
            expect(mockAxiosInstance.defaults.headers.common['Authorization']).toBe('Bearer test-token');
        });

        it('should create FormData with correct file', async () => {
            mockAxiosInstance.post.mockResolvedValue({ data: { pictureId: mockPictureId } });

            await uploadPicture(mockFile, 'test-token');

            const formDataCall = mockAxiosInstance.post.mock.calls[0];
            const formData = formDataCall[1];
            expect(formData).toBeInstanceOf(FormData);
            expect(formData.get('picture')).toBe(mockFile);
        });

        it('should handle different file types', async () => {
            const pngFile = new File(['test content'], 'test.png', { type: 'image/png' });
            mockAxiosInstance.post.mockResolvedValue({ data: { pictureId: 'pic-456' } });

            await uploadPicture(pngFile, 'test-token');

            expect(mockAxiosInstance.post).toHaveBeenCalledWith(
                '/user/me/picture',
                expect.any(FormData),
                {
                    headers: {
                        'Content-Type': 'multipart/form-data',
                    },
                }
            );
        });

        it('should handle API errors', async () => {
            const error = new Error('Upload failed');
            mockAxiosInstance.post.mockRejectedValue(error);

            await expect(uploadPicture(mockFile, 'test-token')).rejects.toThrow('Upload failed');
        });

        it('should require token parameter', async () => {
            mockAxiosInstance.post.mockResolvedValue({ data: { pictureId: mockPictureId } });

            await uploadPicture(mockFile, 'required-token');

            expect(mockAxiosInstance.defaults.headers.common['Authorization']).toBe('Bearer required-token');
        });
    });

    describe('deletePicture', () => {
        const pictureId = 'pic-123';

        it('should delete picture successfully', async () => {
            mockAxiosInstance.delete.mockResolvedValue({ data: {} });

            await deletePicture(pictureId, 'test-token');

            expect(mockAxiosInstance.delete).toHaveBeenCalledWith(`/user/me/picture/${pictureId}`);
            expect(mockAxiosInstance.defaults.headers.common['Authorization']).toBe('Bearer test-token');
        });

        it('should handle API errors', async () => {
            const error = new Error('Delete failed');
            mockAxiosInstance.delete.mockRejectedValue(error);

            await expect(deletePicture(pictureId, 'test-token')).rejects.toThrow('Delete failed');
        });

        it('should require token parameter', async () => {
            mockAxiosInstance.delete.mockResolvedValue({ data: {} });

            await deletePicture(pictureId, 'required-token');

            expect(mockAxiosInstance.defaults.headers.common['Authorization']).toBe('Bearer required-token');
        });
    });

    describe('getPicture', () => {
        const pictureId = 'pic-123';
        const mockBlob = new Blob(['test image data'], { type: 'image/jpeg' });

        it('should fetch picture successfully', async () => {
            mockAxiosInstance.get.mockResolvedValue({
                data: mockBlob,
                headers: { 'content-type': 'image/jpeg' },
            });

            const result = await getPicture(pictureId, 'test-token');

            expect(result).toBe('blob:mock-url-123');
            expect(mockAxiosInstance.get).toHaveBeenCalledWith(`/user/me/picture/${pictureId}`, {
                responseType: 'blob',
            });
            expect(mockAxiosInstance.defaults.headers.common['Authorization']).toBe('Bearer test-token');
            expect(mockCreateObjectURL).toHaveBeenCalledWith(expect.any(Blob));
        });

        it('should handle different content types', async () => {
            mockAxiosInstance.get.mockResolvedValue({
                data: mockBlob,
                headers: { 'content-type': 'image/png' },
            });

            await getPicture(pictureId, 'test-token');

            expect(mockCreateObjectURL).toHaveBeenCalledWith(expect.any(Blob));
        });

        it('should use default content type when not provided', async () => {
            mockAxiosInstance.get.mockResolvedValue({
                data: mockBlob,
                headers: {},
            });

            await getPicture(pictureId, 'test-token');

            expect(mockCreateObjectURL).toHaveBeenCalledWith(expect.any(Blob));
        });

        it('should handle API errors', async () => {
            const error = new Error('Picture not found');
            mockAxiosInstance.get.mockRejectedValue(error);

            await expect(getPicture(pictureId, 'test-token')).rejects.toThrow('Picture not found');
        });

        it('should require token parameter', async () => {
            mockAxiosInstance.get.mockResolvedValue({
                data: mockBlob,
                headers: { 'content-type': 'image/jpeg' },
            });

            await getPicture(pictureId, 'required-token');

            expect(mockAxiosInstance.defaults.headers.common['Authorization']).toBe('Bearer required-token');
        });
    });

    describe('getPictureShareLink', () => {
        const pictureId = 'pic-123';
        const mockShareLink = 'https://example.com/share/pic-123';

        it('should get picture share link successfully', async () => {
            mockAxiosInstance.get.mockResolvedValue({ data: { shareLink: mockShareLink } });

            const result = await getPictureShareLink(pictureId, 'test-token');

            expect(result).toBe(mockShareLink);
            expect(mockAxiosInstance.get).toHaveBeenCalledWith(`/user/me/picture/${pictureId}/share-link`);
            expect(mockAxiosInstance.defaults.headers.common['Authorization']).toBe('Bearer test-token');
        });

        it('should handle API errors', async () => {
            const error = new Error('Share link not found');
            mockAxiosInstance.get.mockRejectedValue(error);

            await expect(getPictureShareLink(pictureId, 'test-token')).rejects.toThrow('Share link not found');
        });

        it('should require token parameter', async () => {
            mockAxiosInstance.get.mockResolvedValue({ data: { shareLink: mockShareLink } });

            await getPictureShareLink(pictureId, 'required-token');

            expect(mockAxiosInstance.defaults.headers.common['Authorization']).toBe('Bearer required-token');
        });
    });

    describe('deleteUserAccount', () => {
        it('should delete user account successfully', async () => {
            mockAxiosInstance.delete.mockResolvedValue({ data: {} });

            await deleteUserAccount('test-token');

            expect(mockAxiosInstance.delete).toHaveBeenCalledWith('/user/me');
            expect(mockAxiosInstance.defaults.headers.common['Authorization']).toBe('Bearer test-token');
        });

        it('should handle API errors', async () => {
            const error = new Error('Account deletion failed');
            mockAxiosInstance.delete.mockRejectedValue(error);

            await expect(deleteUserAccount('test-token')).rejects.toThrow('Account deletion failed');
        });

        it('should require token parameter', async () => {
            mockAxiosInstance.delete.mockResolvedValue({ data: {} });

            await deleteUserAccount('required-token');

            expect(mockAxiosInstance.defaults.headers.common['Authorization']).toBe('Bearer required-token');
        });
    });

    describe('resetUserAccount', () => {
        it('should reset user account successfully', async () => {
            mockAxiosInstance.post.mockResolvedValue({ data: {} });

            await resetUserAccount('test-token');

            expect(mockAxiosInstance.post).toHaveBeenCalledWith('/user/me/reset');
            expect(mockAxiosInstance.defaults.headers.common['Authorization']).toBe('Bearer test-token');
        });

        it('should handle API errors', async () => {
            const error = new Error('Account reset failed');
            mockAxiosInstance.post.mockRejectedValue(error);

            await expect(resetUserAccount('test-token')).rejects.toThrow('Account reset failed');
        });

        it('should require token parameter', async () => {
            mockAxiosInstance.post.mockResolvedValue({ data: {} });

            await resetUserAccount('required-token');

            expect(mockAxiosInstance.defaults.headers.common['Authorization']).toBe('Bearer required-token');
        });
    });

    describe('getClient function', () => {
        it('should create axios client with correct base URL', async () => {
            mockAxiosInstance.get.mockResolvedValue({ data: {} });

            await getProfile('test-token');

            expect(mockAxiosCreate).toHaveBeenCalledWith({
                baseURL: constants.API_URL,
                headers: {
                    'Content-Type': 'application/json',
                },
            });
        });

        it('should set authorization header when token provided', async () => {
            mockAxiosInstance.get.mockResolvedValue({ data: {} });

            await getProfile('test-token');

            expect(mockAxiosInstance.defaults.headers.common['Authorization']).toBe('Bearer test-token');
        });

        it('should not set authorization header when token not provided', async () => {
            mockAxiosInstance.get.mockResolvedValue({ data: {} });

            await getProfile('');

            expect(mockAxiosInstance.defaults.headers.common['Authorization']).toBeUndefined();
        });

        it('should call setupApiErrorInterceptor for all requests', async () => {
            mockAxiosInstance.get.mockResolvedValue({ data: {} });

            await getProfile('test-token');

            expect(setupApiErrorInterceptor).toHaveBeenCalledWith(mockAxiosInstance);
        });
    });

    describe('error handling', () => {
        it('should propagate network errors', async () => {
            const networkError = new Error('Network Error');
            mockAxiosInstance.get.mockRejectedValue(networkError);

            await expect(getProfile('test-token')).rejects.toThrow('Network Error');
        });

        it('should propagate HTTP errors', async () => {
            const httpError = new Error('HTTP 404 Not Found');
            mockAxiosInstance.get.mockRejectedValue(httpError);

            await expect(getUserPictures('test-token')).rejects.toThrow('HTTP 404 Not Found');
        });

        it('should handle timeout errors', async () => {
            const timeoutError = new Error('Request timeout');
            mockAxiosInstance.get.mockRejectedValue(timeoutError);

            await expect(getPicture('pic-123', 'test-token')).rejects.toThrow('Request timeout');
        });
    });

    describe('edge cases', () => {
        it('should handle empty token string', async () => {
            mockAxiosInstance.get.mockResolvedValue({ data: {} });

            await getProfile('');

            // Empty string is falsy, so no authorization header should be set
            expect(mockAxiosInstance.defaults.headers.common['Authorization']).toBeUndefined();
        });

        it('should handle special characters in picture IDs', async () => {
            const specialPictureId = 'pic-with-special-chars-123!@#';
            mockAxiosInstance.get.mockResolvedValue({ data: { shareLink: 'https://example.com/share' } });

            await getPictureShareLink(specialPictureId, 'test-token');

            expect(mockAxiosInstance.get).toHaveBeenCalledWith(`/user/me/picture/${specialPictureId}/share-link`);
        });

        it('should handle very long picture IDs', async () => {
            const longPictureId = 'pic-' + 'a'.repeat(1000);
            mockAxiosInstance.get.mockResolvedValue({ data: { shareLink: 'https://example.com/share' } });

            await getPictureShareLink(longPictureId, 'test-token');

            expect(mockAxiosInstance.get).toHaveBeenCalledWith(`/user/me/picture/${longPictureId}/share-link`);
        });

        it('should handle empty response data gracefully', async () => {
            // This test verifies that the service handles null responses properly
            // The actual service code will throw an error, which is expected behavior
            mockAxiosInstance.get.mockResolvedValue({ data: null });

            await expect(getUserPictures('test-token')).rejects.toThrow();
        });

        it('should handle large file uploads', async () => {
            const largeFile = new File(['x'.repeat(1000000)], 'large.jpg', { type: 'image/jpeg' });
            mockAxiosInstance.post.mockResolvedValue({ data: { pictureId: 'pic-large' } });

            await uploadPicture(largeFile, 'test-token');

            expect(mockAxiosInstance.post).toHaveBeenCalledWith(
                '/user/me/picture',
                expect.any(FormData),
                {
                    headers: {
                        'Content-Type': 'multipart/form-data',
                    },
                }
            );
        });
    });

    describe('getTermsOfService', () => {
        const mockTermsResponse = {
            accepted: true,
            version: '1.2.0',
            content: 'Terms of Service content...',
            lastAcceptedVersion: '1.1.0',
        };

        it('should get terms of service successfully', async () => {
            mockAxiosInstance.get.mockResolvedValue({ data: mockTermsResponse });

            const result = await getTermsOfService('test-token');

            expect(result).toEqual(mockTermsResponse);
            expect(result.accepted).toBe(true);
            expect(result.version).toBe('1.2.0');
            expect(result.content).toBe('Terms of Service content...');
            expect(result.lastAcceptedVersion).toBe('1.1.0');
            expect(mockAxiosInstance.get).toHaveBeenCalledWith('/user/me/terms-of-service');
            expect(mockAxiosInstance.defaults.headers.common['Authorization']).toBe('Bearer test-token');
        });

        it('should return terms data when user has not accepted latest version', async () => {
            const notAcceptedResponse = {
                accepted: false,
                version: '1.3.0',
                content: 'Updated Terms of Service content...',
                lastAcceptedVersion: '1.1.0',
            };
            mockAxiosInstance.get.mockResolvedValue({ data: notAcceptedResponse });

            const result = await getTermsOfService('test-token');

            expect(result).toEqual(notAcceptedResponse);
            expect(result.accepted).toBe(false);
            expect(result.version).toBe('1.3.0');
            expect(result.content).toBe('Updated Terms of Service content...');
            expect(result.lastAcceptedVersion).toBe('1.1.0');
            expect(mockAxiosInstance.get).toHaveBeenCalledWith('/user/me/terms-of-service');
        });

        it('should handle different version scenarios', async () => {
            const versionScenarios = [
                {
                    accepted: true,
                    version: '1.0.0',
                    content: 'Initial terms',
                    lastAcceptedVersion: '1.0.0',
                },
                {
                    accepted: false,
                    version: '2.0.0',
                    content: 'Major update terms',
                    lastAcceptedVersion: '1.0.0',
                },
                {
                    accepted: true,
                    version: '1.5.0',
                    content: 'Minor update terms',
                    lastAcceptedVersion: '1.5.0',
                },
            ];

            for (const scenario of versionScenarios) {
                mockAxiosInstance.get.mockResolvedValue({ data: scenario });

                const result = await getTermsOfService('test-token');

                expect(result).toEqual(scenario);
            }
        });

        it('should handle API errors', async () => {
            const error = new Error('Terms fetch failed');
            mockAxiosInstance.get.mockRejectedValue(error);

            await expect(getTermsOfService('test-token')).rejects.toThrow('Terms fetch failed');
        });

        it('should require token parameter', async () => {
            mockAxiosInstance.get.mockResolvedValue({ data: mockTermsResponse });

            await getTermsOfService('required-token');

            expect(mockAxiosInstance.defaults.headers.common['Authorization']).toBe('Bearer required-token');
        });

        it('should handle empty content', async () => {
            const emptyContentResponse = {
                accepted: false,
                version: '1.0.0',
                content: '',
                lastAcceptedVersion: '',
            };
            mockAxiosInstance.get.mockResolvedValue({ data: emptyContentResponse });

            const result = await getTermsOfService('test-token');

            expect(result).toEqual(emptyContentResponse);
            expect(result.content).toBe('');
            expect(result.lastAcceptedVersion).toBe('');
        });

        it('should handle network errors', async () => {
            const networkError = new Error('Network Error');
            mockAxiosInstance.get.mockRejectedValue(networkError);

            await expect(getTermsOfService('test-token')).rejects.toThrow('Network Error');
        });
    });

    describe('acceptTermsOfService', () => {
        it('should accept terms of service successfully', async () => {
            mockAxiosInstance.post.mockResolvedValue({ data: {} });

            await acceptTermsOfService('test-token', '1.2.0');

            expect(mockAxiosInstance.post).toHaveBeenCalledWith('/user/me/terms-of-service', {
                version: '1.2.0',
                accepted: true,
            });
            expect(mockAxiosInstance.defaults.headers.common['Authorization']).toBe('Bearer test-token');
        });

        it('should handle different version numbers', async () => {
            const versions = ['1.0.0', '1.5.0', '2.0.0', '2.1.3'];

            for (const version of versions) {
                mockAxiosInstance.post.mockResolvedValue({ data: {} });

                await acceptTermsOfService('test-token', version);

                expect(mockAxiosInstance.post).toHaveBeenCalledWith('/user/me/terms-of-service', {
                    version,
                    accepted: true,
                });
            }
        });

        it('should handle API errors', async () => {
            const error = new Error('Terms acceptance failed');
            mockAxiosInstance.post.mockRejectedValue(error);

            await expect(acceptTermsOfService('test-token', '1.2.0')).rejects.toThrow('Terms acceptance failed');
        });

        it('should require token parameter', async () => {
            mockAxiosInstance.post.mockResolvedValue({ data: {} });

            await acceptTermsOfService('required-token', '1.2.0');

            expect(mockAxiosInstance.defaults.headers.common['Authorization']).toBe('Bearer required-token');
        });

        it('should require version parameter', async () => {
            mockAxiosInstance.post.mockResolvedValue({ data: {} });

            await acceptTermsOfService('test-token', '1.2.0');

            expect(mockAxiosInstance.post).toHaveBeenCalledWith('/user/me/terms-of-service', {
                version: '1.2.0',
                accepted: true,
            });
        });

        it('should handle network errors', async () => {
            const networkError = new Error('Network Error');
            mockAxiosInstance.post.mockRejectedValue(networkError);

            await expect(acceptTermsOfService('test-token', '1.2.0')).rejects.toThrow('Network Error');
        });

        it('should handle server errors', async () => {
            const serverError = new Error('Internal Server Error');
            mockAxiosInstance.post.mockRejectedValue(serverError);

            await expect(acceptTermsOfService('test-token', '1.2.0')).rejects.toThrow('Internal Server Error');
        });

        it('should handle version validation errors', async () => {
            const validationError = new Error('Invalid version format');
            mockAxiosInstance.post.mockRejectedValue(validationError);

            await expect(acceptTermsOfService('test-token', 'invalid-version')).rejects.toThrow('Invalid version format');
        });

        it('should handle empty version string', async () => {
            mockAxiosInstance.post.mockResolvedValue({ data: {} });

            await acceptTermsOfService('test-token', '');

            expect(mockAxiosInstance.post).toHaveBeenCalledWith('/user/me/terms-of-service', {
                version: '',
                accepted: true,
            });
        });

        it('should handle special characters in version', async () => {
            const specialVersion = '1.2.0-beta.1+build.123';
            mockAxiosInstance.post.mockResolvedValue({ data: {} });

            await acceptTermsOfService('test-token', specialVersion);

            expect(mockAxiosInstance.post).toHaveBeenCalledWith('/user/me/terms-of-service', {
                version: specialVersion,
                accepted: true,
            });
        });
    });
});