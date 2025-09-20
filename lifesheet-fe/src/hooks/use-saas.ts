'use client';

import { useState, useEffect, useCallback } from 'react';
import SaasService, { type SaaSSubscription, type SaaSPlan } from '@/services/saas-service';
import { useLanguage } from '@/contexts/language-context';

export function useSaasPlans() {
  const [saasPlans, setSaasPlans] = useState<SaaSPlan[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { currentLanguage } = useLanguage();


  const fetchSaaSPlans = useCallback(async () => {
    setIsLoading(true);
    try {
      setError(null);
      const plans = await SaasService.getSaaSPlans(currentLanguage);
      setSaasPlans(plans);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch SaaS plans';
      setError(errorMessage);
      console.error('Error fetching SaaS plans:', err);
    } finally {
      setIsLoading(false);
    }
  }, [currentLanguage]);

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

  const fetchActiveSubscription = useCallback(async () => {
    setIsLoading(true);
    try {
      setError(null);
      const {
        activeSubscription,
        todaysConsumptions,
        thisWeeksConsumptions,
        dailyRateLimit,
        weeklyRateLimit,
      } = await SaasService.getActiveSubscription();
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
  }, []);

  useEffect(() => {
    fetchActiveSubscription();
  }, [fetchActiveSubscription]);

  return { activeSubscription, isLoading, todaysConsumptions, thisWeeksConsumptions, canUseAI, error };
}
