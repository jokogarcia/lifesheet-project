'use client';

import { useState, useEffect, useCallback } from 'react';
import SaasService, { type SaaSSubscription, type SaaSPlan } from '@/services/saas-service';
import { useAuth } from '@/hooks/auth-hook';
import { useLanguage } from '@/contexts/language-context';

export function useSaasPlans() {
  const [saasPlans, setSaasPlans] = useState<SaaSPlan[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { currentLanguage } = useLanguage();

  const auth = useAuth();

  const fetchSaaSPlans = useCallback(async () => {
    setIsLoading(true);
    const plans = await SaasService.getSaaSPlans(currentLanguage);
    setSaasPlans(plans);
    setIsLoading(false);
  }, [auth, currentLanguage]);

  useEffect(() => {
    fetchSaaSPlans();
  }, [fetchSaaSPlans]);

  return { saasPlans, isLoading };
}
export function useSaaSActiveSubscription() {
  const [activeSubscription, setActiveSubscription] = useState<SaaSSubscription | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [todaysConsumptions, setTodaysConsumptions] = useState(0);
  const [thisWeeksConsumptions, setThisWeeksConsumptions] = useState(0);
  const [canUseAI, setCanUseAI] = useState(false);
  const auth = useAuth();

  const fetchActiveSubscription = useCallback(async () => {
    setIsLoading(true);
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
      dailyRateLimit !== -1 &&
      todaysConsumptions < dailyRateLimit &&
      (weeklyRateLimit === -1 || thisWeeksConsumptions < weeklyRateLimit)
    );
    setIsLoading(false);
  }, [auth]);

  useEffect(() => {
    fetchActiveSubscription();
  }, [fetchActiveSubscription]);

  return { activeSubscription, isLoading, todaysConsumptions, thisWeeksConsumptions, canUseAI };
}
