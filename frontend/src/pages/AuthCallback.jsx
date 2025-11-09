import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

export default function AuthCallback() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { login } = useAuth();
  const [error, setError] = useState(null);

  useEffect(() => {
    const token = searchParams.get('token');
    const errorParam = searchParams.get('error');
    
    console.log('AuthCallback - Token:', token);
    console.log('AuthCallback - Error:', errorParam);
    console.log('AuthCallback - Full URL:', window.location.href);
    console.log('AuthCallback - Search params:', Object.fromEntries(searchParams.entries()));
    
    if (errorParam) {
      setError(errorParam);
      setTimeout(() => navigate('/'), 3000);
      return;
    }
    
    if (token) {
      try {
        console.log('Calling login with token:', token);
        login(token);
        // Wait a bit for localStorage to be set
        setTimeout(() => {
          const storedToken = localStorage.getItem('token');
          console.log('Token in localStorage after login:', storedToken);
          if (storedToken) {
            navigate('/swipe');
          } else {
            setError('Token was not saved to localStorage');
            setTimeout(() => navigate('/'), 3000);
          }
        }, 100);
      } catch (err) {
        console.error('Login error:', err);
        setError('Failed to complete login');
        setTimeout(() => navigate('/'), 3000);
      }
    } else {
      console.error('No token in URL');
      setError('No token received');
      setTimeout(() => navigate('/'), 3000);
    }
  }, [searchParams, login, navigate]);

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-red-50">
        <div className="text-center">
          <div className="text-2xl font-bold text-red-600 mb-2">Login Failed</div>
          <div className="text-gray-600 mb-4">{error}</div>
          <div className="text-sm text-gray-500">Redirecting to homepage...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center">
        <div className="text-xl mb-4">Completing login...</div>
        <div className="text-sm text-gray-500">
          <div>URL: {window.location.href}</div>
          <div>Token in URL: {searchParams.get('token') ? 'Yes' : 'No'}</div>
          <div>Token value: {searchParams.get('token') ? searchParams.get('token').substring(0, 20) + '...' : 'None'}</div>
        </div>
      </div>
    </div>
  );
}


