import type { Axios } from 'axios';
import { constants } from '../constants';
import axios from 'axios';

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
class SaaSService {
    private client: Axios;
    constructor(baseUrl: string = constants.API_URL) {
        this.client = axios.create({
            baseURL: baseUrl,
            headers: {
                'Content-Type': 'application/json',
            },
        });
    }
    public setAuthToken(token: string) {
        this.client.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    }

    public async getActiveSubscription(): Promise<ActiveSubscriptionResponse> {
        const response = await this.client.get<ActiveSubscriptionResponse>(
            `/user/me/saas/subscriptions/active`
        );
        return response.data;
    }
    public async getSaaSPlans(language: string): Promise<SaaSPlan[]> {
        //no auth needed. just add token if provided

        const response = await this.client.get<SaaSPlan[]>('/saas/plans', {
            params: {
                language
            }
        });
        return response.data;
    }
    public async getStripePK(): Promise<string> {
        const response = await this.client.get<{ pk: string }>('/saas/stripepk');
        return response.data.pk;
    }

    public async initiatePurchase(planId: string, provider: string) {
        const response = await this.client.post<{ message: string; subscriptionId: string }>(
            'user/me/saas/subscriptions',
            {
                planId,
                provider,
            }
        );
        return response.data;
    }
    public async getSubscriptionStatus(subscriptionId: string) {
        const response = await this.client.get<{ status: string }>(
            `user/me/saas/subscriptions/${subscriptionId}/status`
        );
        return response.data.status;
    }

    public async createStripeCheckoutSession(
        planId: string,
        successUrl: string,
        cancelUrl: string
    ) {
        const response = await this.client.post<{ sessionId: string; subscriptionId: string }>(
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
}

export const saasService = new SaaSService();
export default saasService;
