import type { Axios } from "axios";
import { constants } from "../constants";
import axios from "axios";
import { Body } from "@radix-ui/themes/components/table";

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
                "Content-Type": "application/json",
            },
        });
    }

    public async getActiveSubscription(token: string): Promise<ActiveSubscriptionResponse> {
        const response = await this.client.get<ActiveSubscriptionResponse>(`/user/me/saas/subscriptions/active`, {
            headers: {
                Authorization: `Bearer ${token}`,
            },
        });
        return response.data;
    }
    public async getSaaSPlans(token?: string): Promise<SaaSPlan[]> {
        //no auth needed. just add token if provided
        const options = token ? {
            headers: {
                Authorization: `Bearer ${token}`,
            },
        } : {};
        const response = await this.client.get<SaaSPlan[]>("/saas/plans", options);
        return response.data;
    }

    public async initiatePurchase(token: string, planId: string, provider: string) {
        const response = await this.client.post<{ message: string, subscriptionId: string }>("user/me/saas/subscriptions",
            {

                planId,
                provider
            },
            {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });
        return response.data;
    }
    public async getSubscriptionStatus(token: string, subscriptionId: string) {
        const response = await this.client.get<{ status: string }>(`user/me/saas/subscriptions/${subscriptionId}/status`,
            {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });
        return response.data.status;
    }

}
export const saasService = new SaaSService();
export default saasService;