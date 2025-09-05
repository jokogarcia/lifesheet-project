import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/auth-hook';
import { useUserCV } from '@/hooks/use-cv';
import { LoadingIndicator } from './ui/loading-indicator';
import { isCVOnboarded } from '@/services/cvs-service';
import { Card } from '@radix-ui/themes';
import { CardContent, CardFooter, CardHeader } from './ui/card';

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
    <div className="max-w-6xl mx-auto">
      <header className="mb-8">
        <div className="flex flex-col items-center">
          <h1 className="text-4xl text-gradient mb-2">Welcome, {cv?.personal_info.fullName || 'User'}</h1>
          <p className="text-muted-foreground">Manage your CVs, subscriptions, and more</p>
        </div>
      </header>
      {/* Dashboard Cards */}
      <div className="flex mt-16 mb-8 flex-wrap justify-center" >
        <DashboardCard title="Export my CV" img='export.png' bottomText="Export your full, untailored CV as a PDF file." onClick={() => navigate('/export-pdf')} />
        <DashboardCard title="Edit CV Data" img='edit-cv.png' bottomText="Edit your Personal Information, Work Experience, Education, Skills, or add a Profile Photo." onClick={() => navigate('/cv-data')} />
        <DashboardCard title="CV Tailoring" img='tailor-cv.png' bottomText="Tailor a CV to a job, based on the job description and requirements." onClick={() => navigate('/tailor-cv')} />
        <DashboardCard title="Tailored CVs" img='doc-list.png' bottomText="View and manage your tailored CVs." onClick={() => navigate('/tailored-cvs')} />
        <DashboardCard title="My Subscription" img='subscriptions.png' bottomText="View or change your current subscription." onClick={() => navigate('/plans')} />
        <DashboardCard title="Sign out" img='logout.png' bottomText="Sign out of your account." onClick={() => logout()} />
      </div>


    </div>
  );
}
function DashboardCard({ title, img, bottomText, onClick }: { title: string; img: string; bottomText: string; onClick: () => void }) {
  return (
    <Card className='flex flex-col border-2 card-hover cursor-pointer w-75 m-2 ' onClick={onClick}>
      <CardHeader>
        <h2 className='text-lg font-semibold'>{title}</h2>
      </CardHeader>
      <CardContent>
        <img src={img} alt={title} className='h-auto w-30 mx-auto mb-2' />
      </CardContent>
      <CardFooter className='mt-auto p-4 pt-0'>
        <p className='text-sm text-muted-foreground align-middle text-center'>{bottomText}</p>
      </CardFooter>

    </Card>
  );
}