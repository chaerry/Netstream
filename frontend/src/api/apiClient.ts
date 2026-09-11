import axios from 'axios';
import { useState, useEffect } from 'react';
import keycloak from '../auth/keycloak';
import { appConfig } from '../config/appConfig';

export const API_BASE_URL = appConfig.api.baseUrl;

// Network Activity Tracker
type LoadingListener = (isLoading: boolean, activeCount: number) => void;
const listeners = new Set<LoadingListener>();
let activeRequests = 0;

function notifyListeners() {
  const isLoading = activeRequests > 0;
  listeners.forEach((cb) => cb(isLoading, activeRequests));
}

export function subscribeNetworkActivity(callback: LoadingListener) {
  listeners.add(callback);
  callback(activeRequests > 0, activeRequests);
  return () => {
    listeners.delete(callback);
  };
}

export function useNetworkActivity() {
  const [isLoading, setIsLoading] = useState<boolean>(activeRequests > 0);
  const [activeCount, setActiveCount] = useState<number>(activeRequests);

  useEffect(() => {
    return subscribeNetworkActivity((loading, count) => {
      setIsLoading(loading);
      setActiveCount(count);
    });
  }, []);

  return { isLoading, activeCount };
}

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
    Accept: 'application/json',
  },
  timeout: 10000,
});

// Request Interceptor
apiClient.interceptors.request.use(
  async (config) => {
    activeRequests++;
    notifyListeners();

    // 1. Check Keycloak JS token
    if (keycloak && keycloak.authenticated && keycloak.token) {
      config.headers.Authorization = `Bearer ${keycloak.token}`;
      return config;
    }

    // 2. Check token stored from Direct Credentials Grant
    const savedAuth = sessionStorage.getItem('netstream_auth_session');
    if (savedAuth) {
      try {
        const parsed = JSON.parse(savedAuth);
        if (parsed.token) {
          config.headers.Authorization = `Bearer ${parsed.token}`;
        }
      } catch (e) {
        // ignore
      }
    }

    return config;
  },
  (error) => {
    activeRequests = Math.max(0, activeRequests - 1);
    notifyListeners();
    return Promise.reject(error);
  }
);

// Response Interceptor
apiClient.interceptors.response.use(
  (response) => {
    activeRequests = Math.max(0, activeRequests - 1);
    notifyListeners();
    return response;
  },
  (error) => {
    activeRequests = Math.max(0, activeRequests - 1);
    notifyListeners();
    return Promise.reject(error);
  }
);

export default apiClient;

