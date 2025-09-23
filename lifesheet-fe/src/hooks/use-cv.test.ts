import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook, waitFor, act } from '@testing-library/react';
import { useUserCV } from './use-cv';
import { getUserCV, createOrUpdateCV, deleteCV, type CV, type CreateOrUpdateCVRequest } from '@/services/cvs-service';
import { useAuth } from './auth-hook';

// Mock the CVs service functions
vi.mock('@/services/cvs-service', () => ({
    getUserCV: vi.fn(),
    createOrUpdateCV: vi.fn(),
    deleteCV: vi.fn(),
}));

// Mock the auth hook
vi.mock('./auth-hook', () => ({
    useAuth: vi.fn(),
}));

// Mock data
const mockCV: CV = {
    _id: 'cv-123',
    personal_info: {
        fullName: 'John Doe',
        email: 'john@example.com',
        title: 'Software Engineer',
        phone: '+1234567890',
        location: 'New York, NY',
        summary: 'Experienced software engineer',
    },
    work_experience: [
        {
            id: 'exp-1',
            company: 'Tech Corp',
            position: 'Senior Developer',
            startDate: '2020-01-01',
            endDate: '2023-12-31',
            current: false,
            description: 'Led development team',
            location: 'San Francisco, CA',
            achievements: ['Improved performance by 50%'],
        },
    ],
    education: [
        {
            id: 'edu-1',
            institution: 'University of Technology',
            degree: 'Bachelor of Science',
            field: 'Computer Science',
            startDate: '2016-09-01',
            endDate: '2020-05-31',
            gpa: '3.8',
            location: 'Boston, MA',
        },
    ],
    skills: [
        {
            id: 'skill-1',
            name: 'JavaScript',
            level: 'Expert',
        },
    ],
    language_skills: [
        {
            id: 'lang-1',
            language: 'English',
            level: 'Native',
        },
    ],
    created_at: '2023-01-01T00:00:00Z',
    updated_at: '2023-12-01T00:00:00Z',
    user_id: 'user-123',
    sectionTitles: {
        personalInfo: 'Personal Information',
        workExperience: 'Work Experience',
        education: 'Education',
        skills: 'Skills',
        languages: 'Languages',
    },
};

const mockCreateOrUpdateRequest: CreateOrUpdateCVRequest = {
    personal_info: mockCV.personal_info,
    work_experience: mockCV.work_experience,
    education: mockCV.education,
    skills: mockCV.skills,
    language_skills: mockCV.language_skills,
};

const updatedCV: CV = {
    ...mockCV,
    personal_info: {
        ...mockCV.personal_info,
        fullName: 'John Updated Doe',
    },
};

describe('useUserCV', () => {
    const mockGetUserCV = vi.mocked(getUserCV);
    const mockCreateOrUpdateCV = vi.mocked(createOrUpdateCV);
    const mockDeleteCV = vi.mocked(deleteCV);
    const mockUseAuth = vi.mocked(useAuth);

    beforeEach(() => {
        vi.clearAllMocks();

        // Mock the auth hook to return a mock token getter
        mockUseAuth.mockReturnValue({
            isAuthenticated: true,
            user: {},
            loginWithRedirect: vi.fn(),
            logout: vi.fn(),
            getAccessTokenSilently: vi.fn().mockResolvedValue('mock-token-123'),
        });
    });

    afterEach(() => {
        vi.restoreAllMocks();
    });

    describe('initial state', () => {
        it('should initialize with correct default values', () => {
            mockGetUserCV.mockResolvedValue(null);

            const { result } = renderHook(() => useUserCV());

            expect(result.current.cv).toBe(null);
            expect(result.current.isLoading).toBe(true);
            expect(result.current.isSaving).toBe(false);
            expect(result.current.error).toBe(null);
        });

        it('should initialize with cvId parameter', () => {
            mockGetUserCV.mockResolvedValue(null);

            const { result } = renderHook(() => useUserCV('cv-123'));

            expect(result.current.cv).toBe(null);
            expect(result.current.isLoading).toBe(true);
            expect(result.current.isSaving).toBe(false);
            expect(result.current.error).toBe(null);
        });
    });

    describe('fetching CV', () => {
        it('should fetch CV successfully', async () => {
            mockGetUserCV.mockResolvedValue(mockCV);

            const { result } = renderHook(() => useUserCV('cv-123'));

            await waitFor(() => {
                expect(result.current.isLoading).toBe(false);
            });

            expect(result.current.cv).toEqual(mockCV);
            expect(result.current.error).toBe(null);
            expect(mockGetUserCV).toHaveBeenCalledWith('mock-token-123', 'cv-123');
        });

        it('should fetch CV without cvId', async () => {
            mockGetUserCV.mockResolvedValue(mockCV);

            const { result } = renderHook(() => useUserCV());

            await waitFor(() => {
                expect(result.current.isLoading).toBe(false);
            });

            expect(result.current.cv).toEqual(mockCV);
            expect(result.current.error).toBe(null);
            expect(mockGetUserCV).toHaveBeenCalledWith('mock-token-123', undefined);
        });

        it('should handle fetch error', async () => {
            const error = new Error('Network error');
            mockGetUserCV.mockRejectedValue(error);

            const { result } = renderHook(() => useUserCV('cv-123'));

            await waitFor(() => {
                expect(result.current.isLoading).toBe(false);
            });

            expect(result.current.cv).toBe(null);
            expect(result.current.error).toBe('Network error');
        });

        it('should handle fetch error with string', async () => {
            mockGetUserCV.mockRejectedValue('String error');

            const { result } = renderHook(() => useUserCV('cv-123'));

            await waitFor(() => {
                expect(result.current.isLoading).toBe(false);
            });

            expect(result.current.cv).toBe(null);
            expect(result.current.error).toBe('Failed to fetch CV');
        });
    });

    describe('saving CV', () => {
        it('should save CV successfully', async () => {
            mockGetUserCV.mockResolvedValue(mockCV);
            mockCreateOrUpdateCV.mockResolvedValue(updatedCV);

            const { result } = renderHook(() => useUserCV('cv-123'));

            await waitFor(() => {
                expect(result.current.isLoading).toBe(false);
            });

            await act(async () => {
                await result.current.saveCV('cv-123', mockCreateOrUpdateRequest);
            });

            expect(result.current.cv).toEqual(updatedCV);
            expect(result.current.error).toBe(null);
            expect(result.current.isSaving).toBe(false);
            expect(mockCreateOrUpdateCV).toHaveBeenCalledWith('mock-token-123', 'cv-123', mockCreateOrUpdateRequest);
        });

        it('should handle save error', async () => {
            mockGetUserCV.mockResolvedValue(mockCV);
            const error = new Error('Save failed');
            mockCreateOrUpdateCV.mockRejectedValue(error);

            const { result } = renderHook(() => useUserCV('cv-123'));

            await waitFor(() => {
                expect(result.current.isLoading).toBe(false);
            });

            await act(async () => {
                try {
                    await result.current.saveCV('cv-123', mockCreateOrUpdateRequest);
                } catch (e) {
                    // Expected to throw
                }
            });

            expect(result.current.error).toBe('Save failed');
            expect(result.current.isSaving).toBe(false);
        });

        it('should handle save error with string', async () => {
            mockGetUserCV.mockResolvedValue(mockCV);
            mockCreateOrUpdateCV.mockRejectedValue('String error');

            const { result } = renderHook(() => useUserCV('cv-123'));

            await waitFor(() => {
                expect(result.current.isLoading).toBe(false);
            });

            await act(async () => {
                try {
                    await result.current.saveCV('cv-123', mockCreateOrUpdateRequest);
                } catch (e) {
                    // Expected to throw
                }
            });

            expect(result.current.error).toBe('Failed to save CV');
            expect(result.current.isSaving).toBe(false);
        });
    });

    describe('deleting CV', () => {
        it('should delete CV successfully', async () => {
            mockGetUserCV.mockResolvedValue(mockCV);
            mockDeleteCV.mockResolvedValue();

            const { result } = renderHook(() => useUserCV('cv-123'));

            await waitFor(() => {
                expect(result.current.isLoading).toBe(false);
            });

            await act(async () => {
                await result.current.deleteCV();
            });

            expect(result.current.cv).toBe(null);
            expect(result.current.error).toBe(null);
            expect(mockDeleteCV).toHaveBeenCalledWith('mock-token-123');
        });

        it('should handle delete error', async () => {
            mockGetUserCV.mockResolvedValue(mockCV);
            const error = new Error('Delete failed');
            mockDeleteCV.mockRejectedValue(error);

            const { result } = renderHook(() => useUserCV('cv-123'));

            await waitFor(() => {
                expect(result.current.isLoading).toBe(false);
            });

            await act(async () => {
                try {
                    await result.current.deleteCV();
                } catch (e) {
                    // Expected to throw
                }
            });

            expect(result.current.error).toBe('Delete failed');
        });

        it('should handle delete error with string', async () => {
            mockGetUserCV.mockResolvedValue(mockCV);
            mockDeleteCV.mockRejectedValue('String error');

            const { result } = renderHook(() => useUserCV('cv-123'));

            await waitFor(() => {
                expect(result.current.isLoading).toBe(false);
            });

            await act(async () => {
                try {
                    await result.current.deleteCV();
                } catch (e) {
                    // Expected to throw
                }
            });

            expect(result.current.error).toBe('Failed to delete CV');
        });
    });

    describe('refetch functionality', () => {
        it('should refetch CV when refetch is called', async () => {
            mockGetUserCV.mockResolvedValueOnce(mockCV);

            const { result } = renderHook(() => useUserCV('cv-123'));

            await waitFor(() => {
                expect(result.current.isLoading).toBe(false);
            });

            expect(mockGetUserCV).toHaveBeenCalledTimes(1);

            // Call refetch
            await act(async () => {
                await result.current.refetch();
            });

            expect(mockGetUserCV).toHaveBeenCalledTimes(2);
            expect(mockGetUserCV).toHaveBeenCalledWith('mock-token-123', 'cv-123');
        });

        it('should handle refetch error', async () => {
            mockGetUserCV.mockResolvedValueOnce(mockCV);
            const fetchError = new Error('Refetch failed');
            mockGetUserCV.mockRejectedValueOnce(fetchError);

            const { result } = renderHook(() => useUserCV('cv-123'));

            await waitFor(() => {
                expect(result.current.isLoading).toBe(false);
            });

            // Call refetch
            await act(async () => {
                await result.current.refetch();
            });

            expect(result.current.error).toBe('Refetch failed');
        });
    });

    describe('loading states', () => {
        it('should set loading to true initially', () => {
            mockGetUserCV.mockResolvedValue(mockCV);

            const { result } = renderHook(() => useUserCV('cv-123'));

            expect(result.current.isLoading).toBe(true);
        });

        it('should set loading to false after successful fetch', async () => {
            mockGetUserCV.mockResolvedValue(mockCV);

            const { result } = renderHook(() => useUserCV('cv-123'));

            await waitFor(() => {
                expect(result.current.isLoading).toBe(false);
            });

            expect(result.current.isLoading).toBe(false);
        });

        it('should set loading to false after error', async () => {
            const error = new Error('Test error');
            mockGetUserCV.mockRejectedValue(error);

            const { result } = renderHook(() => useUserCV('cv-123'));

            await waitFor(() => {
                expect(result.current.isLoading).toBe(false);
            });

            expect(result.current.isLoading).toBe(false);
        });
    });

    describe('return value structure', () => {
        it('should return the correct structure', async () => {
            mockGetUserCV.mockResolvedValue(mockCV);

            const { result } = renderHook(() => useUserCV('cv-123'));

            await waitFor(() => {
                expect(result.current.isLoading).toBe(false);
            });

            expect(result.current).toHaveProperty('cv');
            expect(result.current).toHaveProperty('isLoading');
            expect(result.current).toHaveProperty('isSaving');
            expect(result.current).toHaveProperty('error');
            expect(result.current).toHaveProperty('saveCV');
            expect(result.current).toHaveProperty('deleteCV');
            expect(result.current).toHaveProperty('refetch');

            expect(typeof result.current.isLoading).toBe('boolean');
            expect(typeof result.current.isSaving).toBe('boolean');
            expect(typeof result.current.error).toBe('object'); // null is typeof 'object'
            expect(typeof result.current.saveCV).toBe('function');
            expect(typeof result.current.deleteCV).toBe('function');
            expect(typeof result.current.refetch).toBe('function');
        });
    });

    describe('edge cases', () => {
        it('should handle empty cvId', async () => {
            mockGetUserCV.mockResolvedValue(mockCV);

            const { result } = renderHook(() => useUserCV(''));

            await waitFor(() => {
                expect(result.current.isLoading).toBe(false);
            });

            expect(result.current.cv).toEqual(mockCV);
            expect(mockGetUserCV).toHaveBeenCalledWith('mock-token-123', '');
        });

        it('should handle multiple operations', async () => {
            mockGetUserCV.mockResolvedValue(mockCV);
            mockCreateOrUpdateCV.mockResolvedValue(updatedCV);
            mockDeleteCV.mockResolvedValue();

            const { result } = renderHook(() => useUserCV('cv-123'));

            await waitFor(() => {
                expect(result.current.isLoading).toBe(false);
            });

            // Save CV
            await act(async () => {
                await result.current.saveCV('cv-123', mockCreateOrUpdateRequest);
            });

            expect(result.current.cv).toEqual(updatedCV);

            // Delete CV
            await act(async () => {
                await result.current.deleteCV();
            });

            expect(result.current.cv).toBe(null);
        });
    });
});