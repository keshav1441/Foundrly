import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '../contexts/AuthContext';
import { API_BASE_URL } from '../config/api.js';

export default function Home() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { user, emailLogin, register, loading } = useAuth();
  const [isSignup, setIsSignup] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [error, setError] = useState('');

  // Check for OAuth error in URL
  useEffect(() => {
    const errorParam = searchParams.get('error');
    if (errorParam) {
      const errorMessages = {
        'login_failed': 'Google login failed. Please try again.',
        'no_code': 'No authorization code received from Google.',
        'oauth_not_configured': 'OAuth is not properly configured on the server.',
      };
      setError(errorMessages[errorParam] || `Login error: ${errorParam}`);
      // Clear the error from URL
      navigate('/', { replace: true });
    }
  }, [searchParams, navigate]);

  // Redirect to swipe if already logged in
  useEffect(() => {
    if (!loading && user) {
      navigate('/swipe');
    }
  }, [user, loading, navigate]);

  // Show back button
  const handleBack = () => {
    navigate('/');
  };

  const handleOAuthLogin = (provider) => {
    const authUrl = `${API_BASE_URL}/auth/${provider}`;
    
    // Debug logging
    console.log('🔐 OAuth Login Debug:');
    console.log('  - Env VITE_API_BASE_URL:', import.meta.env.VITE_API_BASE_URL);
    console.log('  - Using API_BASE_URL:', API_BASE_URL);
    console.log('  - Final OAuth URL:', authUrl);
    
    // Redirect to backend OAuth endpoint
    window.location.href = authUrl;
  };

  const handleEmailAuth = async (e) => {
    e.preventDefault();
    setError('');
    
    try {
      if (isSignup) {
        if (!name.trim()) {
          setError('Name is required');
          return;
        }
        await register(email, password, name);
      } else {
        await emailLogin(email, password);
      }
      // Navigate after user state is set
      navigate('/swipe');
    } catch (error) {
      setError(error.response?.data?.error || 'Authentication failed. Please try again.');
    }
  };

  return (
    <div className="min-h-screen bg-black relative overflow-hidden">
      {/* Back Button */}
      <motion.button
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        whileHover={{ opacity: 0.8 }}
        onClick={handleBack}
        className="fixed top-4 left-4 sm:top-6 sm:left-6 z-50 text-textGray hover:text-textLight transition flex items-center gap-2"
      >
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 19l-7-7 7-7" />
        </svg>
        <span className="font-light hidden sm:inline">Back</span>
      </motion.button>

      {/* Subtle Background */}
      <div className="absolute inset-0">
        <div className="absolute top-1/4 right-1/4 w-96 h-96 bg-netflixRed/5 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 left-1/4 w-80 h-80 bg-netflixRed/3 rounded-full blur-3xl" />
      </div>

      {/* Content */}
      <div className="relative z-10 container mx-auto px-4 py-20 flex flex-col items-center justify-center min-h-screen">
        {/* Logo */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="mb-8 md:mb-12"
        >
          <h1 className="text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-light tracking-tighter text-textLight text-center">
            found<span className="text-netflixRed">r</span>ly
          </h1>
        </motion.div>

        {/* Tagline */}
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="text-base sm:text-lg md:text-xl text-textGray mb-8 md:mb-16 text-center max-w-md mx-auto px-4 font-light"
        >
          Find your cofounder for the next dumb unicorn
        </motion.p>

        {/* Login Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="bg-darkBg/50 backdrop-blur-xl rounded-lg border border-gray-900 p-6 sm:p-8 max-w-md w-full mx-4"
        >
          <div className="space-y-4">
            {/* Google Login */}
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => handleOAuthLogin('google')}
              className="w-full bg-white text-gray-800 py-3.5 px-4 rounded-md font-medium hover:bg-gray-100 transition flex items-center justify-center gap-3"
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24">
                <path
                  fill="#4285F4"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="#34A853"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                />
                <path
                  fill="#EA4335"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                />
              </svg>
              Continue with Google
            </motion.button>

            {/* Divider */}
            <div className="relative my-6">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-800"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-3 bg-darkBg/50 text-textGray font-light">or continue with email</span>
              </div>
            </div>

            {/* Email/Password Auth Form */}
            <motion.form
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              onSubmit={handleEmailAuth}
              className="space-y-4"
            >
              {isSignup && (
                <input
                  type="text"
                  placeholder="Name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                  className="w-full bg-black border border-gray-800 rounded-md px-4 py-3.5 text-textLight focus:outline-none focus:border-netflixRed/50 transition font-light"
                />
              )}
              <input
                type="email"
                placeholder="Email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full bg-black border border-gray-800 rounded-md px-4 py-3.5 text-textLight focus:outline-none focus:border-netflixRed/50 transition font-light"
              />
              <input
                type="password"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={6}
                className="w-full bg-black border border-gray-800 rounded-md px-4 py-3.5 text-textLight focus:outline-none focus:border-netflixRed/50 transition font-light"
              />
              
              {error && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="text-red-400 text-sm text-center font-light"
                >
                  {error}
                </motion.div>
              )}

              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                type="submit"
                className="w-full bg-netflixRed text-white py-3.5 px-4 rounded-md font-medium hover:bg-netflixRed/90 transition"
              >
                {isSignup ? 'Sign Up' : 'Sign In'}
              </motion.button>

              <button
                type="button"
                onClick={() => {
                  setIsSignup(!isSignup);
                  setError('');
                }}
                className="w-full text-textGray hover:text-netflixRed text-sm transition font-light"
              >
                {isSignup ? 'Already have an account? Sign in' : "Don't have an account? Sign up"}
              </button>
            </motion.form>
          </div>
        </motion.div>

        {/* Footer Text */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
          className="text-xs text-textGray/60 mt-8 text-center max-w-md font-light"
        >
          By continuing, you agree to our Terms of Service and Privacy Policy.
        </motion.p>
      </div>
    </div>
  );
}
