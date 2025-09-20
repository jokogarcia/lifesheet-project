import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook, waitFor, act } from '@testing-library/react';
import { useUserCV } from './use-cv';
import cvsService, { type CV, type CreateOrUpdateCVRequest } from '@/services/cvs-service';

// Mock the CVs service
vi.mock('@/services/cvs-service', () => ({
    default: {
        getUserCV: vi.fn(),
        createOrUpdateCV: vi.fn(),
        deleteCV: vi.fn(),
    },
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
        {
            id: 'skill-2',
            name: 'React',
            level: 'Advanced',
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
    personal_info: {
        fullName: 'Jane Doe',
        email: 'jane@example.com',
        title: 'Frontend Developer',
    },
    work_experience: [],
    education: [],
    skills: [],
};

describe('useUserCV', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    afterEach(() => {
        vi.restoreAllMocks();
    });

    describe('initial state', () => {
        it('should initialize with correct default values', () => {
            vi.mocked(cvsService.getUserCV).mockResolvedValue(null);

            const { result } = renderHook(() => useUserCV());

            expect(result.current.cv).toBeNull();
            expect(result.current.isLoading).toBe(true);
            expect(result.current.isSaving).toBe(false);
            expect(result.current.error).toBeNull();
            expect(typeof result.current.saveCV).toBe('function');
            expect(typeof result.current.deleteCV).toBe('function');
            expect(typeof result.current.refetch).toBe('function');
        });

        it('should initialize with correct default values when cvId is provided', () => {
            vi.mocked(cvsService.getUserCV).mockResolvedValue(null);

            const { result } = renderHook(() => useUserCV('cv-123'));

            expect(result.current.cv).toBeNull();
            expect(result.current.isLoading).toBe(true);
            expect(result.current.isSaving).toBe(false);
            expect(result.current.error).toBeNull();
        });
    });

    describe('fetching CV', () => {
        it('should fetch CV successfully', async () => {
            vi.mocked(cvsService.getUserCV).mockResolvedValue(mockCV);

            const { result } = renderHook(() => useUserCV('cv-123'));

            expect(result.current.isLoading).toBe(true);
            expect(result.current.cv).toBeNull();

            await waitFor(() => {
                expect(result.current.isLoading).toBe(false);
            });

            expect(result.current.cv).toEqual(mockCV);
            expect(result.current.error).toBeNull();
            expect(cvsService.getUserCV).toHaveBeenCalledWith('cv-123');
        });

        it('should fetch CV without cvId', async () => {
            vi.mocked(cvsService.getUserCV).mockResolvedValue(mockCV);

            const { result } = renderHook(() => useUserCV());

            await waitFor(() => {
                expect(result.current.isLoading).toBe(false);
            });

            expect(result.current.cv).toEqual(mockCV);
            expect(cvsService.getUserCV).toHaveBeenCalledWith(undefined);
        });

        it('should handle fetch CV error', async () => {
            const error = new Error('Failed to fetch CV');
            vi.mocked(cvsService.getUserCV).mockRejectedValue(error);

            const { result } = renderHook(() => useUserCV('cv-123'));

            expect(result.current.isLoading).toBe(true);

            await waitFor(() => {
                expect(result.current.isLoading).toBe(false);
            });

            expect(result.current.cv).toBeNull();
            expect(result.current.error).toBe('Failed to fetch CV');
            expect(cvsService.getUserCV).toHaveBeenCalledWith('cv-123');
        });

        it('should handle non-Error objects in fetch CV', async () => {
            vi.mocked(cvsService.getUserCV).mockRejectedValue('String error');

            const { result } = renderHook(() => useUserCV('cv-123'));

            await waitFor(() => {
                expect(result.current.isLoading).toBe(false);
            });

            expect(result.current.error).toBe('Failed to fetch CV');
        });

        it('should refetch when cvId changes', async () => {
            vi.mocked(cvsService.getUserCV).mockResolvedValue(mockCV);

            const { result, rerender } = renderHook(
                ({ cvId }) => useUserCV(cvId),
                { initialProps: { cvId: 'cv-123' } }
            );

            await waitFor(() => {
                expect(result.current.isLoading).toBe(false);
            });

            expect(cvsService.getUserCV).toHaveBeenCalledWith('cv-123');

            // Change cvId
            rerender({ cvId: 'cv-456' });

            await waitFor(() => {
                expect(cvsService.getUserCV).toHaveBeenCalledWith('cv-456');
            });

            expect(cvsService.getUserCV).toHaveBeenCalledTimes(2);
        });
    });

    describe('saving CV', () => {
        it('should save CV successfully', async () => {
            const updatedCV = { ...mockCV, personal_info: { ...mockCV.personal_info, fullName: 'Jane Doe' } };
            vi.mocked(cvsService.getUserCV).mockResolvedValue(mockCV);
            vi.mocked(cvsService.createOrUpdateCV).mockResolvedValue(updatedCV);

            const { result } = renderHook(() => useUserCV('cv-123'));

            await waitFor(() => {
                expect(result.current.isLoading).toBe(false);
            });

            expect(result.current.isSaving).toBe(false);

            let savedCV: CV;
            await act(async () => {
                savedCV = await result.current.saveCV('cv-123', mockCreateOrUpdateRequest);
            });

            expect(savedCV!).toEqual(updatedCV);
            expect(result.current.cv).toEqual(updatedCV);
            expect(result.current.isSaving).toBe(false);
            expect(result.current.error).toBeNull();
            expect(cvsService.createOrUpdateCV).toHaveBeenCalledWith('cv-123', mockCreateOrUpdateRequest);
        });

        it('should handle save CV error', async () => {
            const error = new Error('Failed to save CV');
            vi.mocked(cvsService.getUserCV).mockResolvedValue(mockCV);
            vi.mocked(cvsService.createOrUpdateCV).mockRejectedValue(error);

            const { result } = renderHook(() => useUserCV('cv-123'));

            await waitFor(() => {
                expect(result.current.isLoading).toBe(false);
            });

            expect(result.current.isSaving).toBe(false);

            await act(async () => {
                await expect(result.current.saveCV('cv-123', mockCreateOrUpdateRequest)).rejects.toThrow('Failed to save CV');
            });

            expect(result.current.isSaving).toBe(false);
            expect(result.current.error).toBe('Failed to save CV');
            expect(result.current.cv).toEqual(mockCV); // Should remain unchanged
        });

        it('should handle non-Error objects in save CV', async () => {
            vi.mocked(cvsService.getUserCV).mockResolvedValue(mockCV);
            vi.mocked(cvsService.createOrUpdateCV).mockRejectedValue('String error');

            const { result } = renderHook(() => useUserCV('cv-123'));

            await waitFor(() => {
                expect(result.current.isLoading).toBe(false);
            });

            await act(async () => {
                await expect(result.current.saveCV('cv-123', mockCreateOrUpdateRequest)).rejects.toThrow('Failed to save CV');
            });

            expect(result.current.error).toBe('Failed to save CV');
        });

        it('should clear error when saving after previous error', async () => {
            // First, cause a fetch error
            const fetchError = new Error('Failed to fetch CV');
            vi.mocked(cvsService.getUserCV).mockRejectedValueOnce(fetchError);

            const { result } = renderHook(() => useUserCV('cv-123'));

            await waitFor(() => {
                expect(result.current.isLoading).toBe(false);
            });

            expect(result.current.error).toBe('Failed to fetch CV');

            // Now mock successful responses
            vi.mocked(cvsService.getUserCV).mockResolvedValue(mockCV);
            vi.mocked(cvsService.createOrUpdateCV).mockResolvedValue(mockCV);

            // Trigger refetch to clear the error
            await act(async () => {
                await result.current.refetch();
            });

            expect(result.current.error).toBeNull();

            // Now try to save
            await act(async () => {
                await result.current.saveCV('cv-123', mockCreateOrUpdateRequest);
            });

            expect(result.current.error).toBeNull();
        });
    });

    describe('deleting CV', () => {
        it('should delete CV successfully', async () => {
            vi.mocked(cvsService.getUserCV).mockResolvedValue(mockCV);
            vi.mocked(cvsService.deleteCV).mockResolvedValue();

            const { result } = renderHook(() => useUserCV('cv-123'));

            await waitFor(() => {
                expect(result.current.isLoading).toBe(false);
            });

            expect(result.current.cv).toEqual(mockCV);

            await act(async () => {
                await result.current.deleteCV();
            });

            expect(result.current.cv).toBeNull();
            expect(result.current.error).toBeNull();
            expect(cvsService.deleteCV).toHaveBeenCalledTimes(1);
        });

        it('should handle delete CV error', async () => {
            const error = new Error('Failed to delete CV');
            vi.mocked(cvsService.getUserCV).mockResolvedValue(mockCV);
            vi.mocked(cvsService.deleteCV).mockRejectedValue(error);

            const { result } = renderHook(() => useUserCV('cv-123'));

            await waitFor(() => {
                expect(result.current.isLoading).toBe(false);
            });

            expect(result.current.cv).toEqual(mockCV);

            await act(async () => {
                await expect(result.current.deleteCV()).rejects.toThrow('Failed to delete CV');
            });

            expect(result.current.cv).toEqual(mockCV); // Should remain unchanged
            expect(result.current.error).toBe('Failed to delete CV');
        });

        it('should handle non-Error objects in delete CV', async () => {
            vi.mocked(cvsService.getUserCV).mockResolvedValue(mockCV);
            vi.mocked(cvsService.deleteCV).mockRejectedValue('String error');

            const { result } = renderHook(() => useUserCV('cv-123'));

            await waitFor(() => {
                expect(result.current.isLoading).toBe(false);
            });

            await act(async () => {
                await expect(result.current.deleteCV()).rejects.toThrow('Failed to delete CV');
            });

            expect(result.current.error).toBe('Failed to delete CV');
        });

        it('should clear error when deleting after previous error', async () => {
            // First, cause a fetch error
            const fetchError = new Error('Failed to fetch CV');
            vi.mocked(cvsService.getUserCV).mockRejectedValueOnce(fetchError);

            const { result } = renderHook(() => useUserCV('cv-123'));

            await waitFor(() => {
                expect(result.current.isLoading).toBe(false);
            });

            expect(result.current.error).toBe('Failed to fetch CV');

            // Now mock successful responses
            vi.mocked(cvsService.getUserCV).mockResolvedValue(mockCV);
            vi.mocked(cvsService.deleteCV).mockResolvedValue();

            // Trigger refetch to clear the error
            await act(async () => {
                await result.current.refetch();
            });

            expect(result.current.error).toBeNull();

            // Now try to delete
            await act(async () => {
                await result.current.deleteCV();
            });

            expect(result.current.error).toBeNull();
            expect(result.current.cv).toBeNull();
        });
    });

    describe('refetch functionality', () => {
        it('should refetch CV when refetch is called', async () => {
            vi.mocked(cvsService.getUserCV).mockResolvedValue(mockCV);

            const { result } = renderHook(() => useUserCV('cv-123'));

            await waitFor(() => {
                expect(result.current.isLoading).toBe(false);
            });

            expect(cvsService.getUserCV).toHaveBeenCalledTimes(1);

            // Call refetch
            await act(async () => {
                await result.current.refetch();
            });

            expect(cvsService.getUserCV).toHaveBeenCalledTimes(2);
            expect(cvsService.getUserCV).toHaveBeenCalledWith('cv-123');
        });

        it('should handle refetch error', async () => {
            vi.mocked(cvsService.getUserCV)
                .mockResolvedValueOnce(mockCV)
                .mockRejectedValueOnce(new Error('Refetch failed'));

            const { result } = renderHook(() => useUserCV('cv-123'));

            await waitFor(() => {
                expect(result.current.isLoading).toBe(false);
            });

            expect(result.current.error).toBeNull();

            // Call refetch which will fail
            await act(async () => {
                await result.current.refetch();
            });

            expect(result.current.error).toBe('Refetch failed');
            expect(result.current.cv).toEqual(mockCV); // Should remain unchanged
        });
    });

    describe('edge cases', () => {
        it('should handle null CV response', async () => {
            vi.mocked(cvsService.getUserCV).mockResolvedValue(null);

            const { result } = renderHook(() => useUserCV('cv-123'));

            await waitFor(() => {
                expect(result.current.isLoading).toBe(false);
            });

            expect(result.current.cv).toBeNull();
            expect(result.current.error).toBeNull();
        });

        it('should handle empty string cvId', async () => {
            vi.mocked(cvsService.getUserCV).mockResolvedValue(mockCV);

            const { result } = renderHook(() => useUserCV(''));

            await waitFor(() => {
                expect(result.current.isLoading).toBe(false);
            });

            expect(cvsService.getUserCV).toHaveBeenCalledWith('');
        });

        it('should maintain state consistency during multiple operations', async () => {
            const updatedCV = { ...mockCV, personal_info: { ...mockCV.personal_info, fullName: 'Jane Doe' } };
            vi.mocked(cvsService.getUserCV).mockResolvedValue(mockCV);
            vi.mocked(cvsService.createOrUpdateCV).mockResolvedValue(updatedCV);
            vi.mocked(cvsService.deleteCV).mockResolvedValue();

            const { result } = renderHook(() => useUserCV('cv-123'));

            await waitFor(() => {
                expect(result.current.isLoading).toBe(false);
            });

            // Save CV
            await act(async () => {
                await result.current.saveCV('cv-123', mockCreateOrUpdateRequest);
            });
            expect(result.current.cv).toEqual(updatedCV);
            expect(result.current.isSaving).toBe(false);

            // Delete CV
            await act(async () => {
                await result.current.deleteCV();
            });
            expect(result.current.cv).toBeNull();

            // Refetch
            vi.mocked(cvsService.getUserCV).mockResolvedValue(mockCV);
            await act(async () => {
                await result.current.refetch();
            });
            expect(result.current.cv).toEqual(mockCV);
        });
    });
});
