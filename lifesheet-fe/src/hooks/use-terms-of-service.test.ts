import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook, waitFor, act } from '@testing-library/react';
import { useTermsOfService } from './use-terms-of-service';
import { getTermsOfService, acceptTermsOfService, type GetTermsOfServiceResponse } from '@/services/user-service';
import { useAuth } from './auth-hook';

// Mock the user service functions
vi.mock('@/services/user-service', () => ({
    getTermsOfService: vi.fn(),
    acceptTermsOfService: vi.fn(),
}));

// Mock the auth hook
vi.mock('./auth-hook', () => ({
    useAuth: vi.fn(),
}));

describe('useTermsOfService', () => {
    const mockGetTermsOfService = vi.mocked(getTermsOfService);
    const mockAcceptTermsOfService = vi.mocked(acceptTermsOfService);
    const mockUseAuth = vi.mocked(useAuth);

    const mockAccessToken = 'mock-auth-token';

    const mockTermsResponse: GetTermsOfServiceResponse = {
        accepted: true,
        version: '1.2.0',
        content: 'Terms of Service content...',
        lastAcceptedVersion: '1.1.0',
    };

    beforeEach(() => {
        vi.clearAllMocks();

        // Default mock for useAuth
        mockUseAuth.mockReturnValue({
            isAuthenticated: true,
            user: {},
            loginWithRedirect: vi.fn(),
            logout: vi.fn(),
            getAccessTokenSilently: vi.fn().mockResolvedValue(mockAccessToken),
        });
    });

    afterEach(() => {
        vi.restoreAllMocks();
    });

    describe('initial state', () => {
        it('should initialize with correct default values', () => {
            mockGetTermsOfService.mockResolvedValue(mockTermsResponse);

            const { result } = renderHook(() => useTermsOfService());

            expect(result.current.contents).toBe('');
            expect(result.current.isAccepted).toBe(false);
            expect(result.current.version).toBe('');
            expect(result.current.lastAcceptedVersion).toBe('');
            expect(result.current.error).toBeNull();
            expect(result.current.isLoading).toBe(true);
            expect(typeof result.current.acceptTerms).toBe('function');
            expect(typeof result.current.refetch).toBe('function');
        });
    });

    describe('fetching terms', () => {
        it('should fetch terms successfully', async () => {
            mockGetTermsOfService.mockResolvedValue(mockTermsResponse);

            const { result } = renderHook(() => useTermsOfService());

            await waitFor(() => {
                expect(result.current.isLoading).toBe(false);
            });

            expect(result.current.contents).toBe('Terms of Service content...');
            expect(result.current.isAccepted).toBe(true);
            expect(result.current.version).toBe('1.2.0');
            expect(result.current.lastAcceptedVersion).toBe('1.1.0');
            expect(result.current.error).toBeNull();
            expect(mockGetTermsOfService).toHaveBeenCalledWith(mockAccessToken);
        });

        it('should handle fetch error', async () => {
            const error = new Error('Network error');
            mockGetTermsOfService.mockRejectedValue(error);

            const { result } = renderHook(() => useTermsOfService());

            await waitFor(() => {
                expect(result.current.isLoading).toBe(false);
            });

            expect(result.current.error).toBe('Network error');
            expect(result.current.contents).toBe('');
            expect(result.current.isAccepted).toBe(false);
        });

        it('should handle fetch error with string', async () => {
            const error = 'String error';
            mockGetTermsOfService.mockRejectedValue(error);

            const { result } = renderHook(() => useTermsOfService());

            await waitFor(() => {
                expect(result.current.isLoading).toBe(false);
            });

            expect(result.current.error).toBe('Failed to fetch terms of service');
        });

        it('should handle fetch error with null/undefined', async () => {
            mockGetTermsOfService.mockRejectedValue(null);

            const { result } = renderHook(() => useTermsOfService());

            await waitFor(() => {
                expect(result.current.isLoading).toBe(false);
            });

            expect(result.current.error).toBe('Failed to fetch terms of service');
        });
    });

    describe('accepting terms', () => {
        it('should accept terms successfully', async () => {
            mockGetTermsOfService.mockResolvedValue(mockTermsResponse);
            mockAcceptTermsOfService.mockResolvedValue(undefined);

            const { result } = renderHook(() => useTermsOfService());

            await waitFor(() => {
                expect(result.current.isLoading).toBe(false);
            });

            await act(async () => {
                await result.current.acceptTerms('1.2.0');
            });

            expect(mockAcceptTermsOfService).toHaveBeenCalledWith(mockAccessToken, '1.2.0');
            expect(mockGetTermsOfService).toHaveBeenCalledTimes(2); // Once for initial fetch, once after acceptance
        });

        it('should handle accept error', async () => {
            mockGetTermsOfService.mockResolvedValue(mockTermsResponse);
            const acceptError = new Error('Accept failed');
            mockAcceptTermsOfService.mockRejectedValue(acceptError);

            const { result } = renderHook(() => useTermsOfService());

            await waitFor(() => {
                expect(result.current.isLoading).toBe(false);
            });

            await act(async () => {
                try {
                    await result.current.acceptTerms('1.2.0');
                } catch (error) {
                    // Expected to throw
                }
            });

            expect(result.current.error).toBe('Accept failed');
        });

        it('should handle accept error with string', async () => {
            mockGetTermsOfService.mockResolvedValue(mockTermsResponse);
            mockAcceptTermsOfService.mockRejectedValue('String error');

            const { result } = renderHook(() => useTermsOfService());

            await waitFor(() => {
                expect(result.current.isLoading).toBe(false);
            });

            await act(async () => {
                try {
                    await result.current.acceptTerms('1.2.0');
                } catch (error) {
                    // Expected to throw
                }
            });

            expect(result.current.error).toBe('Failed to accept terms of service');
        });

        it('should set loading state during acceptance', async () => {
            mockGetTermsOfService.mockResolvedValue(mockTermsResponse);
            // Delay the accept call to test loading state
            mockAcceptTermsOfService.mockImplementation(() =>
                new Promise(resolve => setTimeout(resolve, 100))
            );

            const { result } = renderHook(() => useTermsOfService());

            await waitFor(() => {
                expect(result.current.isLoading).toBe(false);
            });

            act(() => {
                result.current.acceptTerms('1.2.0');
            });

            expect(result.current.isLoading).toBe(true);

            await waitFor(() => {
                expect(result.current.isLoading).toBe(false);
            });
        });
    });

    describe('refetch functionality', () => {
        it('should refetch terms successfully', async () => {
            mockGetTermsOfService.mockResolvedValue(mockTermsResponse);

            const { result } = renderHook(() => useTermsOfService());

            await waitFor(() => {
                expect(result.current.isLoading).toBe(false);
            });

            const updatedResponse = { ...mockTermsResponse, version: '1.3.0' };
            mockGetTermsOfService.mockResolvedValue(updatedResponse);

            await act(async () => {
                await result.current.refetch();
            });

            expect(result.current.version).toBe('1.3.0');
            expect(mockGetTermsOfService).toHaveBeenCalledTimes(2);
        });

        it('should handle refetch error', async () => {
            mockGetTermsOfService.mockResolvedValue(mockTermsResponse);

            const { result } = renderHook(() => useTermsOfService());

            await waitFor(() => {
                expect(result.current.isLoading).toBe(false);
            });

            const refetchError = new Error('Refetch failed');
            mockGetTermsOfService.mockRejectedValue(refetchError);

            await act(async () => {
                await result.current.refetch();
            });

            expect(result.current.error).toBe('Refetch failed');
        });
    });

    describe('different terms scenarios', () => {
        it('should handle not accepted terms', async () => {
            const notAcceptedResponse = {
                accepted: false,
                version: '1.3.0',
                content: 'Updated terms content',
                lastAcceptedVersion: '1.1.0',
            };
            mockGetTermsOfService.mockResolvedValue(notAcceptedResponse);

            const { result } = renderHook(() => useTermsOfService());

            await waitFor(() => {
                expect(result.current.isLoading).toBe(false);
            });

            expect(result.current.isAccepted).toBe(false);
            expect(result.current.version).toBe('1.3.0');
            expect(result.current.contents).toBe('Updated terms content');
            expect(result.current.lastAcceptedVersion).toBe('1.1.0');
        });

        it('should handle empty content', async () => {
            const emptyContentResponse = {
                accepted: false,
                version: '1.0.0',
                content: '',
                lastAcceptedVersion: '',
            };
            mockGetTermsOfService.mockResolvedValue(emptyContentResponse);

            const { result } = renderHook(() => useTermsOfService());

            await waitFor(() => {
                expect(result.current.isLoading).toBe(false);
            });

            expect(result.current.contents).toBe('');
            expect(result.current.lastAcceptedVersion).toBe('');
        });

        it('should handle different version formats', async () => {
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
                    content: 'Major update',
                    lastAcceptedVersion: '1.0.0',
                },
                {
                    accepted: true,
                    version: '1.5.0-beta.1',
                    content: 'Beta terms',
                    lastAcceptedVersion: '1.5.0-beta.1',
                },
            ];

            for (const scenario of versionScenarios) {
                mockGetTermsOfService.mockResolvedValue(scenario);

                const { result } = renderHook(() => useTermsOfService());

                await waitFor(() => {
                    expect(result.current.isLoading).toBe(false);
                });

                expect(result.current.version).toBe(scenario.version);
                expect(result.current.isAccepted).toBe(scenario.accepted);
                expect(result.current.contents).toBe(scenario.content);
                expect(result.current.lastAcceptedVersion).toBe(scenario.lastAcceptedVersion);
            }
        });
    });

    describe('loading states', () => {
        it('should set loading to true initially', () => {
            mockGetTermsOfService.mockResolvedValue(mockTermsResponse);

            const { result } = renderHook(() => useTermsOfService());

            expect(result.current.isLoading).toBe(true);
        });

        it('should set loading to false after successful fetch', async () => {
            mockGetTermsOfService.mockResolvedValue(mockTermsResponse);

            const { result } = renderHook(() => useTermsOfService());

            await waitFor(() => {
                expect(result.current.isLoading).toBe(false);
            });
        });

        it('should set loading to false after error', async () => {
            const error = new Error('Test error');
            mockGetTermsOfService.mockRejectedValue(error);

            const { result } = renderHook(() => useTermsOfService());

            await waitFor(() => {
                expect(result.current.isLoading).toBe(false);
            });
        });
    });

    describe('error handling', () => {
        it('should clear error on successful fetch after error', async () => {
            const error = new Error('Initial error');
            mockGetTermsOfService.mockRejectedValueOnce(error);

            const { result } = renderHook(() => useTermsOfService());

            await waitFor(() => {
                expect(result.current.error).toBe('Initial error');
            });

            mockGetTermsOfService.mockResolvedValue(mockTermsResponse);

            await act(async () => {
                await result.current.refetch();
            });

            expect(result.current.error).toBeNull();
        });

        it('should clear error on successful accept after error', async () => {
            mockGetTermsOfService.mockResolvedValue(mockTermsResponse);
            const acceptError = new Error('Accept error');
            mockAcceptTermsOfService.mockRejectedValueOnce(acceptError);

            const { result } = renderHook(() => useTermsOfService());

            await waitFor(() => {
                expect(result.current.isLoading).toBe(false);
            });

            await act(async () => {
                try {
                    await result.current.acceptTerms('1.2.0');
                } catch (error) {
                    // Expected to throw
                }
            });

            expect(result.current.error).toBe('Accept error');

            // Now mock successful accept
            mockAcceptTermsOfService.mockResolvedValue(undefined);

            await act(async () => {
                await result.current.acceptTerms('1.2.0');
            });

            expect(result.current.error).toBeNull();
        });
    });

    describe('return structure', () => {
        it('should return the correct structure', () => {
            mockGetTermsOfService.mockResolvedValue(mockTermsResponse);

            const { result } = renderHook(() => useTermsOfService());

            expect(result.current).toHaveProperty('contents');
            expect(result.current).toHaveProperty('isAccepted');
            expect(result.current).toHaveProperty('version');
            expect(result.current).toHaveProperty('lastAcceptedVersion');
            expect(result.current).toHaveProperty('error');
            expect(result.current).toHaveProperty('isLoading');
            expect(result.current).toHaveProperty('acceptTerms');
            expect(result.current).toHaveProperty('refetch');

            expect(typeof result.current.contents).toBe('string');
            expect(typeof result.current.isAccepted).toBe('boolean');
            expect(typeof result.current.version).toBe('string');
            expect(typeof result.current.lastAcceptedVersion).toBe('string');
            expect(typeof result.current.error).toBe('object'); // null is typeof 'object'
            expect(typeof result.current.isLoading).toBe('boolean');
            expect(typeof result.current.acceptTerms).toBe('function');
            expect(typeof result.current.refetch).toBe('function');
        });
    });
});
