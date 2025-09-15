import { useKeycloak } from '@react-keycloak/web';
import { Routes, Route } from 'react-router-dom';
import { IntlProvider, FormattedMessage } from 'react-intl';
import { useEffect, useState } from 'react';

import './App.css';
import { CVData } from './components/cv-data';
import { Welcome } from './components/welcome';
import cvsService from './services/cvs-service';
import userService from './services/user-service';
import { TailorCV } from './components/tailor-cv';
import { PlansPage } from './components/plans/plans-page';
import { CheckoutPage } from './components/plans/checkout-page';
import { CheckoutSuccessPage } from './components/plans/checkout-success';
import { CheckoutCancelPage } from './components/plans/checkout-cancel';
import { ExportPdf } from './components/export-pdf';
import TailoredCVs from './components/tailored-cvs';
import { Onboarding } from './components/onboarding';
import { Dashboard } from './components/dashboard';
import { LoadingIndicator } from './components/ui/loading-indicator';
import { LanguageProvider, useLanguage } from './contexts/language-context';

function App() {
  const { keycloak, initialized } = useKeycloak();
  const [hasToken, setHasToken] = useState(false);
  useEffect(() => {
    if (initialized && keycloak?.authenticated) {
      setHasToken(false);
      const token = keycloak.token;
      if (token) {
        cvsService.setAuthToken(token);
        userService.setAuthToken(token);
        setHasToken(true);
      }
    }
  }, [initialized, keycloak]);

  if (!initialized) {
    return <LoadingIndicator />;
  }

  return (
    <LanguageProvider>
      <AppWithLanguage
        initialized={initialized}
        keycloak={keycloak}
        hasToken={hasToken}
      />
    </LanguageProvider>
  );
}

// Inner component to access language context
function AppWithLanguage({ initialized, keycloak, hasToken }: {
  initialized: boolean;
  keycloak: any;
  hasToken: boolean;
}) {
  const { currentLanguage } = useLanguage();
  const [messages, setMessages] = useState<Record<string, string>>({});

  // Load the translations for the current language
  useEffect(() => {
    const loadMessages = async () => {
      try {
        const messagesModule = await import(`./translations/${currentLanguage}.json`);
        setMessages(messagesModule.default || {});
      } catch (error) {
        console.error(`Error loading messages for ${currentLanguage}:`, error);
        // Fallback to English if translation file can't be loaded
        const fallbackModule = await import('./translations/en.json');
        setMessages(fallbackModule.default || {});
      }
    };
    loadMessages();
  }, [currentLanguage]);

  if (!initialized) {
    return <LoadingIndicator />;
  }

  if (!keycloak?.authenticated || !hasToken) {
    return (
      <IntlProvider locale={currentLanguage} messages={messages}>
        <Welcome />
      </IntlProvider>
    );
  }

  return (
    <IntlProvider locale={currentLanguage} messages={messages}>
      <Routes>
        <Route path="/" element={<Dashboard />} />
        <Route path="/cv-data" element={<CVData />} />
        <Route path="/tailor-cv" element={<TailorCV />} />
        <Route path="/plans" element={<PlansPage />} />
        <Route path="/checkout" element={<CheckoutPage />} />
        <Route path="/checkout-success" element={<CheckoutSuccessPage />} />
        <Route path="/checkout-cancel" element={<CheckoutCancelPage />} />
        <Route path="/export-pdf" element={<ExportPdf />} />
        <Route path="/tailored-cvs" element={<TailoredCVs />} />
        <Route path="/onboarding" element={<Onboarding />} />
        <Route path="/logout" element={<Logout />} />
      </Routes>
    </IntlProvider>
  );
}
function Logout() {
  const { keycloak } = useKeycloak();
  const url = new URL(window.location.href);
  const redirect = url.protocol + '//' + url.host;
  useEffect(() => {
    keycloak.logout({ redirectUri: redirect })
  }, [keycloak]);
  return <div><FormattedMessage id="app.loggingOut" defaultMessage="Logging out..." /></div>;
}
export default App;
