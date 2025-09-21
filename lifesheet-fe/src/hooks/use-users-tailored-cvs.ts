import { getUsersTailoredCvs, type CVListItem } from '@/services/cvs-service';
import { useState, useEffect } from 'react';
import { useAuth } from './auth-hook';

export const useUsersTailoredCVs = () => {
  const [tailoredCVs, setTailoredCVs] = useState<CVListItem[]>([]);
  const [error, setError] = useState<string>('');
  const [isLoading, setIsLoading] = useState(true);
  const { getAccessTokenSilently } = useAuth();

  useEffect(() => {
    const fetchTailoredCVs = async () => {
      try {
        const token = await getAccessTokenSilently();
        const data = await getUsersTailoredCvs(token);
        setTailoredCVs(data);
      } catch (error) {
        setError('Error fetching tailored CVs');
        console.error('Error fetching tailored CVs:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchTailoredCVs();
  }, [getAccessTokenSilently]);

  return { tailoredCVs, isLoading, error };
};