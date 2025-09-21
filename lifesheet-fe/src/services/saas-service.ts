import type { Axios } from 'axios';
import { constants } from '../constants';
import axios from 'axios';
import { setupApiErrorInterceptor } from './api-error-interceptor';

export interface SaaSSubscription {
    _id: string;
    userId: string;
    startDate: string;
    endDate: string;
    planId: string;
}
export interface SaaSPlan {
    _id: string;
    name: string;
    days: number; //Number of days the plan is valid for
    description: string;
    priceCents: number;
    currency: string;
    iconUrl: string;
    features: string[];
    dailyRateLimit: number; //-1 for unlimited
    weeklyRateLimit: number; //-1 for unlimited
    createdAt: Date;
    updatedAt: Date;
}
interface ActiveSubscriptionResponse {
    activeSubscription: SaaSSubscription;
    todaysConsumptions: number;
    thisWeeksConsumptions: number;
    dailyRateLimit: number;
    weeklyRateLimit: number;
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


export async function getActiveSubscription(token?: string): Promise<ActiveSubscriptionResponse> {
    const client = getClient(token);
    const response = await client.get<ActiveSubscriptionResponse>(
        `/user/me/saas/subscriptions/active`
    );
    return response.data;
}
export async function getSaaSPlans(language: string, token?: string): Promise<SaaSPlan[]> {
    const client = getClient(token);
    //no auth needed. just add token if provided

    const response = await client.get<SaaSPlan[]>('/saas/plans', {
        params: {
            language
        }
    });
    return response.data;
}
export async function getStripePK(token?: string): Promise<string> {
    const client = getClient(token);
    const response = await client.get<{ pk: string }>('/saas/stripepk');
    return response.data.pk;
}

export async function initiatePurchase(planId: string, provider: string, token: string) {
    const client = getClient(token);
    const response = await client.post<{ message: string; subscriptionId: string }>(
        'user/me/saas/subscriptions',
        {
            planId,
            provider,
        }
    );
    return response.data;
}
export async function getSubscriptionStatus(subscriptionId: string, token: string) {
    const client = getClient(token);
    const response = await client.get<{ status: string }>(
        `user/me/saas/subscriptions/${subscriptionId}/status`
    );
    return response.data.status;
}

export async function createStripeCheckoutSession(
    planId: string,
    successUrl: string,
    cancelUrl: string,
    token: string
) {
    const client = getClient(token);
    const response = await client.post<{ sessionId: string; subscriptionId: string }>(
        '/user/me/saas/subscriptions',
        {
            provider: 'stripe',
            planId,
            successUrl,
            cancelUrl,
        }
    );
    return response.data;
}
