import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import '@/styles/globals.css';
import App from './App.tsx';
import { ReactKeycloakProvider } from '@react-keycloak/web';
import keycloak from './keycloak';
import { BrowserRouter } from 'react-router-dom';
import '@stripe/stripe-js';
import userService from './services/user-service.ts';
import cvsService from './services/cvs-service.ts';
import saasService from './services/saas-service.ts';

createRoot(document.getElementById('root')!).render(
  <ReactKeycloakProvider
    authClient={keycloak}
    onTokens={(tokens) => {
      if (tokens.token) {
        userService.setAuthToken(tokens.token);
        cvsService.setAuthToken(tokens.token);
        saasService.setAuthToken(tokens.token);
        console.log("Token refreshed on ", new Date().toISOString());
      }
      else {

        console.log("Token absent on onTokens callback", new Date().toISOString());

      }
    }}>
    <StrictMode>
      <BrowserRouter>
        <App />
      </BrowserRouter>
    </StrictMode>
  </ReactKeycloakProvider>
);
