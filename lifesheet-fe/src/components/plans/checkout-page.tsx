import { Button } from '@/components/ui/button';
import { useLocation, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useSaasPlans } from '@/hooks/use-saas';
import { PlanCard } from './plan-card';
import { useEffect, useRef, useState } from 'react';
import saasService, { type SaaSPlan } from '@/services/saas-service';
import { useAuth } from '@/hooks/auth-hook';
import { loadStripe } from '@stripe/stripe-js';
import { constants } from '@/constants';

export function CheckoutPage() {
    const location = useLocation();
    const searchParams = new URLSearchParams(location.search);
    const [purchasedSubscriptionId, setPurchasedSubscriptionId] = useState('');
    const [purchasedSubscriptionState, setPurchasedSubscriptionState] = useState('');
    const [selectedPlan, setSelectedPlan] = useState<SaaSPlan | null>(null)
    const [isProcessing, setIsProcessing] = useState(false);
    const auth = useAuth();
    const planId = searchParams.get('planId');
    const navigate = useNavigate();
    const { saasPlans, isLoading: isLoadingPlans } = useSaasPlans();
    const [error, setError] = useState('');
    const statusCheckIntervalRef = useRef<number | null>(null);
    const stripePromise = loadStripe(constants.STRIPE_PK);

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
            setIsProcessing(true);
            setError('');
            
            const token = await auth.getAccessTokenSilently();
            if (!token) {
                setError("Failed to authenticate");
                setIsProcessing(false);
                return;
            }
            
            if (!selectedPlan) {
                setError("No plan selected");
                setIsProcessing(false);
                return;
            }
            
            // Create Stripe checkout session
            const response = await saasService.createStripeCheckoutSession(
                token, 
                selectedPlan._id, 
                window.location.origin + "/checkout-success",
                window.location.origin + "/checkout-cancel"
            );
            
            // Redirect to Stripe checkout
            if (response.sessionId) {
                const stripe = await stripePromise;
                if (!stripe) {
                    setError("Failed to load Stripe");
                    setIsProcessing(false);
                    return;
                }
                
                const { error } = await stripe.redirectToCheckout({
                    sessionId: response.sessionId
                });
                
                if (error) {
                    console.error("Stripe redirect error:", error);
                    setError(error.message || "Failed to redirect to payment page");
                    setIsProcessing(false);
                }
            } else {
                console.error("Failed to create checkout session", response);
                setError("Failed to create checkout session");
                setIsProcessing(false);
            }
        } catch (e) {
            console.error("Error occurred while initiating purchase", e);
            setError("Error occurred while initiating purchase");
            setIsProcessing(false);
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

                    <Button 
                        className="w-full mt-5" 
                        variant="default" 
                        onClick={handleBuyConfirm}
                        disabled={isProcessing}
                    >
                        {isProcessing ? 'Processing...' : 'Checkout with Stripe'}
                    </Button>
                </CardContent>
            </Card>
        </div>
    );
}
