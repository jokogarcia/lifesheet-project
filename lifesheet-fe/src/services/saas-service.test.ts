import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import axios from 'axios';
import {
    getActiveSubscription,
    getSaaSPlans,
    getStripePK,
    initiatePurchase,
    getSubscriptionStatus,
    createStripeCheckoutSession,
    type SaaSPlan,
    type SaaSSubscription,
} from './saas-service';
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

// Mock console.log to avoid noise in tests
const consoleSpy = vi.spyOn(console, 'log').mockImplementation(() => { });
const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => { });

describe('saas-service', () => {
    let mockAxiosInstance: any;
    let mockAxiosCreate: any;

    beforeEach(() => {
        vi.clearAllMocks();

        // Create a fresh mock instance for each test
        mockAxiosInstance = {
            get: vi.fn(),
            post: vi.fn(),
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
    });

    afterEach(() => {
        vi.restoreAllMocks();
    });

    describe('getActiveSubscription', () => {
        const mockActiveSubscription: SaaSSubscription = {
            _id: 'sub-123',
            userId: 'user-456',
            startDate: '2023-01-01',
            endDate: '2023-12-31',
            planId: 'plan-789',
        };

        const mockResponse = {
            activeSubscription: mockActiveSubscription,
            todaysConsumptions: 5,
            thisWeeksConsumptions: 20,
            dailyRateLimit: 10,
            weeklyRateLimit: 50,
        };

        it('should fetch active subscription with token', async () => {
            mockAxiosInstance.get.mockResolvedValue({ data: mockResponse });

            const result = await getActiveSubscription('test-token');

            expect(result).toEqual(mockResponse);
            expect(mockAxiosInstance.get).toHaveBeenCalledWith('/user/me/saas/subscriptions/active');
            expect(mockAxiosCreate).toHaveBeenCalledWith({
                baseURL: constants.API_URL,
                headers: {
                    'Content-Type': 'application/json',
                },
            });
            expect(mockAxiosInstance.defaults.headers.common['Authorization']).toBe('Bearer test-token');
        });

        it('should fetch active subscription without token', async () => {
            mockAxiosInstance.get.mockResolvedValue({ data: mockResponse });

            const result = await getActiveSubscription();

            expect(result).toEqual(mockResponse);
            expect(mockAxiosInstance.get).toHaveBeenCalledWith('/user/me/saas/subscriptions/active');
            expect(mockAxiosInstance.defaults.headers.common['Authorization']).toBeUndefined();
        });

        it('should handle API errors', async () => {
            const error = new Error('API Error');
            mockAxiosInstance.get.mockRejectedValue(error);

            await expect(getActiveSubscription('test-token')).rejects.toThrow('API Error');
        });

        it('should set up API error interceptor', async () => {
            mockAxiosInstance.get.mockResolvedValue({ data: mockResponse });

            await getActiveSubscription('test-token');

            expect(setupApiErrorInterceptor).toHaveBeenCalledWith(mockAxiosInstance);
        });
    });

    describe('getSaaSPlans', () => {
        const mockPlans: SaaSPlan[] = [
            {
                _id: 'plan-1',
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
                _id: 'plan-2',
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

        it('should fetch SaaS plans with language and token', async () => {
            mockAxiosInstance.get.mockResolvedValue({ data: mockPlans });

            const result = await getSaaSPlans('en', 'test-token');

            expect(result).toEqual(mockPlans);
            expect(mockAxiosInstance.get).toHaveBeenCalledWith('/saas/plans', {
                params: { language: 'en' },
            });
            expect(mockAxiosInstance.defaults.headers.common['Authorization']).toBe('Bearer test-token');
        });

        it('should fetch SaaS plans with language only', async () => {
            mockAxiosInstance.get.mockResolvedValue({ data: mockPlans });

            const result = await getSaaSPlans('de');

            expect(result).toEqual(mockPlans);
            expect(mockAxiosInstance.get).toHaveBeenCalledWith('/saas/plans', {
                params: { language: 'de' },
            });
            expect(mockAxiosInstance.defaults.headers.common['Authorization']).toBeUndefined();
        });

        it('should handle different languages', async () => {
            mockAxiosInstance.get.mockResolvedValue({ data: mockPlans });

            await getSaaSPlans('es', 'test-token');

            expect(mockAxiosInstance.get).toHaveBeenCalledWith('/saas/plans', {
                params: { language: 'es' },
            });
        });

        it('should handle API errors', async () => {
            const error = new Error('Network Error');
            mockAxiosInstance.get.mockRejectedValue(error);

            await expect(getSaaSPlans('en', 'test-token')).rejects.toThrow('Network Error');
        });

        it('should return empty array when no plans available', async () => {
            mockAxiosInstance.get.mockResolvedValue({ data: [] });

            const result = await getSaaSPlans('en');

            expect(result).toEqual([]);
        });
    });

    describe('getStripePK', () => {
        it('should fetch Stripe public key with token', async () => {
            const mockResponse = { pk: 'pk_test_123456789' };
            mockAxiosInstance.get.mockResolvedValue({ data: mockResponse });

            const result = await getStripePK('test-token');

            expect(result).toBe('pk_test_123456789');
            expect(mockAxiosInstance.get).toHaveBeenCalledWith('/saas/stripepk');
            expect(mockAxiosInstance.defaults.headers.common['Authorization']).toBe('Bearer test-token');
        });

        it('should fetch Stripe public key without token', async () => {
            const mockResponse = { pk: 'pk_live_987654321' };
            mockAxiosInstance.get.mockResolvedValue({ data: mockResponse });

            const result = await getStripePK();

            expect(result).toBe('pk_live_987654321');
            expect(mockAxiosInstance.get).toHaveBeenCalledWith('/saas/stripepk');
            expect(mockAxiosInstance.defaults.headers.common['Authorization']).toBeUndefined();
        });

        it('should handle API errors', async () => {
            const error = new Error('Stripe Error');
            mockAxiosInstance.get.mockRejectedValue(error);

            await expect(getStripePK('test-token')).rejects.toThrow('Stripe Error');
        });
    });

    describe('initiatePurchase', () => {
        it('should initiate purchase successfully', async () => {
            const mockResponse = {
                message: 'Purchase initiated successfully',
                subscriptionId: 'sub-123',
            };
            mockAxiosInstance.post.mockResolvedValue({ data: mockResponse });

            const result = await initiatePurchase('plan-456', 'stripe', 'test-token');

            expect(result).toEqual(mockResponse);
            expect(mockAxiosInstance.post).toHaveBeenCalledWith('user/me/saas/subscriptions', {
                planId: 'plan-456',
                provider: 'stripe',
            });
            expect(mockAxiosInstance.defaults.headers.common['Authorization']).toBe('Bearer test-token');
        });

        it('should handle different providers', async () => {
            const mockResponse = {
                message: 'Purchase initiated successfully',
                subscriptionId: 'sub-789',
            };
            mockAxiosInstance.post.mockResolvedValue({ data: mockResponse });

            await initiatePurchase('plan-123', 'paypal', 'test-token');

            expect(mockAxiosInstance.post).toHaveBeenCalledWith('user/me/saas/subscriptions', {
                planId: 'plan-123',
                provider: 'paypal',
            });
        });

        it('should handle API errors', async () => {
            const error = new Error('Purchase failed');
            mockAxiosInstance.post.mockRejectedValue(error);

            await expect(initiatePurchase('plan-456', 'stripe', 'test-token')).rejects.toThrow('Purchase failed');
        });

        it('should require token parameter', async () => {
            const mockResponse = {
                message: 'Purchase initiated successfully',
                subscriptionId: 'sub-123',
            };
            mockAxiosInstance.post.mockResolvedValue({ data: mockResponse });

            await initiatePurchase('plan-456', 'stripe', 'required-token');

            expect(mockAxiosInstance.defaults.headers.common['Authorization']).toBe('Bearer required-token');
        });
    });

    describe('getSubscriptionStatus', () => {
        it('should get subscription status successfully', async () => {
            const mockResponse = { status: 'active' };
            mockAxiosInstance.get.mockResolvedValue({ data: mockResponse });

            const result = await getSubscriptionStatus('sub-123', 'test-token');

            expect(result).toBe('active');
            expect(mockAxiosInstance.get).toHaveBeenCalledWith('user/me/saas/subscriptions/sub-123/status');
            expect(mockAxiosInstance.defaults.headers.common['Authorization']).toBe('Bearer test-token');
        });

        it('should handle different subscription statuses', async () => {
            const statuses = ['pending', 'active', 'cancelled', 'expired'];

            for (const status of statuses) {
                mockAxiosInstance.get.mockResolvedValue({ data: { status } });

                const result = await getSubscriptionStatus('sub-123', 'test-token');

                expect(result).toBe(status);
            }
        });

        it('should handle API errors', async () => {
            const error = new Error('Subscription not found');
            mockAxiosInstance.get.mockRejectedValue(error);

            await expect(getSubscriptionStatus('sub-123', 'test-token')).rejects.toThrow('Subscription not found');
        });

        it('should require token parameter', async () => {
            const mockResponse = { status: 'active' };
            mockAxiosInstance.get.mockResolvedValue({ data: mockResponse });

            await getSubscriptionStatus('sub-123', 'required-token');

            expect(mockAxiosInstance.defaults.headers.common['Authorization']).toBe('Bearer required-token');
        });
    });

    describe('createStripeCheckoutSession', () => {
        it('should create Stripe checkout session successfully', async () => {
            const mockResponse = {
                sessionId: 'cs_test_123456789',
                subscriptionId: 'sub-123',
            };
            mockAxiosInstance.post.mockResolvedValue({ data: mockResponse });

            const result = await createStripeCheckoutSession(
                'plan-456',
                'https://example.com/success',
                'https://example.com/cancel',
                'test-token'
            );

            expect(result).toEqual(mockResponse);
            expect(mockAxiosInstance.post).toHaveBeenCalledWith('/user/me/saas/subscriptions', {
                provider: 'stripe',
                planId: 'plan-456',
                successUrl: 'https://example.com/success',
                cancelUrl: 'https://example.com/cancel',
            });
            expect(mockAxiosInstance.defaults.headers.common['Authorization']).toBe('Bearer test-token');
        });

        it('should handle different URLs', async () => {
            const mockResponse = {
                sessionId: 'cs_test_987654321',
                subscriptionId: 'sub-789',
            };
            mockAxiosInstance.post.mockResolvedValue({ data: mockResponse });

            await createStripeCheckoutSession(
                'plan-123',
                'https://app.example.com/success',
                'https://app.example.com/cancel',
                'test-token'
            );

            expect(mockAxiosInstance.post).toHaveBeenCalledWith('/user/me/saas/subscriptions', {
                provider: 'stripe',
                planId: 'plan-123',
                successUrl: 'https://app.example.com/success',
                cancelUrl: 'https://app.example.com/cancel',
            });
        });

        it('should handle API errors', async () => {
            const error = new Error('Stripe session creation failed');
            mockAxiosInstance.post.mockRejectedValue(error);

            await expect(
                createStripeCheckoutSession(
                    'plan-456',
                    'https://example.com/success',
                    'https://example.com/cancel',
                    'test-token'
                )
            ).rejects.toThrow('Stripe session creation failed');
        });

        it('should require token parameter', async () => {
            const mockResponse = {
                sessionId: 'cs_test_123456789',
                subscriptionId: 'sub-123',
            };
            mockAxiosInstance.post.mockResolvedValue({ data: mockResponse });

            await createStripeCheckoutSession(
                'plan-456',
                'https://example.com/success',
                'https://example.com/cancel',
                'required-token'
            );

            expect(mockAxiosInstance.defaults.headers.common['Authorization']).toBe('Bearer required-token');
        });
    });

    describe('getClient function', () => {
        it('should create axios client with correct base URL', async () => {
            mockAxiosInstance.get.mockResolvedValue({ data: {} });

            await getActiveSubscription('test-token');

            expect(mockAxiosCreate).toHaveBeenCalledWith({
                baseURL: constants.API_URL,
                headers: {
                    'Content-Type': 'application/json',
                },
            });
        });

        it('should set authorization header when token provided', async () => {
            mockAxiosInstance.get.mockResolvedValue({ data: {} });

            await getActiveSubscription('test-token');

            expect(mockAxiosInstance.defaults.headers.common['Authorization']).toBe('Bearer test-token');
        });

        it('should not set authorization header when token not provided', async () => {
            mockAxiosInstance.get.mockResolvedValue({ data: {} });

            await getActiveSubscription();

            expect(mockAxiosInstance.defaults.headers.common['Authorization']).toBeUndefined();
        });

        it('should call setupApiErrorInterceptor for all requests', async () => {
            mockAxiosInstance.get.mockResolvedValue({ data: {} });

            await getActiveSubscription('test-token');

            expect(setupApiErrorInterceptor).toHaveBeenCalledWith(mockAxiosInstance);
        });
    });

    describe('error handling', () => {
        it('should propagate network errors', async () => {
            const networkError = new Error('Network Error');
            mockAxiosInstance.get.mockRejectedValue(networkError);

            await expect(getActiveSubscription('test-token')).rejects.toThrow('Network Error');
        });

        it('should propagate HTTP errors', async () => {
            const httpError = new Error('HTTP 404 Not Found');
            mockAxiosInstance.get.mockRejectedValue(httpError);

            await expect(getSaaSPlans('en', 'test-token')).rejects.toThrow('HTTP 404 Not Found');
        });

        it('should handle timeout errors', async () => {
            const timeoutError = new Error('Request timeout');
            mockAxiosInstance.get.mockRejectedValue(timeoutError);

            await expect(getStripePK('test-token')).rejects.toThrow('Request timeout');
        });
    });

    describe('edge cases', () => {
        it('should handle empty token string', async () => {
            mockAxiosInstance.get.mockResolvedValue({ data: {} });

            await getActiveSubscription('');

            // Empty string is falsy, so no authorization header should be set
            expect(mockAxiosInstance.defaults.headers.common['Authorization']).toBeUndefined();
        });

        it('should handle special characters in plan IDs', async () => {
            const mockResponse = { message: 'Success', subscriptionId: 'sub-123' };
            mockAxiosInstance.post.mockResolvedValue({ data: mockResponse });

            await initiatePurchase('plan-with-special-chars-123!@#', 'stripe', 'test-token');

            expect(mockAxiosInstance.post).toHaveBeenCalledWith('user/me/saas/subscriptions', {
                planId: 'plan-with-special-chars-123!@#',
                provider: 'stripe',
            });
        });

        it('should handle very long URLs', async () => {
            const longUrl = 'https://example.com/' + 'a'.repeat(1000);
            const mockResponse = { sessionId: 'cs_test_123', subscriptionId: 'sub-123' };
            mockAxiosInstance.post.mockResolvedValue({ data: mockResponse });

            await createStripeCheckoutSession('plan-123', longUrl, longUrl, 'test-token');

            expect(mockAxiosInstance.post).toHaveBeenCalledWith('/user/me/saas/subscriptions', {
                provider: 'stripe',
                planId: 'plan-123',
                successUrl: longUrl,
                cancelUrl: longUrl,
            });
        });

        it('should handle empty response data', async () => {
            mockAxiosInstance.get.mockResolvedValue({ data: null });

            const result = await getSaaSPlans('en');

            expect(result).toBeNull();
        });
    });
});