import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { useSaasPlans, useSaaSActiveSubscription } from './use-saas';
import { type SaaSPlan, type SaaSSubscription } from '@/services/saas-service';
import * as SaasService from '@/services/saas-service';
import { useAuth } from './auth-hook';

// Mock the SaaS service functions
vi.mock('@/services/saas-service', () => ({
    getSaaSPlans: vi.fn(),
    getActiveSubscription: vi.fn(),
}));

// Mock the auth hook
vi.mock('./auth-hook', () => ({
    useAuth: vi.fn(),
}));

// Mock the language context
const mockLanguageContext = {
    currentLanguage: 'en',
    setLanguage: vi.fn(),
};

vi.mock('@/contexts/language-context', () => ({
    useLanguage: () => mockLanguageContext,
}));

describe('useSaasPlans', () => {
    const mockPlans: SaaSPlan[] = [
        {
            _id: 'plan1',
            name: 'Basic Plan',
            days: 30,
            description: 'Basic features',
            priceCents: 999,
            currency: 'USD',
            iconUrl: '/icon1.png',
            features: ['Feature 1', 'Feature 2'],
            dailyRateLimit: 10,
            weeklyRateLimit: 50,
            createdAt: new Date('2023-01-01'),
            updatedAt: new Date('2023-01-01'),
        },
        {
            _id: 'plan2',
            name: 'Premium Plan',
            days: 365,
            description: 'Premium features',
            priceCents: 4999,
            currency: 'USD',
            iconUrl: '/icon2.png',
            features: ['Feature 1', 'Feature 2', 'Feature 3'],
            dailyRateLimit: -1,
            weeklyRateLimit: -1,
            createdAt: new Date('2023-01-01'),
            updatedAt: new Date('2023-01-01'),
        },
    ];

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

    it('should fetch SaaS plans successfully', async () => {
        vi.mocked(SaasService.getSaaSPlans).mockResolvedValue(mockPlans);

        const { result } = renderHook(() => useSaasPlans());

        expect(result.current.isLoading).toBe(true);
        expect(result.current.saasPlans).toEqual([]);
        expect(result.current.error).toBeNull();

        await waitFor(() => {
            expect(result.current.isLoading).toBe(false);
        });

        expect(result.current.saasPlans).toEqual(mockPlans);
        expect(result.current.error).toBeNull();
        expect(SaasService.getSaaSPlans).toHaveBeenCalledWith('en', 'mock-token-123');
    });

    it('should handle API errors gracefully', async () => {
        const error = new Error('API Error');
        vi.mocked(SaasService.getSaaSPlans).mockRejectedValue(error);

        const { result } = renderHook(() => useSaasPlans());

        expect(result.current.isLoading).toBe(true);
        expect(result.current.error).toBeNull();

        await waitFor(() => {
            expect(result.current.isLoading).toBe(false);
        });

        expect(result.current.saasPlans).toEqual([]);
        expect(result.current.error).toBe('API Error');
        expect(SaasService.getSaaSPlans).toHaveBeenCalledWith('en', 'mock-token-123');
    });

    it('should refetch plans when language changes', async () => {
        vi.mocked(SaasService.getSaaSPlans).mockResolvedValue(mockPlans);

        const { result, rerender } = renderHook(() => useSaasPlans());

        await waitFor(() => {
            expect(result.current.isLoading).toBe(false);
        });

        expect(result.current.error).toBeNull();

        // Change language
        mockLanguageContext.currentLanguage = 'de';
        rerender();

        await waitFor(() => {
            expect(SaasService.getSaaSPlans).toHaveBeenCalledWith('de', 'mock-token-123');
        });

        expect(SaasService.getSaaSPlans).toHaveBeenCalledTimes(2);
    });

    it('should return empty array when no plans are available', async () => {
        vi.mocked(SaasService.getSaaSPlans).mockResolvedValue([]);

        const { result } = renderHook(() => useSaasPlans());

        await waitFor(() => {
            expect(result.current.isLoading).toBe(false);
        });

        expect(result.current.saasPlans).toEqual([]);
        expect(result.current.error).toBeNull();
    });

    it('should clear error when refetching after an error', async () => {
        // First, cause an error
        const error = new Error('API Error');
        vi.mocked(SaasService.getSaaSPlans).mockRejectedValueOnce(error);

        const { result } = renderHook(() => useSaasPlans());

        await waitFor(() => {
            expect(result.current.isLoading).toBe(false);
        });

        expect(result.current.error).toBe('API Error');

        // Now mock a successful response for the next call
        vi.mocked(SaasService.getSaaSPlans).mockResolvedValue(mockPlans);

        // Create a new hook instance with different language to trigger refetch
        mockLanguageContext.currentLanguage = 'de';
        const { result: newResult } = renderHook(() => useSaasPlans());

        await waitFor(() => {
            expect(newResult.current.isLoading).toBe(false);
        });

        // The new instance should have no error and successful data
        expect(newResult.current.error).toBeNull();
        expect(newResult.current.saasPlans).toEqual(mockPlans);
    });

    it('should handle non-Error objects in catch block', async () => {
        // Mock a non-Error object being thrown
        vi.mocked(SaasService.getSaaSPlans).mockRejectedValue('String error');

        const { result } = renderHook(() => useSaasPlans());

        await waitFor(() => {
            expect(result.current.isLoading).toBe(false);
        });

        expect(result.current.error).toBe('Failed to fetch SaaS plans');
    });
});

describe('useSaaSActiveSubscription', () => {
    const mockActiveSubscription: SaaSSubscription = {
        _id: 'sub1',
        userId: 'user123',
        startDate: '2023-01-01',
        endDate: '2023-12-31',
        planId: 'plan1',
    };

    const mockActiveSubscriptionResponse = {
        activeSubscription: mockActiveSubscription,
        todaysConsumptions: 5,
        thisWeeksConsumptions: 20,
        dailyRateLimit: 10,
        weeklyRateLimit: 50,
    };

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

    it('should fetch active subscription successfully', async () => {
        vi.mocked(SaasService.getActiveSubscription).mockResolvedValue(mockActiveSubscriptionResponse);

        const { result } = renderHook(() => useSaaSActiveSubscription());

        expect(result.current.isLoading).toBe(true);
        expect(result.current.activeSubscription).toBeNull();
        expect(result.current.todaysConsumptions).toBe(0);
        expect(result.current.thisWeeksConsumptions).toBe(0);
        expect(result.current.canUseAI).toBe(false);
        expect(result.current.error).toBeNull();

        await waitFor(() => {
            expect(result.current.isLoading).toBe(false);
        });

        expect(result.current.activeSubscription).toEqual(mockActiveSubscription);
        expect(result.current.todaysConsumptions).toBe(5);
        expect(result.current.thisWeeksConsumptions).toBe(20);
        expect(result.current.canUseAI).toBe(true); // 5 < 10 and 20 < 50
        expect(result.current.error).toBeNull();
        expect(SaasService.getActiveSubscription).toHaveBeenCalledWith('mock-token-123');
    });

    it('should calculate canUseAI correctly when within limits', async () => {
        const response = {
            ...mockActiveSubscriptionResponse,
            todaysConsumptions: 3,
            thisWeeksConsumptions: 15,
            dailyRateLimit: 10,
            weeklyRateLimit: 50,
        };
        vi.mocked(SaasService.getActiveSubscription).mockResolvedValue(response);

        const { result } = renderHook(() => useSaaSActiveSubscription());

        await waitFor(() => {
            expect(result.current.isLoading).toBe(false);
        });

        expect(result.current.canUseAI).toBe(true);
    });

    it('should calculate canUseAI correctly when daily limit exceeded', async () => {
        const response = {
            ...mockActiveSubscriptionResponse,
            todaysConsumptions: 15,
            thisWeeksConsumptions: 20,
            dailyRateLimit: 10,
            weeklyRateLimit: 50,
        };
        vi.mocked(SaasService.getActiveSubscription).mockResolvedValue(response);

        const { result } = renderHook(() => useSaaSActiveSubscription());

        await waitFor(() => {
            expect(result.current.isLoading).toBe(false);
        });

        expect(result.current.canUseAI).toBe(false);
    });

    it('should calculate canUseAI correctly when weekly limit exceeded', async () => {
        const response = {
            ...mockActiveSubscriptionResponse,
            todaysConsumptions: 5,
            thisWeeksConsumptions: 60,
            dailyRateLimit: 10,
            weeklyRateLimit: 50,
        };
        vi.mocked(SaasService.getActiveSubscription).mockResolvedValue(response);

        const { result } = renderHook(() => useSaaSActiveSubscription());

        await waitFor(() => {
            expect(result.current.isLoading).toBe(false);
        });

        expect(result.current.canUseAI).toBe(false);
    });

    it('should handle unlimited daily rate limit', async () => {
        const response = {
            ...mockActiveSubscriptionResponse,
            todaysConsumptions: 100,
            thisWeeksConsumptions: 20,
            dailyRateLimit: -1,
            weeklyRateLimit: 50,
        };
        vi.mocked(SaasService.getActiveSubscription).mockResolvedValue(response);

        const { result } = renderHook(() => useSaaSActiveSubscription());

        await waitFor(() => {
            expect(result.current.isLoading).toBe(false);
        });

        // dailyRateLimit !== -1 means unlimited, so canUseAI should be true
        expect(result.current.canUseAI).toBe(true);
    });

    it('should handle unlimited weekly rate limit', async () => {
        const response = {
            ...mockActiveSubscriptionResponse,
            todaysConsumptions: 5,
            thisWeeksConsumptions: 1000,
            dailyRateLimit: 10,
            weeklyRateLimit: -1,
        };
        vi.mocked(SaasService.getActiveSubscription).mockResolvedValue(response);

        const { result } = renderHook(() => useSaaSActiveSubscription());

        await waitFor(() => {
            expect(result.current.isLoading).toBe(false);
        });

        expect(result.current.canUseAI).toBe(true); // Daily within limit, weekly unlimited
    });

    it('should handle both unlimited rate limits', async () => {
        const response = {
            ...mockActiveSubscriptionResponse,
            todaysConsumptions: 1000,
            thisWeeksConsumptions: 10000,
            dailyRateLimit: -1,
            weeklyRateLimit: -1,
        };
        vi.mocked(SaasService.getActiveSubscription).mockResolvedValue(response);

        const { result } = renderHook(() => useSaaSActiveSubscription());

        await waitFor(() => {
            expect(result.current.isLoading).toBe(false);
        });

        expect(result.current.canUseAI).toBe(true);
    });

    it('should handle API errors gracefully', async () => {
        const error = new Error('API Error');
        vi.mocked(SaasService.getActiveSubscription).mockRejectedValue(error);

        const { result } = renderHook(() => useSaaSActiveSubscription());

        expect(result.current.isLoading).toBe(true);
        expect(result.current.error).toBeNull();

        await waitFor(() => {
            expect(result.current.isLoading).toBe(false);
        });

        expect(result.current.activeSubscription).toBeNull();
        expect(result.current.todaysConsumptions).toBe(0);
        expect(result.current.thisWeeksConsumptions).toBe(0);
        expect(result.current.canUseAI).toBe(false);
        expect(result.current.error).toBe('API Error');
    });

    it('should handle null active subscription', async () => {
        const response = {
            activeSubscription: null,
            todaysConsumptions: 0,
            thisWeeksConsumptions: 0,
            dailyRateLimit: 0,
            weeklyRateLimit: 0,
        };
        //@ts-ignore
        vi.mocked(SaasService.getActiveSubscription).mockResolvedValue(response);

        const { result } = renderHook(() => useSaaSActiveSubscription());

        await waitFor(() => {
            expect(result.current.isLoading).toBe(false);
        });

        expect(result.current.activeSubscription).toBeNull();
        expect(result.current.canUseAI).toBe(false);
    });

    it('should only fetch once on mount', async () => {
        vi.mocked(SaasService.getActiveSubscription).mockResolvedValue(mockActiveSubscriptionResponse);

        const { result } = renderHook(() => useSaaSActiveSubscription());

        await waitFor(() => {
            expect(result.current.isLoading).toBe(false);
        });

        // The hook has no dependencies, so it only fetches once on mount
        expect(SaasService.getActiveSubscription).toHaveBeenCalledTimes(1);
    });

    it('should handle edge case with zero rate limits', async () => {
        const response = {
            ...mockActiveSubscriptionResponse,
            todaysConsumptions: 0,
            thisWeeksConsumptions: 0,
            dailyRateLimit: 0,
            weeklyRateLimit: 0,
        };
        vi.mocked(SaasService.getActiveSubscription).mockResolvedValue(response);

        const { result } = renderHook(() => useSaaSActiveSubscription());

        await waitFor(() => {
            expect(result.current.isLoading).toBe(false);
        });

        expect(result.current.canUseAI).toBe(false); // 0 < 0 is false
    });

    it('should handle exact limit consumption', async () => {
        const response = {
            ...mockActiveSubscriptionResponse,
            todaysConsumptions: 10,
            thisWeeksConsumptions: 50,
            dailyRateLimit: 10,
            weeklyRateLimit: 50,
        };
        vi.mocked(SaasService.getActiveSubscription).mockResolvedValue(response);

        const { result } = renderHook(() => useSaaSActiveSubscription());

        await waitFor(() => {
            expect(result.current.isLoading).toBe(false);
        });

        expect(result.current.canUseAI).toBe(false); // 10 < 10 is false
    });

    it('should clear error when refetching after an error', async () => {
        // First, cause an error
        const error = new Error('API Error');
        vi.mocked(SaasService.getActiveSubscription).mockRejectedValueOnce(error);

        const { result } = renderHook(() => useSaaSActiveSubscription());

        await waitFor(() => {
            expect(result.current.isLoading).toBe(false);
        });

        expect(result.current.error).toBe('API Error');

        // Now mock a successful response for the next call
        vi.mocked(SaasService.getActiveSubscription).mockResolvedValue(mockActiveSubscriptionResponse);

        // Create a new hook instance to trigger refetch (since there are no dependencies)
        const { result: newResult } = renderHook(() => useSaaSActiveSubscription());

        await waitFor(() => {
            expect(newResult.current.isLoading).toBe(false);
        });

        // The new instance should have no error and successful data
        expect(newResult.current.error).toBeNull();
        expect(newResult.current.activeSubscription).toEqual(mockActiveSubscription);
    });

    it('should handle non-Error objects in catch block', async () => {
        // Mock a non-Error object being thrown
        vi.mocked(SaasService.getActiveSubscription).mockRejectedValue('String error');

        const { result } = renderHook(() => useSaaSActiveSubscription());

        await waitFor(() => {
            expect(result.current.isLoading).toBe(false);
        });

        expect(result.current.error).toBe('Failed to fetch active subscription');
    });
});