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
      <div className="min-h-screen bg-gradient-dark flex items-center justify-center pt-20">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
          className="w-16 h-16 border-4 border-netflixRed border-t-transparent rounded-full"
        />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-dark pt-20 pb-12 px-4">
      <div className="container mx-auto max-w-6xl">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <h1 className="text-5xl font-bold text-textLight mb-4">
            Your Matches
          </h1>
          <p className="text-textGray text-lg">
            Matched with Fellow Delusionists
          </p>
        </motion.div>

        {matches.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-center py-20"
          >
            <div className="text-6xl mb-4">😢</div>
            <h2 className="text-2xl font-semibold text-textLight mb-2">
              No matches yet
            </h2>
            <p className="text-textGray mb-8">
              Keep swiping to find your cofounder!
            </p>
            <Link to="/swipe">
              <motion.button
                whileHover={{ scale: 1.05, boxShadow: '0 0 20px rgba(229, 9, 20, 0.5)' }}
                whileTap={{ scale: 0.95 }}
                className="bg-netflixRed text-white px-8 py-3 rounded-lg font-semibold"
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
                  transition={{ delay: index * 0.1 }}
                  whileHover={{ scale: 1.03, y: -5 }}
                >
                  <Link to={`/chat/${match._id}`}>
                    <div className="bg-gradient-card rounded-xl overflow-hidden border border-gray-800 shadow-card hover:border-netflixRed/50 transition-all group">
                      <div className="relative h-48 bg-gradient-to-br from-darkPurple to-darkRed flex items-center justify-center overflow-hidden">
                        <motion.div
                          animate={{
                            scale: [1, 1.05, 1],
                          }}
                          transition={{ duration: 3, repeat: Infinity }}
                          className="absolute inset-0 bg-gradient-to-br from-netflixRed/20 to-purple-600/20"
                        />
                        <div className="relative z-10 w-24 h-24 rounded-full overflow-hidden border-4 border-netflixRed shadow-glow">
                          <img
                            src={otherUser.avatar || `https://ui-avatars.com/api/?name=${otherUser.name}`}
                            alt={otherUser.name}
                            className="w-full h-full object-cover"
                          />
                        </div>
                      </div>

                      <div className="p-5">
                        <h3 className="text-xl font-bold text-textLight mb-1 group-hover:text-netflixRed transition">
                          {otherUser.name}
                        </h3>
                        <p className="text-textGray text-sm mb-3">
                          {otherUser.role || 'Founder'}
                        </p>

                        <div className="flex items-center justify-between text-sm">
                          <span className="text-textGray">
                            Matched on: <span className="text-textLight font-semibold">{match.idea?.name}</span>
                          </span>
                        </div>

                        <motion.div
                          whileHover={{ x: 5 }}
                          className="mt-4 text-netflixRed font-semibold flex items-center gap-2"
                        >
                          Start Chat
                          <span>→</span>
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
