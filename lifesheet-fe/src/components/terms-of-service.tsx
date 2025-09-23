import { useTermsOfService } from '@/hooks/use-terms-of-service';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { LoadingIndicator } from '@/components/ui/loading-indicator';

export function TermsOfService() {
    const {
        contents,
        isAccepted,
        version,
        error,
        isLoading,
        acceptTerms
    } = useTermsOfService();

    const handleAcceptTerms = async () => {
        try {
            await acceptTerms(version);
        } catch (error) {
            // Error is handled by the hook and displayed in the UI
            console.error('Failed to accept terms:', error);
        }
    };

    if (isLoading) {
        return (
            <div className="flex justify-center items-center min-h-[400px]">
                <LoadingIndicator />
            </div>
        );
    }

    if (error) {
        return (
            <Card className="max-w-4xl mx-auto">
                <CardHeader>
                    <CardTitle className="text-red-600">Error Loading Terms of Service</CardTitle>
                </CardHeader>
                <CardContent>
                    <p className="text-red-500">{error}</p>
                </CardContent>
            </Card>
        );
    }

    return (
        <Card className="max-w-4xl mx-auto">
            <CardHeader>
                <CardTitle>Terms of Service</CardTitle>
                <p className="text-sm text-muted-foreground">Version {version}</p>
            </CardHeader>
            <CardContent className="space-y-6">
                <div className="prose max-w-none">
                    <div
                        className="whitespace-pre-wrap text-sm leading-relaxed text-left"
                        style={{ fontFamily: 'monospace' }}
                    >
                        {contents}
                    </div>
                </div>

                {!isAccepted && (
                    <div className="flex justify-center pt-6 border-t">
                        <Button
                            onClick={handleAcceptTerms}
                            size="lg"
                            className="px-8 py-3 text-base font-semibold"
                        >
                            Accept Terms of Service
                        </Button>
                    </div>
                )}

                {isAccepted && (
                    <div className="flex justify-center pt-6 border-t">
                        <div className="text-center">
                            <p className="text-green-600 font-medium">✓ Terms of Service Accepted</p>
                            <p className="text-sm text-muted-foreground mt-1">
                                You have accepted version {version}
                            </p>
                        </div>
                    </div>
                )}
            </CardContent>
        </Card>
    );
}
