import Keycloak from 'keycloak-js';
import { constants } from '@/constants';

const keycloak = new Keycloak({
  url: `https://${constants.AUTH_DOMAIN}`,
  realm: constants.AUTH_REALM,
  clientId: constants.AUTH_CLIENT_ID,
});

export default keycloak;
