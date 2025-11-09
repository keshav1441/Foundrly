import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '../contexts/AuthContext';

export default function Home() {
  const navigate = useNavigate();
  const { user, mockLogin, loading } = useAuth();
  const [mockEmail, setMockEmail] = useState('');
  const [mockName, setMockName] = useState('');
  const [showMockForm, setShowMockForm] = useState(false);

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
    window.location.href = `/api/auth/${provider}`;
  };

  const handleMockLogin = async (e) => {
    e.preventDefault();
    try {
      await mockLogin(mockEmail || 'test@foundrly.com', mockName || 'Test User');
      navigate('/swipe');
    } catch (error) {
      alert('Login failed. Please try again.');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-dark relative overflow-hidden">
      {/* Back Button */}
      <motion.button
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={handleBack}
        className="fixed top-6 left-6 z-50 text-textGray hover:text-netflixRed transition flex items-center gap-2"
      >
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
        </svg>
        <span className="font-semibold">Back</span>
      </motion.button>

      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <motion.div
          animate={{
            scale: [1, 1.2, 1],
            opacity: [0.3, 0.5, 0.3],
          }}
          transition={{ duration: 8, repeat: Infinity }}
          className="absolute top-0 right-0 w-96 h-96 bg-netflixRed/20 rounded-full blur-3xl"
        />
        <motion.div
          animate={{
            scale: [1, 1.3, 1],
            opacity: [0.2, 0.4, 0.2],
          }}
          transition={{ duration: 10, repeat: Infinity, delay: 1 }}
          className="absolute bottom-0 left-0 w-96 h-96 bg-purple-600/20 rounded-full blur-3xl"
        />
      </div>

      {/* Content */}
      <div className="relative z-10 container mx-auto px-4 py-20 flex flex-col items-center justify-center min-h-screen">
        {/* Logo */}
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: 'spring', duration: 0.8 }}
          className="mb-8"
        >
          <h1 className="text-7xl md:text-9xl font-bold bg-gradient-to-r from-netflixRed via-red-400 to-pink-500 bg-clip-text text-transparent">
            Foundrly
          </h1>
        </motion.div>

        {/* Tagline */}
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="text-xl md:text-2xl text-textGray mb-4 text-center max-w-2xl"
        >
          Find your cofounder for the next dumb unicorn.
        </motion.p>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="text-lg text-textGray/80 mb-12 text-center italic"
        >
          Because every bad founder needs company.
        </motion.p>

        {/* Login Card */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="bg-cardBg/50 backdrop-blur-xl rounded-2xl shadow-2xl p-8 max-w-md w-full border border-gray-800"
        >
          <div className="space-y-4">
            {/* Google Login */}
            <motion.button
              whileHover={{ scale: 1.02, boxShadow: '0 0 20px rgba(229, 9, 20, 0.3)' }}
              whileTap={{ scale: 0.98 }}
              onClick={() => handleOAuthLogin('google')}
              className="w-full bg-white text-gray-800 py-3 px-4 rounded-lg font-semibold hover:bg-gray-100 transition flex items-center justify-center gap-3"
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

            {/* GitHub Login */}
            <motion.button
              whileHover={{ scale: 1.02, boxShadow: '0 0 20px rgba(229, 9, 20, 0.3)' }}
              whileTap={{ scale: 0.98 }}
              onClick={() => handleOAuthLogin('github')}
              className="w-full bg-gray-900 text-white py-3 px-4 rounded-lg font-semibold hover:bg-gray-800 transition flex items-center justify-center gap-3 border border-gray-700"
            >
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
              </svg>
              Continue with GitHub
            </motion.button>

            {/* Divider */}
            <div className="relative my-6">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-700"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-cardBg text-textGray">Or use mock login</span>
              </div>
            </div>

            {/* Mock Login Button */}
            {!showMockForm && (
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => setShowMockForm(true)}
                className="w-full bg-netflixRed/20 text-textLight py-3 px-4 rounded-lg font-semibold hover:bg-netflixRed/30 transition border border-netflixRed/50"
              >
                Quick Demo Login
              </motion.button>
            )}

            {/* Mock Login Form */}
            {showMockForm && (
              <motion.form
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                onSubmit={handleMockLogin}
                className="space-y-3"
              >
                <input
                  type="email"
                  placeholder="Email (optional)"
                  value={mockEmail}
                  onChange={(e) => setMockEmail(e.target.value)}
                  className="w-full bg-darkBg border border-gray-700 rounded-lg px-4 py-3 text-textLight focus:outline-none focus:border-netflixRed transition"
                />
                <input
                  type="text"
                  placeholder="Name (optional)"
                  value={mockName}
                  onChange={(e) => setMockName(e.target.value)}
                  className="w-full bg-darkBg border border-gray-700 rounded-lg px-4 py-3 text-textLight focus:outline-none focus:border-netflixRed transition"
                />
                <motion.button
                  whileHover={{ scale: 1.02, boxShadow: '0 0 20px rgba(229, 9, 20, 0.5)' }}
                  whileTap={{ scale: 0.98 }}
                  type="submit"
                  className="w-full bg-netflixRed text-white py-3 px-4 rounded-lg font-semibold hover:bg-accentHover transition"
                >
                  Login
                </motion.button>
              </motion.form>
            )}
          </div>
        </motion.div>

        {/* Footer Text */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8 }}
          className="text-xs text-textGray/60 mt-8 text-center max-w-md"
        >
          By continuing, you agree to our Terms of Service and Privacy Policy.
          <br />
          (Just kidding, this is a demo.)
        </motion.p>
      </div>
    </div>
  );
}
