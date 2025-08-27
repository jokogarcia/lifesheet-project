import { Button } from '@/components/ui/button';
import { useLocation, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useSaasPlans } from '@/hooks/use-saas';
import { PlanCard } from './plan-card';
import { useEffect, useRef, useState } from 'react';
import saasService, { type SaaSPlan } from '@/services/saas-service';
import { useAuth0 } from '@auth0/auth0-react';

export function CheckoutPage() {
    const location = useLocation();
    const searchParams = new URLSearchParams(location.search);
    const [purchasedSubscriptionId, setPurchasedSubscriptionId] = useState('');
    const [purchasedSubscriptionState, setPurchasedSubscriptionState] = useState('');
    const [selectedPlan, setSelectedPlan] = useState<SaaSPlan | null>(null)
    const auth = useAuth0();
    const planId = searchParams.get('planId');
    const navigate = useNavigate();
    const { saasPlans, isLoading: isLoadingPlans } = useSaasPlans();
    const [error, setError] = useState('');
    const statusCheckIntervalRef = useRef<number | null>(null);

    useEffect(() => {
        if (isLoadingPlans) return;
        const selectedPlan = saasPlans.find(p => p._id === planId);
        if (!selectedPlan) {
            console.error("Plan not found", planId, saasPlans)
            setError("Plan not found");

        }
        else {
            setSelectedPlan(selectedPlan);
        }
    }, [saasPlans, planId, isLoadingPlans])
    useEffect(() => {
        if (purchasedSubscriptionId) {
            // Clear any existing interval first
            if (statusCheckIntervalRef.current !== null) {
                return;
            }

            // Start new interval and store the ID
            statusCheckIntervalRef.current = window.setInterval(async () => {
                try {
                    const token = await auth.getAccessTokenSilently();
                    const status = await saasService.getSubscriptionStatus(token, purchasedSubscriptionId);
                    setPurchasedSubscriptionState(status);
                } catch (e) {
                    console.error("Error occurred while checking subscription status", e);
                    setError("Error occurred while checking subscription status");
                    // Clear interval on error
                    if (statusCheckIntervalRef.current !== null) {
                        clearInterval(statusCheckIntervalRef.current);
                        statusCheckIntervalRef.current = null;
                    }
                }
            }, 1000);
            // Cleanup function to clear interval when component unmounts
            return () => {
                if (statusCheckIntervalRef.current !== null) {
                    clearInterval(statusCheckIntervalRef.current);
                    statusCheckIntervalRef.current = null;
                }
            };
        }
    }, [auth, purchasedSubscriptionId]);

    async function handleBuyConfirm() {
        try {
            const token = await auth.getAccessTokenSilently();
            if (!token) {
                setError("Failed to authenticate")
            }
            const r = await saasService.initiatePurchase(token, selectedPlan!._id, "paypal");
            if (r.subscriptionId) {
                setPurchasedSubscriptionId(r.subscriptionId)
                setPurchasedSubscriptionState("payment-pending");
            } else {
                console.error("Failed to initiate purchase", r);
                setError("Failed to initiate purchase");
            }

        } catch (e) {
            console.error("Error occurred while initiating purchase", e);
            setError("Error occurred while initiating purchase");
        }
    }
    if (purchasedSubscriptionId) {
        switch (purchasedSubscriptionState) {
            case "payment-pending":
                return <h2>Processing payment</h2>
            case "active":
                if (statusCheckIntervalRef.current !== null) {
                    clearInterval(statusCheckIntervalRef.current);
                    statusCheckIntervalRef.current = null;
                }
                setTimeout(() => navigate("/"), 1000);
                return <h2>Payment successfully processed</h2>
            case "payment-failed":
                alert("The payment did not process correctly");
                setPurchasedSubscriptionId("");
                setPurchasedSubscriptionState("");
                break;
            default:
                console.log("Unexpected subscription state", purchasedSubscriptionState)
                setError("Unexpected subscription state");
        }
    }
    if (isLoadingPlans || !selectedPlan) {
        return <div>Loading plans...</div>;
    }
    if (error) {
        return <><div className="text-red-500">{error}</div>
            <div>
                <Button onClick={() => navigate("/plans")}>Try again</Button>
            </div>
        </>;
    }

    return (
        <div className="container mx-auto py-12">
            <Card className="max-w-2xl mx-auto">
                <CardHeader>
                    <CardTitle>Checkout</CardTitle>
                </CardHeader>
                <CardContent>
                    <h2 className="text-muted-foreground">
                        You are buying
                    </h2>
                    <PlanCard
                        plan={selectedPlan}
                        hideBuyButton={true}
                        isCurrentPlan={false}
                    ></PlanCard>

                    <Button className="w-full mt-5" variant="default" onClick={handleBuyConfirm}>
                        Confirm
                    </Button>
                </CardContent>
            </Card>
        </div>
    );
}
