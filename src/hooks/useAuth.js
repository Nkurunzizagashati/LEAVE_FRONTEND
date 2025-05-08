import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import authService from '../services/authService';

export const useAuth = () => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const token = sessionStorage.getItem('token');
        if (!token) {
          setLoading(false);
          return;
        }

        const userData = await authService.getCurrentUser();
        setUser(userData);
      } catch (err) {
        setError(err.message);
        sessionStorage.removeItem('token');
      } finally {
        setLoading(false);
      }
    };

    checkAuth();
  }, []);

  const login = async (credentials) => {
    try {
      setLoading(true);
      setError(null);
      const response = await authService.login(credentials);
      
      // Store the complete response in localStorage
      localStorage.setItem('authResponse', JSON.stringify(response));
      
      const { userId } = response;
      localStorage.setItem('userId', userId);
      navigate('/setup-2fa');
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Login failed');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    authService.logout();
    localStorage.removeItem('userId');
    localStorage.removeItem('authResponse'); // Clear the stored response on logout
    setUser(null);
    navigate('/login');
  };

  const setup2FA = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await authService.setup2FA();
      return response;
    } catch (err) {
      setError(err.response?.data?.message || err.message || '2FA setup failed');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const verify2FASetup = async (code) => {
    try {
      setLoading(true);
      setError(null);
      const response = await authService.verify2FA(code);
      if (response.token) {
        sessionStorage.setItem('token', response.token);
        navigate('/dashboard');
      }
      return response;
    } catch (err) {
      setError(err.response?.data?.message || err.message || '2FA verification failed');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const verify2FA = async (code) => {
    try {
      setLoading(true);
      setError(null);
      console.log('Verifying code:', code); // Debug log
      if (!code) {
        throw new Error('Verification code is required');
      }
      const response = await authService.verify2FA(code);
      if (response.token) {
        sessionStorage.setItem('token', response.token);
        navigate('/dashboard');
      }
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Verification failed');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const isAuthenticated = () => {
    return authService.isAuthenticated();
  };

  // Helper function to get the stored auth response
  const getStoredAuthResponse = () => {
    const storedResponse = localStorage.getItem('authResponse');
    return storedResponse ? JSON.parse(storedResponse) : null;
  };

  return {
    user,
    loading,
    error,
    login,
    logout,
    setup2FA,
    verify2FASetup,
    verify2FA,
    isAuthenticated,
    getStoredAuthResponse,
  };
}; 