
import {  useSaaSActiveSubscription, useSaasPlans } from '@/hooks/use-saas';
import { PlanCard } from '@/components/plans/plan-card';
import { Card } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';

export function PlansPage() {
    const navigate = useNavigate();
    const { saasPlans, isLoading:isSaasPlansLoading } = useSaasPlans();
    const { activeSubscription, isLoading:isAcriveSubscriptionLoading, todaysConsumptions, thisWeeksConsumptions } = useSaaSActiveSubscription();

    


    if (isSaasPlansLoading || isAcriveSubscriptionLoading) {
        return (
            <div className="container mx-auto py-12">
                <div className="flex justify-center">
                    <div className="animate-pulse h-8 w-1/3 bg-gray-200 rounded mb-8"></div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    {[1, 2, 3].map((i) => (
                        <div key={i} className="animate-pulse">
                            <div className="h-64 bg-gray-200 rounded-lg"></div>
                        </div>
                    ))}
                </div>
            </div>
        );
    }
    const currentPlan = saasPlans.find(plan => plan._id === activeSubscription?.planId);

    return (
        <div className="container mx-auto py-12">
            <h1 className="text-3xl font-bold text-center mb-8">Subscription Plans</h1>

            {currentPlan && (
                <Card className="p-6 mb-8">
                    <h2 className="text-xl font-semibold mb-2">Your Current Plan</h2>
                    <p className="text-muted-foreground mb-4">
                        {currentPlan.name} 
                    </p>
                    <span className="text-sm ml-4">Purchased on {new Date(activeSubscription!.startDate).toLocaleDateString()} - Expires on {new Date(activeSubscription!.endDate).toLocaleDateString()}</span>
                    <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                            <span>Daily Limits</span>
                            <span>
                                {todaysConsumptions} AI Operations
                            </span>
                            <Progress
                                value={(currentPlan.dailyRateLimit / todaysConsumptions) * 100}
                                className="h-2"
                            />
                            <span> of {currentPlan.dailyRateLimit}</span>
                            </div>
                            <div className="flex justify-between text-sm">
                            <span>Weekly Limits</span>
                            <span>
                                {thisWeeksConsumptions} AI Operations
                            </span>
                            <Progress
                                value={(currentPlan.weeklyRateLimit / thisWeeksConsumptions) * 100}
                                className="h-2"
                            />
                            <span> of {currentPlan.weeklyRateLimit}</span>
                        </div>

                    </div>
                </Card>
            )}

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {saasPlans.map((plan) => (
                    <PlanCard
                        key={plan._id}
                        plan={plan}
                        isCurrentPlan={activeSubscription?.planId === plan._id}
                        isBetterPlan={plan.priceCents > (currentPlan?.priceCents || 0)}
                        isCurrentFreePlan={plan.priceCents === 0}
                    />
                ))}
            </div>

            <div className="flex justify-center mt-12">
                <Button 
                    onClick={() => navigate('/')} 
                    variant="outline" 
                    className="flex items-center gap-2"
                >
                    <ArrowLeft className="h-4 w-4" />
                    Return to Dashboard
                </Button>
            </div>
        </div>
    );
}
