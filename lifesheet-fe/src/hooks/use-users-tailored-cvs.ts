import { cvsService, type CVListItem } from '@/services/cvs-service';
import { useState, useEffect } from 'react';
export const useUsersTailoredCVs = () => {
  const [tailoredCVs, setTailoredCVs] = useState<CVListItem[]>([]);
  const [error, setError] = useState<string>('');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchTailoredCVs = async () => {
      try {
        const data = await cvsService.getUsersTailoredCvs();
        setTailoredCVs(data);
      } catch (error) {
        setError('Error fetching tailored CVs');
        console.error('Error fetching tailored CVs:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchTailoredCVs();
  }, []);

  return { tailoredCVs, isLoading, error };
};
