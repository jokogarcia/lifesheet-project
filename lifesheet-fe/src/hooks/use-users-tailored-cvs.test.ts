import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { useUsersTailoredCVs } from './use-users-tailored-cvs';
import { cvsService, type CVListItem } from '@/services/cvs-service';

// Mock the CVs service
vi.mock('@/services/cvs-service', () => ({
    cvsService: {
        getUsersTailoredCvs: vi.fn(),
    },
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
        updatedAt: '2023-11-15T00:00:00Z',
        hasCoverLetter: false,
        companyName: 'Startup Inc',
    },
    {
        _id: 'cv-3',
        updatedAt: '2023-10-30T00:00:00Z',
        hasCoverLetter: true,
        companyName: 'Enterprise Ltd',
    },
];

describe('useUsersTailoredCVs', () => {
    beforeEach(() => {
        vi.clearAllMocks();
        // Mock console.error to avoid noise in tests
        vi.spyOn(console, 'error').mockImplementation(() => {});
    });

    afterEach(() => {
        vi.restoreAllMocks();
    });

    describe('initial state', () => {
        it('should initialize with correct default values', () => {
            vi.mocked(cvsService.getUsersTailoredCvs).mockResolvedValue([]);

            const { result } = renderHook(() => useUsersTailoredCVs());

            expect(result.current.tailoredCVs).toEqual([]);
            expect(result.current.isLoading).toBe(true);
            expect(result.current.error).toBe('');
        });
    });

    describe('fetching tailored CVs', () => {
        it('should fetch tailored CVs successfully', async () => {
            vi.mocked(cvsService.getUsersTailoredCvs).mockResolvedValue(mockTailoredCVs);

            const { result } = renderHook(() => useUsersTailoredCVs());

            expect(result.current.isLoading).toBe(true);
            expect(result.current.tailoredCVs).toEqual([]);
            expect(result.current.error).toBe('');

            await waitFor(() => {
                expect(result.current.isLoading).toBe(false);
            });

            expect(result.current.tailoredCVs).toEqual(mockTailoredCVs);
            expect(result.current.error).toBe('');
            expect(cvsService.getUsersTailoredCvs).toHaveBeenCalledTimes(1);
        });

        it('should handle empty tailored CVs list', async () => {
            vi.mocked(cvsService.getUsersTailoredCvs).mockResolvedValue([]);

            const { result } = renderHook(() => useUsersTailoredCVs());

            await waitFor(() => {
                expect(result.current.isLoading).toBe(false);
            });

            expect(result.current.tailoredCVs).toEqual([]);
            expect(result.current.error).toBe('');
        });

        it('should handle single tailored CV', async () => {
            const singleCV = [mockTailoredCVs[0]];
            vi.mocked(cvsService.getUsersTailoredCvs).mockResolvedValue(singleCV);

            const { result } = renderHook(() => useUsersTailoredCVs());

            await waitFor(() => {
                expect(result.current.isLoading).toBe(false);
            });

            expect(result.current.tailoredCVs).toEqual(singleCV);
            expect(result.current.tailoredCVs).toHaveLength(1);
        });
    });

    describe('error handling', () => {
        it('should handle fetch error with Error object', async () => {
            const error = new Error('Network error');
            vi.mocked(cvsService.getUsersTailoredCvs).mockRejectedValue(error);

            const { result } = renderHook(() => useUsersTailoredCVs());

            expect(result.current.isLoading).toBe(true);

            await waitFor(() => {
                expect(result.current.isLoading).toBe(false);
            });

            expect(result.current.tailoredCVs).toEqual([]);
            expect(result.current.error).toBe('Error fetching tailored CVs');
            expect(console.error).toHaveBeenCalledWith('Error fetching tailored CVs:', error);
        });

        it('should handle fetch error with string', async () => {
            const error = 'String error';
            vi.mocked(cvsService.getUsersTailoredCvs).mockRejectedValue(error);

            const { result } = renderHook(() => useUsersTailoredCVs());

            await waitFor(() => {
                expect(result.current.isLoading).toBe(false);
            });

            expect(result.current.error).toBe('Error fetching tailored CVs');
            expect(console.error).toHaveBeenCalledWith('Error fetching tailored CVs:', error);
        });

        it('should handle fetch error with null/undefined', async () => {
            vi.mocked(cvsService.getUsersTailoredCvs).mockRejectedValue(null);

            const { result } = renderHook(() => useUsersTailoredCVs());

            await waitFor(() => {
                expect(result.current.isLoading).toBe(false);
            });

            expect(result.current.error).toBe('Error fetching tailored CVs');
            expect(console.error).toHaveBeenCalledWith('Error fetching tailored CVs:', null);
        });

        it('should handle API timeout error', async () => {
            const timeoutError = new Error('Request timeout');
            timeoutError.name = 'TimeoutError';
            vi.mocked(cvsService.getUsersTailoredCvs).mockRejectedValue(timeoutError);

            const { result } = renderHook(() => useUsersTailoredCVs());

            await waitFor(() => {
                expect(result.current.isLoading).toBe(false);
            });

            expect(result.current.error).toBe('Error fetching tailored CVs');
            expect(console.error).toHaveBeenCalledWith('Error fetching tailored CVs:', timeoutError);
        });

        it('should handle 404 error', async () => {
            const notFoundError = new Error('Not Found');
            notFoundError.name = 'NotFoundError';
            vi.mocked(cvsService.getUsersTailoredCvs).mockRejectedValue(notFoundError);

            const { result } = renderHook(() => useUsersTailoredCVs());

            await waitFor(() => {
                expect(result.current.isLoading).toBe(false);
            });

            expect(result.current.error).toBe('Error fetching tailored CVs');
        });

        it('should handle 500 server error', async () => {
            const serverError = new Error('Internal Server Error');
            serverError.name = 'ServerError';
            vi.mocked(cvsService.getUsersTailoredCvs).mockRejectedValue(serverError);

            const { result } = renderHook(() => useUsersTailoredCVs());

            await waitFor(() => {
                expect(result.current.isLoading).toBe(false);
            });

            expect(result.current.error).toBe('Error fetching tailored CVs');
        });
    });

    describe('loading states', () => {
        it('should set loading to true initially', () => {
            vi.mocked(cvsService.getUsersTailoredCvs).mockResolvedValue([]);

            const { result } = renderHook(() => useUsersTailoredCVs());

            expect(result.current.isLoading).toBe(true);
        });

        it('should set loading to false after successful fetch', async () => {
            vi.mocked(cvsService.getUsersTailoredCvs).mockResolvedValue(mockTailoredCVs);

            const { result } = renderHook(() => useUsersTailoredCVs());

            await waitFor(() => {
                expect(result.current.isLoading).toBe(false);
            });

            expect(result.current.isLoading).toBe(false);
        });

        it('should set loading to false after error', async () => {
            const error = new Error('Fetch failed');
            vi.mocked(cvsService.getUsersTailoredCvs).mockRejectedValue(error);

            const { result } = renderHook(() => useUsersTailoredCVs());

            await waitFor(() => {
                expect(result.current.isLoading).toBe(false);
            });

            expect(result.current.isLoading).toBe(false);
        });

        it('should maintain loading state during async operation', async () => {
            // Create a promise that we can control
            let resolvePromise: (value: CVListItem[]) => void;
            const controlledPromise = new Promise<CVListItem[]>((resolve) => {
                resolvePromise = resolve;
            });
            vi.mocked(cvsService.getUsersTailoredCvs).mockReturnValue(controlledPromise);

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
                    _id: 'cv-complete',
                    updatedAt: '2023-12-01T00:00:00Z',
                    hasCoverLetter: true,
                    companyName: 'Complete Corp',
                },
            ];
            vi.mocked(cvsService.getUsersTailoredCvs).mockResolvedValue(completeCVs);

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
                    companyName: 'With Cover Corp',
                },
                {
                    _id: 'cv-without-cover',
                    updatedAt: '2023-11-01T00:00:00Z',
                    hasCoverLetter: false,
                    companyName: 'Without Cover Inc',
                },
            ];
            vi.mocked(cvsService.getUsersTailoredCvs).mockResolvedValue(cvsWithCoverLetters);

            const { result } = renderHook(() => useUsersTailoredCVs());

            await waitFor(() => {
                expect(result.current.isLoading).toBe(false);
            });

            expect(result.current.tailoredCVs[0].hasCoverLetter).toBe(true);
            expect(result.current.tailoredCVs[1].hasCoverLetter).toBe(false);
        });
    });

    describe('edge cases', () => {
        it('should handle very large dataset', async () => {
            const largeDataset: CVListItem[] = Array.from({ length: 1000 }, (_, index) => ({
                _id: `cv-${index}`,
                updatedAt: '2023-12-01T00:00:00Z',
                hasCoverLetter: index % 2 === 0,
                companyName: `Company ${index}`,
            }));
            vi.mocked(cvsService.getUsersTailoredCvs).mockResolvedValue(largeDataset);

            const { result } = renderHook(() => useUsersTailoredCVs());

            await waitFor(() => {
                expect(result.current.isLoading).toBe(false);
            });

            expect(result.current.tailoredCVs).toEqual(largeDataset);
            expect(result.current.tailoredCVs).toHaveLength(1000);
        });

        it('should handle CVs with special characters in company names', async () => {
            const specialCharCVs: CVListItem[] = [
                {
                    _id: 'cv-special-1',
                    updatedAt: '2023-12-01T00:00:00Z',
                    hasCoverLetter: true,
                    companyName: 'Company & Co. (Ltd.)',
                },
                {
                    _id: 'cv-special-2',
                    updatedAt: '2023-11-01T00:00:00Z',
                    hasCoverLetter: false,
                    companyName: 'Tech@Corp!',
                },
                {
                    _id: 'cv-special-3',
                    updatedAt: '2023-10-01T00:00:00Z',
                    hasCoverLetter: true,
                    companyName: 'Unicode™ Company',
                },
            ];
            vi.mocked(cvsService.getUsersTailoredCvs).mockResolvedValue(specialCharCVs);

            const { result } = renderHook(() => useUsersTailoredCVs());

            await waitFor(() => {
                expect(result.current.isLoading).toBe(false);
            });

            expect(result.current.tailoredCVs).toEqual(specialCharCVs);
            expect(result.current.tailoredCVs[0].companyName).toBe('Company & Co. (Ltd.)');
            expect(result.current.tailoredCVs[1].companyName).toBe('Tech@Corp!');
            expect(result.current.tailoredCVs[2].companyName).toBe('Unicode™ Company');
        });

        it('should handle CVs with very long company names', async () => {
            const longNameCVs: CVListItem[] = [
                {
                    _id: 'cv-long-name',
                    updatedAt: '2023-12-01T00:00:00Z',
                    hasCoverLetter: true,
                    companyName: 'A'.repeat(1000), // Very long company name
                },
            ];
            vi.mocked(cvsService.getUsersTailoredCvs).mockResolvedValue(longNameCVs);

            const { result } = renderHook(() => useUsersTailoredCVs());

            await waitFor(() => {
                expect(result.current.isLoading).toBe(false);
            });

            expect(result.current.tailoredCVs).toEqual(longNameCVs);
            expect(result.current.tailoredCVs[0].companyName).toHaveLength(1000);
        });

        it('should handle CVs with empty company names', async () => {
            const emptyNameCVs: CVListItem[] = [
                {
                    _id: 'cv-empty-name',
                    updatedAt: '2023-12-01T00:00:00Z',
                    hasCoverLetter: true,
                    companyName: '',
                },
            ];
            vi.mocked(cvsService.getUsersTailoredCvs).mockResolvedValue(emptyNameCVs);

            const { result } = renderHook(() => useUsersTailoredCVs());

            await waitFor(() => {
                expect(result.current.isLoading).toBe(false);
            });

            expect(result.current.tailoredCVs).toEqual(emptyNameCVs);
            expect(result.current.tailoredCVs[0].companyName).toBe('');
        });

        it('should handle multiple hook instances', async () => {
            vi.mocked(cvsService.getUsersTailoredCvs).mockResolvedValue(mockTailoredCVs);

            const { result: result1 } = renderHook(() => useUsersTailoredCVs());
            const { result: result2 } = renderHook(() => useUsersTailoredCVs());

            await waitFor(() => {
                expect(result1.current.isLoading).toBe(false);
                expect(result2.current.isLoading).toBe(false);
            });

            expect(result1.current.tailoredCVs).toEqual(mockTailoredCVs);
            expect(result2.current.tailoredCVs).toEqual(mockTailoredCVs);
            // Each hook instance should call the service independently
            expect(cvsService.getUsersTailoredCvs).toHaveBeenCalledTimes(2);
        });
    });

    describe('service integration', () => {
        it('should call the correct service method', async () => {
            vi.mocked(cvsService.getUsersTailoredCvs).mockResolvedValue(mockTailoredCVs);

            renderHook(() => useUsersTailoredCVs());

            await waitFor(() => {
                expect(cvsService.getUsersTailoredCvs).toHaveBeenCalledTimes(1);
            });

            expect(cvsService.getUsersTailoredCvs).toHaveBeenCalledWith();
        });

        it('should not call service method multiple times on re-renders', async () => {
            vi.mocked(cvsService.getUsersTailoredCvs).mockResolvedValue(mockTailoredCVs);

            const { rerender } = renderHook(() => useUsersTailoredCVs());

            await waitFor(() => {
                expect(cvsService.getUsersTailoredCvs).toHaveBeenCalledTimes(1);
            });

            // Re-render the hook
            rerender();

            // Should not call the service again
            expect(cvsService.getUsersTailoredCvs).toHaveBeenCalledTimes(1);
        });
    });

    describe('return value structure', () => {
        it('should return the correct structure', async () => {
            vi.mocked(cvsService.getUsersTailoredCvs).mockResolvedValue(mockTailoredCVs);

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

