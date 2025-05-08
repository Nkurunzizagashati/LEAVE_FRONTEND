import axios from 'axios';

// Base URLs for different services
const AUTH_API_URL = import.meta.env.VITE_AUTH_API_URL || 'http://localhost:8080/api';
const LEAVE_API_URL = import.meta.env.VITE_LEAVE_API_URL || 'http://localhost:3002/api';

// Common headers for both instances
const commonHeaders = {
  'Content-Type': 'application/json',
  'Accept': 'application/json',
  'X-Requested-With': 'XMLHttpRequest',
};

// Create separate axios instances for each service
const authApi = axios.create({
  baseURL: AUTH_API_URL,
  headers: commonHeaders,
  withCredentials: true,
  timeout: 10000, // 10 seconds timeout
});

const leaveApi = axios.create({
  baseURL: LEAVE_API_URL,
  headers: commonHeaders,
  withCredentials: true,
  timeout: 10000, // 10 seconds timeout
});

// Common request interceptor for adding auth token
const addAuthToken = (config) => {
  const storedResponse = localStorage.getItem('authResponse');
  if (storedResponse) {
    const authData = JSON.parse(storedResponse);
    if (authData.token) {
      config.headers.Authorization = `Bearer ${authData.token}`;
    }
  }
  return config;
};

// Common response interceptor for handling errors
const handleAuthError = (error) => {
  if (error.response?.status === 401) {
    // Remove token but don't redirect
    localStorage.removeItem('authResponse');
  }
  return Promise.reject(error);
};

// Apply interceptors to both instances
authApi.interceptors.request.use(addAuthToken, (error) => Promise.reject(error));
authApi.interceptors.response.use((response) => response, handleAuthError);

leaveApi.interceptors.request.use(addAuthToken, (error) => Promise.reject(error));
leaveApi.interceptors.response.use((response) => response, handleAuthError);

export { authApi, leaveApi }; 