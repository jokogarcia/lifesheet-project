export const constants = {
  API_URL: import.meta.env.VITE_API_URL || window.location.origin + '/api',
  AUTH_DOMAIN: 'auth.irazu.com.ar',
  AUTH_CLIENT_ID: 'lifesheet-webapp',
  AUTH_AUDIENCE: 'lifesheet-webapp',
  AUTH_REALM: 'lifesheet',
  PUBLIC_POSTHOG_KEY: import.meta.env.VITE_PUBLIC_POSTHOG_KEY || 'phc_XXXXXXXXXXXXXXXXXXXXXX',
  PUBLIC_POSTHOG_HOST: import.meta.env.VITE_PUBLIC_POSTHOG_HOST || 'https://us.i.posthog.com'

};
