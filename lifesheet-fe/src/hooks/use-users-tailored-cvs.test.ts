import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { useUsersTailoredCVs } from './use-users-tailored-cvs';
import { getUsersTailoredCvs, type CVListItem } from '@/services/cvs-service';
import { useAuth } from './auth-hook';

// Mock the service functions
vi.mock('@/services/cvs-service', () => ({
    getUsersTailoredCvs: vi.fn(),
}));

// Mock the auth hook
vi.mock('./auth-hook', () => ({
    useAuth: vi.fn(),
}));

// Mock data
const mockTailoredCVs: CVListItem[] = [
    {
        _id: 'cv-1',
        updatedAt: '2023-12-01T00:00:00Z',
        hasCoverLetter: true,
        companyName: 'Tech Corp',
    },
    {
        _id: 'cv-2',
        updatedAt: '2023-12-02T00:00:00Z',
        hasCoverLetter: false,
        companyName: 'Startup Inc',
    },
];

describe('useUsersTailoredCVs', () => {
    const mockGetUsersTailoredCvs = vi.mocked(getUsersTailoredCvs);
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

    describe('initial state', () => {
        it('should initialize with correct default values', () => {
            mockGetUsersTailoredCvs.mockResolvedValue([]);

            const { result } = renderHook(() => useUsersTailoredCVs());

            expect(result.current.tailoredCVs).toEqual([]);
            expect(result.current.isLoading).toBe(true);
            expect(result.current.error).toBe('');
        });
    });

    describe('fetching tailored CVs', () => {
        it('should fetch tailored CVs successfully', async () => {
            mockGetUsersTailoredCvs.mockResolvedValue(mockTailoredCVs);

            const { result } = renderHook(() => useUsersTailoredCVs());

            await waitFor(() => {
                expect(result.current.isLoading).toBe(false);
            });

            expect(result.current.tailoredCVs).toEqual(mockTailoredCVs);
            expect(result.current.error).toBe('');
            expect(mockGetUsersTailoredCvs).toHaveBeenCalledWith('mock-token-123');
        });

        it('should handle empty tailored CVs list', async () => {
            mockGetUsersTailoredCvs.mockResolvedValue([]);

            const { result } = renderHook(() => useUsersTailoredCVs());

            await waitFor(() => {
                expect(result.current.isLoading).toBe(false);
            });

            expect(result.current.tailoredCVs).toEqual([]);
            expect(result.current.error).toBe('');
        });

        it('should handle single tailored CV', async () => {
            const singleCV = [mockTailoredCVs[0]];
            mockGetUsersTailoredCvs.mockResolvedValue(singleCV);

            const { result } = renderHook(() => useUsersTailoredCVs());

            await waitFor(() => {
                expect(result.current.isLoading).toBe(false);
            });

            expect(result.current.tailoredCVs).toEqual(singleCV);
            expect(result.current.error).toBe('');
        });
    });

    describe('error handling', () => {
        it('should handle fetch error with Error object', async () => {
            const error = new Error('Network error');
            mockGetUsersTailoredCvs.mockRejectedValue(error);

            const { result } = renderHook(() => useUsersTailoredCVs());

            await waitFor(() => {
                expect(result.current.isLoading).toBe(false);
            });

            expect(result.current.tailoredCVs).toEqual([]);
            expect(result.current.error).toBe('Error fetching tailored CVs');
        });

        it('should handle fetch error with string', async () => {
            const error = 'API Error';
            mockGetUsersTailoredCvs.mockRejectedValue(error);

            const { result } = renderHook(() => useUsersTailoredCVs());

            await waitFor(() => {
                expect(result.current.isLoading).toBe(false);
            });

            expect(result.current.tailoredCVs).toEqual([]);
            expect(result.current.error).toBe('Error fetching tailored CVs');
        });

        it('should handle fetch error with null/undefined', async () => {
            mockGetUsersTailoredCvs.mockRejectedValue(null);

            const { result } = renderHook(() => useUsersTailoredCVs());

            await waitFor(() => {
                expect(result.current.isLoading).toBe(false);
            });

            expect(result.current.tailoredCVs).toEqual([]);
            expect(result.current.error).toBe('Error fetching tailored CVs');
        });

        it('should handle API timeout error', async () => {
            const timeoutError = new Error('Request timeout');
            mockGetUsersTailoredCvs.mockRejectedValue(timeoutError);

            const { result } = renderHook(() => useUsersTailoredCVs());

            await waitFor(() => {
                expect(result.current.isLoading).toBe(false);
            });

            expect(result.current.tailoredCVs).toEqual([]);
            expect(result.current.error).toBe('Error fetching tailored CVs');
        });

        it('should handle 404 error', async () => {
            const notFoundError = new Error('Not Found');
            mockGetUsersTailoredCvs.mockRejectedValue(notFoundError);

            const { result } = renderHook(() => useUsersTailoredCVs());

            await waitFor(() => {
                expect(result.current.isLoading).toBe(false);
            });

            expect(result.current.tailoredCVs).toEqual([]);
            expect(result.current.error).toBe('Error fetching tailored CVs');
        });

        it('should handle 500 server error', async () => {
            const serverError = new Error('Internal Server Error');
            mockGetUsersTailoredCvs.mockRejectedValue(serverError);

            const { result } = renderHook(() => useUsersTailoredCVs());

            await waitFor(() => {
                expect(result.current.isLoading).toBe(false);
            });

            expect(result.current.tailoredCVs).toEqual([]);
            expect(result.current.error).toBe('Error fetching tailored CVs');
        });
    });

    describe('loading states', () => {
        it('should set loading to true initially', () => {
            mockGetUsersTailoredCvs.mockResolvedValue([]);

            const { result } = renderHook(() => useUsersTailoredCVs());

            expect(result.current.isLoading).toBe(true);
        });

        it('should set loading to false after successful fetch', async () => {
            mockGetUsersTailoredCvs.mockResolvedValue(mockTailoredCVs);

            const { result } = renderHook(() => useUsersTailoredCVs());

            await waitFor(() => {
                expect(result.current.isLoading).toBe(false);
            });

            expect(result.current.isLoading).toBe(false);
        });

        it('should set loading to false after error', async () => {
            const error = new Error('Test error');
            mockGetUsersTailoredCvs.mockRejectedValue(error);

            const { result } = renderHook(() => useUsersTailoredCVs());

            await waitFor(() => {
                expect(result.current.isLoading).toBe(false);
            });

            expect(result.current.isLoading).toBe(false);
        });

        it('should maintain loading state during async operation', async () => {
            let resolvePromise: (value: CVListItem[]) => void;
            const controlledPromise = new Promise<CVListItem[]>((resolve) => {
                resolvePromise = resolve;
            });

            mockGetUsersTailoredCvs.mockReturnValue(controlledPromise);

            const { result } = renderHook(() => useUsersTailoredCVs());

            // Should still be loading
            expect(result.current.isLoading).toBe(true);

            // Resolve the promise
            resolvePromise!(mockTailoredCVs);

            await waitFor(() => {
                expect(result.current.isLoading).toBe(false);
            });

            expect(result.current.isLoading).toBe(false);
        });
    });

    describe('data structure validation', () => {
        it('should handle CVs with all required fields', async () => {
            const completeCVs: CVListItem[] = [
                {
                    _id: 'cv-complete-1',
                    updatedAt: '2023-12-01T00:00:00Z',
                    hasCoverLetter: true,
                    companyName: 'Complete Corp',
                },
                {
                    _id: 'cv-complete-2',
                    updatedAt: '2023-12-02T00:00:00Z',
                    hasCoverLetter: false,
                    companyName: 'Another Company',
                },
            ];

            mockGetUsersTailoredCvs.mockResolvedValue(completeCVs);

            const { result } = renderHook(() => useUsersTailoredCVs());

            await waitFor(() => {
                expect(result.current.isLoading).toBe(false);
            });

            expect(result.current.tailoredCVs).toEqual(completeCVs);
            expect(result.current.tailoredCVs[0]).toHaveProperty('_id');
            expect(result.current.tailoredCVs[0]).toHaveProperty('updatedAt');
            expect(result.current.tailoredCVs[0]).toHaveProperty('hasCoverLetter');
            expect(result.current.tailoredCVs[0]).toHaveProperty('companyName');
        });

        it('should handle CVs with boolean hasCoverLetter values', async () => {
            const cvsWithCoverLetters: CVListItem[] = [
                {
                    _id: 'cv-with-cover',
                    updatedAt: '2023-12-01T00:00:00Z',
                    hasCoverLetter: true,
                    companyName: 'Cover Letter Corp',
                },
                {
                    _id: 'cv-without-cover',
                    updatedAt: '2023-12-02T00:00:00Z',
                    hasCoverLetter: false,
                    companyName: 'No Cover Inc',
                },
            ];

            mockGetUsersTailoredCvs.mockResolvedValue(cvsWithCoverLetters);

            const { result } = renderHook(() => useUsersTailoredCVs());

            await waitFor(() => {
                expect(result.current.isLoading).toBe(false);
            });

            expect(result.current.tailoredCVs).toEqual(cvsWithCoverLetters);
            expect(typeof result.current.tailoredCVs[0].hasCoverLetter).toBe('boolean');
            expect(typeof result.current.tailoredCVs[1].hasCoverLetter).toBe('boolean');
        });
    });

    describe('edge cases', () => {
        it('should handle very large dataset', async () => {
            const largeDataset: CVListItem[] = Array.from({ length: 1000 }, (_, index) => ({
                _id: `cv-large-${index}`,
                updatedAt: '2023-12-01T00:00:00Z',
                hasCoverLetter: index % 2 === 0,
                companyName: `Company ${index}`,
            }));

            mockGetUsersTailoredCvs.mockResolvedValue(largeDataset);

            const { result } = renderHook(() => useUsersTailoredCVs());

            await waitFor(() => {
                expect(result.current.isLoading).toBe(false);
            });

            expect(result.current.tailoredCVs).toHaveLength(1000);
            expect(result.current.tailoredCVs[0]._id).toBe('cv-large-0');
            expect(result.current.tailoredCVs[999]._id).toBe('cv-large-999');
        });

        it('should handle CVs with special characters in company names', async () => {
            const specialCharCVs: CVListItem[] = [
                {
                    _id: 'cv-special-1',
                    updatedAt: '2023-12-01T00:00:00Z',
                    hasCoverLetter: true,
                    companyName: 'Company & Associates',
                },
                {
                    _id: 'cv-special-2',
                    updatedAt: '2023-12-02T00:00:00Z',
                    hasCoverLetter: false,
                    companyName: 'Tech-Corp (Inc.)',
                },
                {
                    _id: 'cv-special-3',
                    updatedAt: '2023-12-03T00:00:00Z',
                    hasCoverLetter: true,
                    companyName: 'Startup™',
                },
            ];

            mockGetUsersTailoredCvs.mockResolvedValue(specialCharCVs);

            const { result } = renderHook(() => useUsersTailoredCVs());

            await waitFor(() => {
                expect(result.current.isLoading).toBe(false);
            });

            expect(result.current.tailoredCVs).toEqual(specialCharCVs);
            expect(result.current.tailoredCVs[0].companyName).toBe('Company & Associates');
            expect(result.current.tailoredCVs[1].companyName).toBe('Tech-Corp (Inc.)');
            expect(result.current.tailoredCVs[2].companyName).toBe('Startup™');
        });

        it('should handle CVs with very long company names', async () => {
            const longNameCVs: CVListItem[] = [
                {
                    _id: 'cv-long-1',
                    updatedAt: '2023-12-01T00:00:00Z',
                    hasCoverLetter: true,
                    companyName: 'Very Long Company Name That Exceeds Normal Length Limits And Should Still Work Properly',
                },
            ];

            mockGetUsersTailoredCvs.mockResolvedValue(longNameCVs);

            const { result } = renderHook(() => useUsersTailoredCVs());

            await waitFor(() => {
                expect(result.current.isLoading).toBe(false);
            });

            expect(result.current.tailoredCVs).toEqual(longNameCVs);
            expect(result.current.tailoredCVs[0].companyName.length).toBeGreaterThan(50);
        });

        it('should handle CVs with empty company names', async () => {
            const emptyNameCVs: CVListItem[] = [
                {
                    _id: 'cv-empty-1',
                    updatedAt: '2023-12-01T00:00:00Z',
                    hasCoverLetter: true,
                    companyName: '',
                },
            ];

            mockGetUsersTailoredCvs.mockResolvedValue(emptyNameCVs);

            const { result } = renderHook(() => useUsersTailoredCVs());

            await waitFor(() => {
                expect(result.current.isLoading).toBe(false);
            });

            expect(result.current.tailoredCVs).toEqual(emptyNameCVs);
            expect(result.current.tailoredCVs[0].companyName).toBe('');
        });
    });

    describe('service integration', () => {
        it('should call the correct service method', async () => {
            mockGetUsersTailoredCvs.mockResolvedValue(mockTailoredCVs);

            renderHook(() => useUsersTailoredCVs());

            await waitFor(() => {
                expect(mockGetUsersTailoredCvs).toHaveBeenCalledTimes(1);
            });

            expect(mockGetUsersTailoredCvs).toHaveBeenCalledWith('mock-token-123');
        });

        it('should not call service method multiple times on re-renders', async () => {
            mockGetUsersTailoredCvs.mockResolvedValue(mockTailoredCVs);

            const { rerender } = renderHook(() => useUsersTailoredCVs());

            await waitFor(() => {
                expect(mockGetUsersTailoredCvs).toHaveBeenCalledTimes(1);
            });

            // Re-render the hook
            rerender();

            // Should still only be called once
            expect(mockGetUsersTailoredCvs).toHaveBeenCalledTimes(1);
        });
    });

    describe('return value structure', () => {
        it('should return the correct structure', async () => {
            mockGetUsersTailoredCvs.mockResolvedValue(mockTailoredCVs);

            const { result } = renderHook(() => useUsersTailoredCVs());

            await waitFor(() => {
                expect(result.current.isLoading).toBe(false);
            });

            expect(result.current).toHaveProperty('tailoredCVs');
            expect(result.current).toHaveProperty('isLoading');
            expect(result.current).toHaveProperty('error');
            expect(Array.isArray(result.current.tailoredCVs)).toBe(true);
            expect(typeof result.current.isLoading).toBe('boolean');
            expect(typeof result.current.error).toBe('string');
        });
    });
});