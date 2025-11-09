import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '../contexts/AuthContext';
import { api } from '../api/api';
import Avatar from '../components/Avatar';

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
                        <div className="relative z-10 border-2 border-netflixRed/30 group-hover:border-netflixRed transition rounded-full overflow-hidden">
                          <Avatar
                            src={otherUser.avatar}
                            name={otherUser.name}
                            size="lg"
                          />
                        </div>
                      </div>

                      <div className="p-6">
                        <h3 className="text-xl font-light text-textLight mb-1 group-hover:text-netflixRed transition">
                          {otherUser.name}
                        </h3>
                        <p className="text-textGray text-sm mb-2 font-light">
                          {otherUser.role || 'Founder'}
                        </p>

                        {/* LinkedIn & Interests */}
                        {otherUser.linkedinUrl && (
                          <div className="mb-2">
                            <a
                              href={otherUser.linkedinUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              onClick={(e) => e.stopPropagation()}
                              className="text-netflixRed hover:text-netflixRed/80 transition font-light flex items-center gap-1 text-xs"
                            >
                              <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 24 24">
                                <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
                              </svg>
                              LinkedIn
                            </a>
                          </div>
                        )}
                        {otherUser.interests && otherUser.interests.length > 0 && (
                          <div className="mb-3">
                            <div className="flex flex-wrap gap-1">
                              {otherUser.interests.slice(0, 3).map((interest, idx) => (
                                <span
                                  key={idx}
                                  className="px-2 py-0.5 bg-netflixRed/10 border border-netflixRed/30 rounded-full text-textLight text-xs font-light"
                                >
                                  {interest}
                                </span>
                              ))}
                              {otherUser.interests.length > 3 && (
                                <span className="px-2 py-0.5 text-textGray text-xs font-light">
                                  +{otherUser.interests.length - 3}
                                </span>
                              )}
                            </div>
                          </div>
                        )}

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
