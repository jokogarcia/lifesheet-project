import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useAuth } from '@/hooks/auth-hook';
import { FormattedMessage, useIntl } from 'react-intl';
import { LanguageSelector } from './ui/language-selector';
export function Welcome() {
  const { loginWithRedirect } = useAuth();
  const intl = useIntl();
  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white">
      <div className="container mx-auto px-4 py-16">
        <div className="flex justify-end mb-4">
          <LanguageSelector />
        </div>
        <div className="mb-12 text-center">
          <h1 className="text-4xl font-bold mb-4"><FormattedMessage id="welcome.title" defaultMessage="Welcome to LifeSheet" /></h1>
          <p className="text-xl text-gray-600"><FormattedMessage id="welcome.subtitle" defaultMessage="Your CV management and tailoring solution" /></p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center mb-16">
          <div>
            <h2 className="text-3xl font-bold mb-6"><FormattedMessage id="welcome.manageYourJourney" defaultMessage="Manage Your Professional Journey" /></h2>
            <p className="text-lg mb-4">
              <FormattedMessage id="welcome.manageYourJourney.description" defaultMessage="LifeSheet helps you organize, update, and tailor your CV for different job applications, ensuring you always put your best foot forward." />
            </p>
            <Button
              size="lg"
              onClick={() => {
                loginWithRedirect();
              }}
              className="mt-4"
            >
              <FormattedMessage id="welcome.getStarted" defaultMessage="Get Started" />
            </Button>
          </div>
          <div className="relative h-64 md:h-96">
            <img
              src="/dashboard.png"
              alt={intl.formatMessage({ id: "welcome.dashboardPreview", defaultMessage: "LifeSheet Dashboard Preview" })}
              className="rounded-lg shadow-lg h-64 md:h-96 resize-y w-auto"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
          <Card>
            <CardHeader>
              <CardTitle><FormattedMessage id="welcome.storeAndOrganize" defaultMessage="Store & Organize" /></CardTitle>
            </CardHeader>
            <CardContent>
              <p>
                <FormattedMessage id="welcome.storeAndOrganize.description" defaultMessage="Keep all your professional experience, education, and skills in one place. Never lose track of your achievements." />
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle><FormattedMessage id="welcome.tailorAndCustomize" defaultMessage="Tailor & Customize" /></CardTitle>
            </CardHeader>
            <CardContent>
              <p>
                <FormattedMessage id="welcome.tailorAndCustomize.description" defaultMessage="Adjust your CV for specific job applications. Highlight relevant experience and skills for each opportunity." />
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle><FormattedMessage id="welcome.exportAndShare" defaultMessage="Export & Share" /></CardTitle>
            </CardHeader>
            <CardContent>
              <p>
                <FormattedMessage id="welcome.exportAndShare.description" defaultMessage="Generate professional-looking CVs in multiple formats and share them directly with potential employers." />
              </p>
            </CardContent>
          </Card>
        </div>

        <div className="text-center">
          <h2 className="text-2xl font-bold mb-4"><FormattedMessage id="welcome.readyToLevelUp" defaultMessage="Ready to level up your job applications?" /></h2>
          <Button
            size="lg"
            onClick={() => {
              loginWithRedirect();
            }}
            variant="default"
            className="mt-2"
          >
            <FormattedMessage id="welcome.signInToGetStarted" defaultMessage="Sign In to Get Started" />
          </Button>
        </div>
      </div>
    </div>
  );
}
