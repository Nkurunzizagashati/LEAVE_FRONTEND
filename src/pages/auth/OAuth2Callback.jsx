import { useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { useToast } from '../../hooks/useToast';

export const OAuth2Callback = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { login } = useAuth();
  const { showToast } = useToast();

  useEffect(() => {
    const handleCallback = async () => {
      try {
        // Get token from URL query parameters
        const params = new URLSearchParams(location.search);
        const token = params.get('token');

        if (!token) {
          throw new Error('No token received');
        }

        // Store the token
        

        // Fetch user data using the token
        const response = await fetch('http://localhost:8080/api/auth/me', {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });

        if (response.ok) {
          const responseData = await response.json();
          console.log('Response data:', responseData); // Debug log

          // Check if responseData has the expected structure
          if (!responseData || !responseData.user) {
            console.error('Invalid response structure:', responseData);
            throw new Error('Invalid response structure from server');
          }

          // Extract user data - handle both possible structures
          const userData = responseData.user.user || responseData.user;
          
          if (!userData || !userData.id) {
            console.error('Invalid user data:', userData);
            throw new Error('Invalid user data received');
          }

          // Store the complete auth response with the correct structure
          const authResponse = {
            token,
            user: {
              id: userData.id,
              firstName: userData.firstName,
              lastName: userData.lastName,
              email: userData.email,
              role: userData.role,
              twoFactorEnabled: userData.twoFactorEnabled,
              twoFactorVerified: userData.twoFactorVerified,
              secretKey: userData.secretKey
            }
          };

          console.log('Storing auth response:', authResponse); // Debug log
          localStorage.setItem('authResponse', JSON.stringify(authResponse));
          
          showToast('Login successful!', 'success');

          // Check 2FA status and redirect accordingly
          if (userData.twoFactorEnabled) {
            if (userData.twoFactorVerified) {
              // If 2FA is already verified, go to dashboard
              navigate('/dashboard');
            } else {
              // If 2FA is enabled but not verified, go to setup
              navigate('/setup-2fa');
            }
          } else {
            // If 2FA is not enabled, go to dashboard
            navigate('/dashboard');
          }
        } else {
          const errorData = await response.json().catch(() => null);
          console.error('Server error response:', errorData);
          throw new Error(errorData?.message || 'Failed to fetch user data');
        }
      } catch (error) {
        console.error('Authentication error:', error);
        showToast(error.message || 'Authentication failed', 'error');
        navigate('/login');
      }
    };

    handleCallback();
  }, [navigate, location, login, showToast]);

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900">Completing sign in...</h2>
          <p className="mt-2 text-sm text-gray-600">Please wait while we complete your sign in</p>
        </div>
        <div className="mt-8 flex justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
        </div>
      </div>
    </div>
  );
}; 