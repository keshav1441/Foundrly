import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '../contexts/AuthContext';
import { api } from '../api/api';

export default function Matches() {
  const { user } = useAuth();
  const [matches, setMatches] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadMatches();
  }, []);

  const loadMatches = async () => {
    try {
      const response = await api.getMatches();
      setMatches(response.data);
    } catch (error) {
      console.error('Failed to load matches:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center pt-20">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
          className="w-16 h-16 border-2 border-netflixRed border-t-transparent rounded-full"
        />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black pt-20 pb-12 px-4">
      <div className="container mx-auto max-w-6xl">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-12"
        >
          <h1 className="text-4xl font-light text-textLight mb-2 tracking-tight">
            Matches
          </h1>
          <p className="text-textGray font-light">
            Fellow delusionists who liked the same terrible ideas
          </p>
        </motion.div>

        {matches.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-center py-20"
          >
            <h2 className="text-2xl font-light text-textLight mb-4">
              No matches yet
            </h2>
            <p className="text-textGray mb-8 font-light">
              Keep swiping to find your cofounder
            </p>
            <Link to="/swipe">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="bg-netflixRed text-white px-8 py-3 rounded-md font-medium"
              >
                Start Swiping
              </motion.button>
            </Link>
          </motion.div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {matches.map((match, index) => {
              const otherUser = match.user1._id === user._id ? match.user2 : match.user1;
              
              return (
                <motion.div
                  key={match._id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                  whileHover={{ y: -5 }}
                >
                  <Link to={`/chat/${match._id}`}>
                    <div className="bg-darkBg/50 backdrop-blur-xl rounded-lg overflow-hidden border border-gray-900 hover:border-gray-800 transition-all group">
                      <div className="relative h-48 bg-gradient-to-br from-black via-darkBg to-black flex items-center justify-center overflow-hidden">
                        <div className="absolute inset-0 bg-netflixRed/5" />
                        <div className="relative z-10 w-24 h-24 rounded-full overflow-hidden border-2 border-netflixRed/30 group-hover:border-netflixRed transition">
                          <img
                            src={otherUser.avatar || `https://ui-avatars.com/api/?name=${otherUser.name}`}
                            alt={otherUser.name}
                            className="w-full h-full object-cover"
                          />
                        </div>
                      </div>

                      <div className="p-6">
                        <h3 className="text-xl font-light text-textLight mb-1 group-hover:text-netflixRed transition">
                          {otherUser.name}
                        </h3>
                        <p className="text-textGray text-sm mb-4 font-light">
                          {otherUser.role || 'Founder'}
                        </p>

                        {match.idea && (
                          <div className="mb-4">
                            <p className="text-xs text-textGray/60 mb-1 font-light">Matched on</p>
                            <p className="text-sm text-textLight font-light">{match.idea.name}</p>
                          </div>
                        )}

                        <motion.div
                          whileHover={{ x: 5 }}
                          className="text-netflixRed font-light flex items-center gap-2 text-sm"
                        >
                          Start chat
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                          </svg>
                        </motion.div>
                      </div>
                    </div>
                  </Link>
                </motion.div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
