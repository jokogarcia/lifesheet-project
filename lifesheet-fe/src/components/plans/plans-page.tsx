import { useSaaSActiveSubscription, useSaasPlans } from '@/hooks/use-saas';
import { PlanCard } from '@/components/plans/plan-card';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';

export function PlansPage() {
  const navigate = useNavigate();
  const { saasPlans, isLoading: isSaasPlansLoading } = useSaasPlans();
  const {
    activeSubscription,
    isLoading: isAcriveSubscriptionLoading,
    todaysConsumptions,
    thisWeeksConsumptions,
  } = useSaaSActiveSubscription();

  if (isSaasPlansLoading || isAcriveSubscriptionLoading) {
    return (
      <div className="container max-w-6xl mx-auto py-12" style={{ maxWidth: '100%', width: '100vw', marginLeft: 'calc(-50vw + 50%)' }}>
        <div className="flex justify-center">
          <div className="animate-pulse h-8 w-1/3 bg-gray-200 rounded mb-8"></div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {[1, 2, 3].map(i => (
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
    <div className="w-full max-w-6xl mx-auto py-12">
      <div className="flex justify-between">
        <Button onClick={() => navigate('/')} variant="ghost" className="flex items-center gap-2">
          <ArrowLeft className="h-4 w-4 float-end" />
        </Button>
        <h1 className="text-3xl font-bold text-center mb-8 ml-auto mr-auto">Subscription Plans</h1>

      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {saasPlans.map(plan => (
          <PlanCard
            key={plan._id}
            plan={plan}
            isCurrentPlan={activeSubscription?.planId === plan._id}
            isBetterPlan={plan.priceCents > (currentPlan?.priceCents || 0)}
            isCurrentFreePlan={currentPlan?.priceCents === 0}
          />
        ))}
      </div>
      <div className="border rounded-lg p-6 mt-6">
        <p><b>Your Current Subscription</b></p>
        <p className="text-xs">Since {new Date(activeSubscription?.startDate || '').toLocaleDateString()}. Expires on {new Date(activeSubscription?.endDate || '').toLocaleDateString()}.</p>
        <p className="text-xs">You used {todaysConsumptions} AI Operations today and {thisWeeksConsumptions} this week.</p>
      </div>

    </div>
  );
}
