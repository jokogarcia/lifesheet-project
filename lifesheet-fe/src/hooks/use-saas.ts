'use client';

import { useState, useEffect, useCallback } from 'react';
import { type SaaSSubscription, type SaaSPlan } from '@/services/saas-service';
import * as SaasService from '@/services/saas-service';
import { useLanguage } from '@/contexts/language-context';
import { useAuth } from './auth-hook';

export function useSaasPlans() {
  const [saasPlans, setSaasPlans] = useState<SaaSPlan[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { currentLanguage } = useLanguage();
  const { getAccessTokenSilently } = useAuth();

  const fetchSaaSPlans = useCallback(async () => {
    setIsLoading(true);
    //token is optional here:
    let token: string | undefined;
    try {
      token = await getAccessTokenSilently();
    } catch (err) {
      //do nothing
    }
    try {
      setError(null);
      const plans = await SaasService.getSaaSPlans(currentLanguage, token);
      setSaasPlans(plans);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch SaaS plans';
      setError(errorMessage);
      console.error('Error fetching SaaS plans:', err);
    } finally {
      setIsLoading(false);
    }
  }, [currentLanguage, getAccessTokenSilently]);

  useEffect(() => {
    fetchSaaSPlans();
  }, [fetchSaaSPlans]);

  return { saasPlans, isLoading, error };
}

export function useSaaSActiveSubscription() {
  const [activeSubscription, setActiveSubscription] = useState<SaaSSubscription | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [todaysConsumptions, setTodaysConsumptions] = useState(0);
  const [thisWeeksConsumptions, setThisWeeksConsumptions] = useState(0);
  const [canUseAI, setCanUseAI] = useState(false);
  const { getAccessTokenSilently } = useAuth();

  const fetchActiveSubscription = useCallback(async () => {
    setIsLoading(true);
    try {
      setError(null);
      const token = await getAccessTokenSilently();
      const {
        activeSubscription,
        todaysConsumptions,
        thisWeeksConsumptions,
        dailyRateLimit,
        weeklyRateLimit,
      } = await SaasService.getActiveSubscription(token);
      setActiveSubscription(activeSubscription);
      setTodaysConsumptions(todaysConsumptions);
      setThisWeeksConsumptions(thisWeeksConsumptions);
      setCanUseAI(
        (dailyRateLimit === -1 || todaysConsumptions < dailyRateLimit) &&
        (weeklyRateLimit === -1 || thisWeeksConsumptions < weeklyRateLimit)
      );
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch active subscription';
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  }, [getAccessTokenSilently]);

  useEffect(() => {
    fetchActiveSubscription();
  }, [fetchActiveSubscription]);

  return { activeSubscription, isLoading, todaysConsumptions, thisWeeksConsumptions, canUseAI, error };
}