import { useNavigate } from 'react-router-dom';
import TailoredCVs from './tailored-cvs';
import { Button } from './ui/button';
import { Award, Download, LogOut, UserRoundPen } from 'lucide-react';
import { useAuth } from '@/hooks/auth-hook';
import { useUserCV } from '@/hooks/use-cv';
import { LoadingIndicator } from './ui/loading-indicator';
import { isCVOnboarded } from '@/services/cvs-service';

export function Dashboard() {

  const navigate = useNavigate();
  const { logout } = useAuth();
  const { cv, isLoading } = useUserCV();
  if (isLoading) {
    return <LoadingIndicator />;
  }
  if (!isCVOnboarded(cv)) {
    //CV is incomplete, redirect to onboarding
    navigate('/onboarding');
    return <LoadingIndicator />;
  }
  return (
    <>
      <div className="flex flex-row-reverse">
        <Button onClick={() => logout()} variant="outline" className="btn-custom">
          <LogOut className="h-4 w-4 mr-2" />
        </Button>
        <Button onClick={() => navigate('/plans')} variant="outline" className="btn-custom">
          <Award className="h-4 w-4 mr-2" />
        </Button>
        <Button onClick={() => navigate('/cv-data')} variant="outline" className="btn-custom">
          <UserRoundPen className="h-4 w-4 mr-2" />
        </Button>
        <Button onClick={() => navigate('/export-pdf')} variant="outline" className="btn-custom">
          <Download className="h-4 w-4 mr-2" />
          Export my CV
        </Button>
      </div>
      <div>
        <TailoredCVs />
      </div>
    </>
  );
}
