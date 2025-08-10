import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import '@/styles/globals.css'
import App from './App.tsx'
import { Auth0Provider } from '@auth0/auth0-react'
import { constants } from './constants.ts'
import { BrowserRouter } from 'react-router-dom'
createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <BrowserRouter>
      <Auth0Provider
        domain={constants.AUTH0_DOMAIN}
        clientId={constants.AUTH0_CLIENT_ID}
        authorizationParams={{
          redirect_uri: constants.appUrl,
          audience: constants.AUTH0_AUDIENCE,
          scope: 'openid profile email'
        }}
        //These settings fix the user being logged out on refresh in Firefox
        useRefreshTokens={true} 
        cacheLocation="localstorage"
        cookieDomain={window.location.hostname}
      >
        <App />
      </Auth0Provider>
    </BrowserRouter>
  </StrictMode>,
)
