/**
 * Centralized Application Configuration
 * Reads from Vite Environment variables (.env / import.meta.env) with fallback to window.__ENV__
 */

declare global {
  interface Window {
    __ENV__?: Record<string, string>;
  }
}

const getEnv = (key: keyof ImportMetaEnv, defaultValue: string): string => {
  if (typeof window !== 'undefined' && window.__ENV__ && window.__ENV__[key]) {
    return window.__ENV__[key];
  }
  if (import.meta && import.meta.env && import.meta.env[key]) {
    return import.meta.env[key];
  }
  return defaultValue;
};

export const appConfig = {
  api: {
    baseUrl: getEnv('VITE_API_BASE_URL', 'http://145.79.8.141:8070'),
  },
  keycloak: {
    url: getEnv('VITE_KEYCLOAK_URL', 'https://keycloak.aitiserve.co.id:8095'),
    realm: getEnv('VITE_KEYCLOAK_REALM', 'aitiserve'),
    clientId: getEnv('VITE_KEYCLOAK_CLIENT_ID', 'itsm_gaharu'),
    clientSecret: getEnv('VITE_KEYCLOAK_CLIENT_SECRET', 'itsm123'),
  },
};

export default appConfig;
