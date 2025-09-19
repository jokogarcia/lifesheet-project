import { useNavigate } from 'react-router-dom';
import { useUserCV } from '@/hooks/use-cv';
import { LoadingIndicator } from './ui/loading-indicator';
import { isCVOnboarded } from '@/services/cvs-service';
import { Card } from '@radix-ui/themes';
import { CardContent, CardFooter, CardHeader } from './ui/card';
import { FormattedMessage, useIntl } from 'react-intl';
import { LanguageSelector } from './ui/language-selector';
import React from 'react';

export function Dashboard() {
  const intl = useIntl();
  const navigate = useNavigate();
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
        <div className="flex justify-end mb-2">
          <LanguageSelector />
        </div>
        <div className="flex flex-col items-center">
          <h1 className="text-4xl text-gradient mb-2">
            <FormattedMessage
              id="dashboard.welcome"
              defaultMessage="Welcome, {name}"
              values={{ name: cv?.personal_info.fullName || intl.formatMessage({ id: "dashboard.user", defaultMessage: "User" }) }}
            />
          </h1>
          <p className="text-muted-foreground">
            <FormattedMessage
              id="dashboard.subtitle"
              defaultMessage="Manage your CVs, subscriptions, and more"
            />
          </p>
        </div>
      </header>
      {/* Dashboard Cards */}
      <div className="flex mt-16 mb-8 flex-wrap justify-center" >
        <DashboardCard
          title={<FormattedMessage id="dashboard.exportMyCV" defaultMessage="Export my CV" />}
          img='export.png'
          bottomText={<FormattedMessage id="dashboard.exportMyCV.description" defaultMessage="Export your full, untailored CV as a PDF file." />}
          onClick={() => navigate('/export-pdf')}
        />
        <DashboardCard
          title={<FormattedMessage id="dashboard.editCVData" defaultMessage="Edit CV Data" />}
          img='edit-cv.png'
          bottomText={<FormattedMessage id="dashboard.editCVData.description" defaultMessage="Edit your Personal Information, Work Experience, Education, Skills, or add a Profile Photo." />}
          onClick={() => navigate('/cv-data')}
        />
        <DashboardCard
          title={<FormattedMessage id="dashboard.cvTailoring" defaultMessage="CV Tailoring" />}
          img='tailor-cv.png'
          bottomText={<FormattedMessage id="dashboard.cvTailoring.description" defaultMessage="Tailor a CV to a job, based on the job description and requirements." />}
          onClick={() => navigate('/tailor-cv')}
        />
        <DashboardCard
          title={<FormattedMessage id="dashboard.tailoredCVs" defaultMessage="Tailored CVs" />}
          img='doc-list.png'
          bottomText={<FormattedMessage id="dashboard.tailoredCVs.description" defaultMessage="View and manage your tailored CVs." />}
          onClick={() => navigate('/tailored-cvs')}
        />
        <DashboardCard
          title={<FormattedMessage id="dashboard.mySubscription" defaultMessage="My Subscription" />}
          img='subscriptions.png'
          bottomText={<FormattedMessage id="dashboard.mySubscription.description" defaultMessage="View or change your current subscription." />}
          onClick={() => navigate('/plans')}
        />
        <DashboardCard
          title={<FormattedMessage id="dashboard.myAccount" defaultMessage="My Account" />}
          img='my-account.png'
          bottomText={<FormattedMessage id="dashboard.myAccount.description" defaultMessage="Manage your account, password, log-out or delete your account." />}
          onClick={() => navigate('/my-account')}
        />
      </div>


    </div>
  );
}
function DashboardCard({ title, img, bottomText, onClick }: { title: React.ReactNode; img: string; bottomText: React.ReactNode; onClick: () => void }) {
  // For image alt text, use a simplified approach
  const getAltText = () => {
    return img.replace('.png', '');
  };

  return (
    <Card className='flex flex-col border-2 card-hover cursor-pointer w-75 m-2 ' onClick={onClick}>
      <CardHeader>
        <h2 className='text-lg font-semibold'>{title}</h2>
      </CardHeader>
      <CardContent>
        <img src={img} alt={getAltText()} className='h-auto w-30 mx-auto mb-2' />
      </CardContent>
      <CardFooter className='mt-auto p-4 pt-0'>
        <p className='text-sm text-muted-foreground align-middle text-center'>{bottomText}</p>
      </CardFooter>

    </Card>
  );
}