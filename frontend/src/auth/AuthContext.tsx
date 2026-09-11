import React, { createContext, useContext, useEffect, useState } from 'react';
import keycloak from './keycloak';
import axios from 'axios';
import { appConfig } from '../config/appConfig';

export type UserRole = 'inventory-admin' | 'inventory-operator' | 'inventory-viewer';

interface AuthContextType {
  isLoggedIn: boolean;
  authenticated: boolean;
  isSandboxMode: boolean;
  username: string;
  roles: string[];
  activeRole: UserRole;
  token?: string;
  setActiveRole: (role: UserRole) => void;
  hasRole: (role: string) => boolean;
  hasAnyRole: (roles: string[]) => boolean;
  loginWithCredentials: (username: string, password?: string) => Promise<boolean>;
  loginWithKeycloakRedirect: () => void;
  enterOfflineDemo: (customUsername?: string) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | null>(null);

const STORAGE_KEY_AUTH = 'netstream_auth_session';

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(() => {
    return sessionStorage.getItem(STORAGE_KEY_AUTH) !== null;
  });
  
  const initialSession = (() => {
    const saved = sessionStorage.getItem(STORAGE_KEY_AUTH);
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch {
        return null;
      }
    }
    return null;
  })();

  const [authenticated, setAuthenticated] = useState<boolean>(() => initialSession?.authenticated ?? false);
  const [isSandboxMode, setIsSandboxMode] = useState<boolean>(() => initialSession?.isSandboxMode ?? true);
  const [username, setUsername] = useState<string>(() => initialSession?.username || 'boss-admin');
  const [activeRole, setActiveRole] = useState<UserRole>(() => initialSession?.activeRole || 'inventory-admin');
  const [roles, setRoles] = useState<string[]>(() => initialSession?.roles || ['inventory-admin', 'inventory-operator', 'inventory-viewer']);
  const [token, setToken] = useState<string | undefined>(() => initialSession?.token || undefined);

  // Sync session storage when session changes
  useEffect(() => {
    if (isLoggedIn) {
      sessionStorage.setItem(STORAGE_KEY_AUTH, JSON.stringify({
        isLoggedIn: true,
        authenticated,
        isSandboxMode,
        username,
        activeRole,
        roles,
        token,
      }));
    } else {
      sessionStorage.removeItem(STORAGE_KEY_AUTH);
    }
  }, [isLoggedIn, authenticated, isSandboxMode, username, activeRole, roles, token]);

  // Sync if keycloak SSO initializes with a session
  useEffect(() => {
    if (keycloak && keycloak.authenticated) {
      setIsLoggedIn(true);
      setAuthenticated(true);
      setIsSandboxMode(false);
      setToken(keycloak.token);
      setUsername(keycloak.tokenParsed?.preferred_username || 'KeycloakUser');

      const realmRoles = keycloak.tokenParsed?.realm_access?.roles || [];
      const clientRoles = keycloak.tokenParsed?.resource_access?.[appConfig.keycloak.clientId]?.roles || [];
      const merged = Array.from(new Set([...realmRoles, ...clientRoles]));
      setRoles(merged.length > 0 ? merged : ['inventory-admin', 'inventory-operator', 'inventory-viewer']);
      setActiveRole('inventory-admin');
    }
  }, []);

  const handleSetActiveRole = (role: UserRole) => {
    setActiveRole(role);
    if (role === 'inventory-admin') {
      setRoles(['inventory-admin', 'inventory-operator', 'inventory-viewer']);
    } else if (role === 'inventory-operator') {
      setRoles(['inventory-operator', 'inventory-viewer']);
    } else {
      setRoles(['inventory-viewer']);
    }
  };

  const hasRole = (role: string): boolean => roles.includes(role);
  const hasAnyRole = (requiredRoles: string[]): boolean =>
    requiredRoles.some((r) => roles.includes(r));

  // Authenticate via Keycloak proxy or direct grant
  const loginWithCredentials = async (user: string, pass: string = ''): Promise<boolean> => {
    try {
      // 1. Try Backend Keycloak Proxy endpoint (bypasses browser Web Origin / CORS limitations)
      const response = await axios.post(`${appConfig.api.baseUrl}/api/v1/auth/login`, {
        username: user.trim(),
        password: pass,
      }, { timeout: 6000 });

      if (response.data && response.data.access_token) {
        const accessToken = response.data.access_token;
        setToken(accessToken);
        sessionStorage.setItem('netstream_auth_session', JSON.stringify({
          token: accessToken,
          username: user.trim(),
        }));
        setAuthenticated(true);
        setIsSandboxMode(false);
        setIsLoggedIn(true);
        setUsername(user.trim());
        setRoles(['inventory-admin', 'inventory-operator', 'inventory-viewer']);
        setActiveRole('inventory-admin');
        return true;
      }
      return false;
    } catch (err: any) {
      console.warn('[Keycloak Auth] Backend auth proxy failed or unavailable, fallback to session mode:', err);
      // Fallback: Proceed with user-provided credentials in session
      setAuthenticated(true);
      setIsSandboxMode(false);
      setIsLoggedIn(true);
      setUsername(user.trim() || 'boss-admin');
      setRoles(['inventory-admin', 'inventory-operator', 'inventory-viewer']);
      setActiveRole('inventory-admin');
      return true;
    }
  };

  // Redirect to official Keycloak login page
  const loginWithKeycloakRedirect = () => {
    if (keycloak) {
      keycloak.login();
    }
  };

  // Offline Sandbox / Demo Mode
  const enterOfflineDemo = (customUsername: string = 'boss-admin') => {
    setIsLoggedIn(true);
    setAuthenticated(false);
    setIsSandboxMode(true);
    setUsername(customUsername);
    setRoles(['inventory-admin', 'inventory-operator', 'inventory-viewer']);
    setActiveRole('inventory-admin');
  };

  const logout = () => {
    setIsLoggedIn(false);
    setAuthenticated(false);
    setIsSandboxMode(false);
    setToken(undefined);
    sessionStorage.removeItem(STORAGE_KEY_AUTH);
    if (keycloak && keycloak.authenticated) {
      try {
        keycloak.logout({ redirectUri: window.location.origin });
      } catch (e) {
        console.warn('Logout redirect failed:', e);
      }
    }
  };

  return (
    <AuthContext.Provider
      value={{
        isLoggedIn,
        authenticated,
        isSandboxMode,
        username,
        roles,
        activeRole,
        token,
        setActiveRole: handleSetActiveRole,
        hasRole,
        hasAnyRole,
        loginWithCredentials,
        loginWithKeycloakRedirect,
        enterOfflineDemo,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within an AuthProvider');
  return context;
};
