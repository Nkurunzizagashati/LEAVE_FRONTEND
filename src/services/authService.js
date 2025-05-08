import { authApi } from './api';

const authService = {
  // Authentication
  login: async (credentials) => {
    const response = await authApi.post('/auth/login', credentials);
    if (response.data.token) {
      sessionStorage.setItem('token', response.data.token);
    }
    return response.data;
  },

  logout: () => {
    sessionStorage.removeItem('token');
  },

  // 2FA Management
  setup2FA: async () => {
    try {
      // Get the stored auth response
      const storedResponse = localStorage.getItem('authResponse');
      if (!storedResponse) {
        throw new Error('No authentication data found');
      }

      const authData = JSON.parse(storedResponse);
      const userId = authData.user.id;
      const token = authData.token;

  

      if (!userId) {
        throw new Error('User ID is required');
      }

      if (!token) {
        throw new Error('Authentication token is required');
      }

      console.log('Setting up 2FA for user:', userId);
      const response = await authApi.post('/auth/2fa/setup', {
        userId: userId,
        action: 'setup',
        timestamp: new Date().toISOString()
      }, {
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      });

      console.log('2FA Setup Response:', response.data);

      if (response.status === 403) {
        throw new Error('Access denied. Please ensure you are properly authenticated.');
      }

      if (!response.data) {
        throw new Error('No data received from server');
      }

      return response.data;
    } catch (error) {
      console.error('2FA Setup Error:', error);
      if (error.response) {
        throw new Error(error.response.data?.message || 'Failed to set up 2FA');
      } else if (error.request) {
        throw new Error('No response received from server');
      } else {
        throw error;
      }
    }
  },

  verify2FA: async (code) => {
    try {
      // Get the stored auth response
      const storedResponse = localStorage.getItem('authResponse');
      if (!storedResponse) {
        throw new Error('No authentication data found');
      }

      const authData = JSON.parse(storedResponse);
      const userId = authData.user.id;
      const token = authData.token;

      if (!userId) {
        throw new Error('User ID is required');
      }

      if (!token) {
        throw new Error('Authentication token is required');
      }

      console.log('Verifying 2FA with:', {
        userId,
        code,
        token: token.substring(0, 20) + '...' // Log partial token for security
      });

      const requestConfig = {
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      };

      console.log('Request config:', {
        ...requestConfig,
        headers: {
          ...requestConfig.headers,
          Authorization: 'Bearer [REDACTED]' // Don't log full token
        }
      });

      const response = await authApi.post('/auth/2fa/verify', { 
        userId,
        code 
      }, requestConfig);

      console.log("RESPONSE DATA: ", response.data)

      console.log('Verification response:', response.data);

      if (response.data.token) {
        // Store the new token in localStorage
        const updatedAuthData = {
          ...authData,
          token: response.data.token,
        };
        sessionStorage.setItem('authResponse', JSON.stringify(response.data));
      }
      return response.data;
    } catch (error) {
      console.error('2FA Verification Error:', {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status
      });
      if (error.response) {
        throw new Error(error.response.data?.message || 'Failed to verify 2FA code');
      } else if (error.request) {
        throw new Error('No response received from server');
      } else {
        throw error;
      }
    }
  },

  // User Profile
  getCurrentUser: async () => {
    const response = await authApi.get('/auth/me');
    return response.data;
  },

  updateUserProfile: async (profileData) => {
    const response = await authApi.put('/auth/profile', profileData);
    return response.data;
  },

  // Token Management
  refreshToken: async () => {
    const response = await authApi.post('/auth/refresh-token');
    if (response.data.token) {
      sessionStorage.setItem('token', response.data.token);
    }
    return response.data;
  },

  isAuthenticated: () => {
    return !!sessionStorage.getItem('token');
  },

  // Password Management
  changePassword: async (passwordData) => {
    const response = await authApi.put('/auth/change-password', passwordData);
    return response.data;
  },
};

export default authService; 