'use client';

import { useState, useEffect, useCallback } from 'react';
import { getTermsOfService, acceptTermsOfService, type GetTermsOfServiceResponse } from '@/services/user-service';
import { useAuth } from './auth-hook';

export interface UseTermsOfServiceReturn {
    contents: string;
    isAccepted: boolean;
    version: string;
    lastAcceptedVersion: string;
    error: string | null;
    isLoading: boolean;
    acceptTerms: (version: string) => Promise<void>;
    refetch: () => Promise<void>;
}

export function useTermsOfService(): UseTermsOfServiceReturn {
    const [termsData, setTermsData] = useState<GetTermsOfServiceResponse | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [isAccepting, setIsAccepting] = useState(false);
    const { getAccessTokenSilently } = useAuth();

    const fetchTerms = useCallback(async () => {
        try {
            setIsLoading(true);
            setError(null);
            const token = await getAccessTokenSilently();
            const data = await getTermsOfService(token);
            setTermsData(data);
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'Failed to fetch terms of service';
            setError(errorMessage);
            console.error('Error fetching terms of service:', err);
        } finally {
            setIsLoading(false);
        }
    }, [getAccessTokenSilently]);

    const acceptTerms = useCallback(async (version: string) => {
        try {
            setIsAccepting(true);
            setError(null);
            const token = await getAccessTokenSilently();
            await acceptTermsOfService(token, version);

            // Refetch terms data to get updated acceptance status
            await fetchTerms();
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'Failed to accept terms of service';
            setError(errorMessage);
            console.error('Error accepting terms of service:', err);
            throw new Error(errorMessage);
        } finally {
            setIsAccepting(false);
        }
    }, [getAccessTokenSilently, fetchTerms]);

    const refetch = useCallback(async () => {
        await fetchTerms();
    }, [fetchTerms]);

    useEffect(() => {
        fetchTerms();
    }, [fetchTerms]);

    return {
        contents: termsData?.content || '',
        isAccepted: termsData?.accepted || false,
        version: termsData?.version || '',
        lastAcceptedVersion: termsData?.lastAcceptedVersion || '',
        error,
        isLoading: isLoading || isAccepting,
        acceptTerms,
        refetch,
    };
}
