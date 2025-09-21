import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import '@/styles/globals.css';
import App from './App.tsx';
import { ReactKeycloakProvider } from '@react-keycloak/web';
import keycloak from './keycloak';
import { BrowserRouter } from 'react-router-dom';
import '@stripe/stripe-js';
import userService from './services/user-service.ts';
import saasService from './services/saas-service.ts';
import { PostHogErrorBoundary, PostHogProvider } from "posthog-js/react";
import type { ConfigDefaults } from 'posthog-js';
import { constants } from './constants';
import { ErrorPage } from './components/ui/error-page.tsx';

const posthogOptions = {
  api_host: constants.PUBLIC_POSTHOG_HOST,
  defaults: "2025-05-24" as unknown as ConfigDefaults,
}

createRoot(document.getElementById('root')!).render(
  <ReactKeycloakProvider
    authClient={keycloak}
    onTokens={(tokens) => {
      if (tokens.token) {
        userService.setAuthToken(tokens.token);
        // Note: CVsService now uses function-based approach with authToken parameter
        // No need to set auth token globally anymore
        saasService.setAuthToken(tokens.token);
        console.log("Token refreshed on ", new Date().toISOString());
      }
      else {
        console.log("Token absent on onTokens callback", new Date().toISOString());
      }
    }}>
    <StrictMode>
      <PostHogProvider apiKey={constants.PUBLIC_POSTHOG_KEY} options={posthogOptions}>
        <PostHogErrorBoundary
          fallback={<ErrorPage />} // (Optional) Add a fallback component that's shown when an error happens.
        >
          <BrowserRouter>
            <App />
          </BrowserRouter>
        </PostHogErrorBoundary>
      </PostHogProvider>
    </StrictMode>
  </ReactKeycloakProvider>
);