import Keycloak from 'keycloak-js';
import { appConfig } from '../config/appConfig';

export const keycloakConfig = {
  url: appConfig.keycloak.url,
  realm: appConfig.keycloak.realm,
  clientId: appConfig.keycloak.clientId,
};

const keycloak = new Keycloak(keycloakConfig);

export const initKeycloak = async (onSuccess: () => void, onError: (err: any) => void) => {
  try {
    const authenticated = await keycloak.init({
      pkceMethod: 'S256',
      checkLoginIframe: false,
    });

    if (authenticated) {
      onSuccess();
    } else {
      onSuccess();
    }
  } catch (error) {
    console.warn('[Keycloak] Init info:', error);
    onError(error);
  }
};

export default keycloak;
