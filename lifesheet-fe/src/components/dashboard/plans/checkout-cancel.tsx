import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { XCircle } from 'lucide-react';

export function CheckoutCancelPage() {
  const navigate = useNavigate();

  return (
    <div className="container mx-auto py-12">
      <Card className="max-w-2xl mx-auto">
        <CardHeader>
          <CardTitle className="text-center">Payment Cancelled</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col items-center">
          <XCircle className="h-16 w-16 text-red-500 mb-4" />
          <p className="text-center mb-6">Your payment was cancelled. No charges were made.</p>
          <div className="flex gap-4">
            <Button onClick={() => navigate('/plans')} variant="outline">
              View Plans
            </Button>
            <Button onClick={() => navigate('/')} variant="default">
              Return to Dashboard
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export default CheckoutCancelPage;
