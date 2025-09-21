'use client';

import { useState, useEffect, useCallback } from 'react';
import { getUserCV, createOrUpdateCV, deleteCV, type CV, type CreateOrUpdateCVRequest } from '../services/cvs-service';
import { useAuth } from './auth-hook';

export function useUserCV(cvId?: string) {
  const [cv, setCV] = useState<CV | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const { getAccessTokenSilently } = useAuth();

  const fetchCV = useCallback(async () => {
    try {
      setIsLoading(true);
      const token = await getAccessTokenSilently();
      const fetchedCV = await getUserCV(token, cvId);
      setCV(fetchedCV);
      setError(null); // Explicitly clear error on success
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch CV';
      setError(errorMessage);
      console.error('Error fetching CV:', err);
    } finally {
      setIsLoading(false);
    }
  }, [cvId, getAccessTokenSilently]);

  const saveCV = async (cvId: string, cvData: CreateOrUpdateCVRequest): Promise<CV> => {
    try {
      setIsSaving(true);
      const token = await getAccessTokenSilently();
      const savedCV = await createOrUpdateCV(token, cvId, cvData);
      setCV(savedCV);
      setError(null); // Explicitly clear error on success
      return savedCV;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to save CV';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setIsSaving(false);
    }
  };

  const deleteCVHandler = async (): Promise<void> => {
    try {
      const token = await getAccessTokenSilently();
      await deleteCV(token);
      setCV(null);
      setError(null); // Explicitly clear error on success
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to delete CV';
      setError(errorMessage);
      throw new Error(errorMessage);
    }
  };

  useEffect(() => {
    fetchCV();
  }, [fetchCV]);

  return {
    cv,
    isLoading,
    isSaving,
    error,
    saveCV,
    deleteCV: deleteCVHandler,
    refetch: fetchCV,
  };
}