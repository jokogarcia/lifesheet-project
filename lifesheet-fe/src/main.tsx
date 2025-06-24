import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import '@/styles/globals.css'
import App from './App.tsx'
import { Auth0Provider } from '@auth0/auth0-react'
import { constants } from './constants.ts'
createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <Auth0Provider
      domain={constants.AUTH0_DOMAIN}
      clientId={constants.AUTH0_CLIENT_ID}
      authorizationParams={{
        redirect_uri: constants.appUrl
      }}
    >
      <App />
    </Auth0Provider>,
  </StrictMode>,
)
