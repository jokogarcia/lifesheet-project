import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Check } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import type { SaaSPlan } from '@/services/saas-service';

interface PlanCardProps {
  plan: SaaSPlan;
  isCurrentPlan: boolean;
  isBetterPlan?: boolean;
  isCurrentFreePlan?: boolean;
  hideBuyButton?: boolean;
}

export function PlanCard({
  plan,
  isCurrentPlan,
  isBetterPlan,
  isCurrentFreePlan,
  hideBuyButton,
}: PlanCardProps) {
  const navigate = useNavigate();
  const handlePurchase = () => {
    if (isCurrentPlan) {
      navigate('/');
    } else {
      navigate(`/checkout?planId=${plan._id}`);
    }
  };
  function getFormattedPrice(plan: SaaSPlan) {
    const currency = plan.currency;
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency,
    }).format(plan.priceCents / 100);
  }
  let buttonText = '';
  if (isCurrentPlan) {
    buttonText = 'Keep using this plan';
  } else if (isCurrentFreePlan && plan.priceCents > 0) {
    buttonText = 'Buy';
  } else if (!isBetterPlan) {
    buttonText = 'Your current plan is better';
  } else {
    buttonText = 'Upgrade';
  }
  return (
    <Card
      className={`flex flex-col border-2 ${isCurrentPlan ? 'border-primary' : 'border-border'}`}
    >
      <CardHeader className="pb-2">
        <div className="flex items-center justify-center">
          {plan.iconUrl && <img src={plan.iconUrl} alt={plan.name} className="h-10 w-10" />}
        </div>
        <div className="flex items-center justify-center">
          <CardTitle className="text-xl">{plan.name}</CardTitle>
        </div>
        <div className="text-2xl font-bold">{getFormattedPrice(plan)}</div>
      </CardHeader>
      <CardContent className="flex-grow">
        <p className="text-muted-foreground mb-4">{plan.description}</p>
        <ul className="space-y-2">
          {plan.features.map((feature, index) => (
            <li key={index} className="flex items-center">
              <Check className="mr-2 h-4 w-4 text-green-500" />
              <span>{feature}</span>
            </li>
          ))}
        </ul>
      </CardContent>
      <CardFooter hidden={!!hideBuyButton}>
        <Button
          className="w-full"
          onClick={handlePurchase}
          disabled={!isCurrentPlan && !isBetterPlan}
        >
          {buttonText}
        </Button>
      </CardFooter>
    </Card>
  );
}
