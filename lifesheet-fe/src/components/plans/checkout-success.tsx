import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { CheckCircle, Loader2 } from 'lucide-react';
import { useAuth } from '@/hooks/auth-hook';
import saasService from '@/services/saas-service';

export function CheckoutSuccessPage() {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const subscriptionId = searchParams.get('subscription_id');
    const auth = useAuth();
    const [isVerifying, setIsVerifying] = useState(true);
    const [verificationError, setVerificationError] = useState('');

    useEffect(() => {
        async function verifyPayment() {
                try {
                    
                    const token = await auth.getAccessTokenSilently();
                    const status = await saasService.getSubscriptionStatus(token, subscriptionId!);
                    if (status === 'active') {
                        setVerificationError('');
                        setIsVerifying(false);
                    }
                    if (status === 'payment-failed') {
                        setVerificationError('Payment failed. Please try again.');
                        setIsVerifying(false);
                    }

                } catch (error) {
                    console.error('Error verifying payment:', error);
                    setVerificationError('Error verifying payment. Please contact support.');
                    setIsVerifying(false);
                }
            }
        const interval = setInterval(verifyPayment, 1000); // Check every 1 second

        return () => clearInterval(interval);
    }, []);

    return (
        <div className="container mx-auto py-12">
            <Card className="max-w-2xl mx-auto">
                <CardHeader>
                    <CardTitle className="text-center">
                        {isVerifying ? 'Verifying Payment...' : 'Payment Successful!'}
                    </CardTitle>
                </CardHeader>
                <CardContent className="flex flex-col items-center">
                    {isVerifying ? (
                        <Loader2 className="h-16 w-16 text-blue-500 mb-4 animate-spin" />
                    ) : verificationError ? (
                        <>
                            <div className="text-red-500 mb-4">{verificationError}</div>
                            <Button onClick={() => navigate('/plans')} variant="outline">
                                Try Again
                            </Button>
                        </>
                    ) : (
                        <>
                            <CheckCircle className="h-16 w-16 text-green-500 mb-4" />
                            <p className="text-center mb-6">
                                Thank you for your purchase. Your subscription has been activated.
                            </p>
                            <Button onClick={() => navigate('/')} className="mt-4">
                                Return to Dashboard
                            </Button>
                        </>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}

export default CheckoutSuccessPage;
