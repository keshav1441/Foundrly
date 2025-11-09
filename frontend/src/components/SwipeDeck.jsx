import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { api } from '../api/api';

export default function SwipeDeck() {
  const [ideas, setIdeas] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [swipeDirection, setSwipeDirection] = useState(null);

  useEffect(() => {
    loadIdeas();
  }, []);

  const loadIdeas = async () => {
    try {
      const response = await api.getIdeas();
      setIdeas(response.data);
    } catch (error) {
      console.error('Failed to load ideas:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSwipe = async (direction) => {
    if (currentIndex >= ideas.length) return;

    const currentIdea = ideas[currentIndex];
    setSwipeDirection(direction);

    try {
      await api.swipe(currentIdea._id, direction);
      setTimeout(() => {
        setCurrentIndex(currentIndex + 1);
        setSwipeDirection(null);
      }, 300);
    } catch (error) {
      console.error('Swipe failed:', error);
      setSwipeDirection(null);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-dark">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
          className="w-16 h-16 border-4 border-netflixRed border-t-transparent rounded-full"
        />
      </div>
    );
  }

  if (currentIndex >= ideas.length) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-dark px-4">
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          className="text-center"
        >
          <h2 className="text-4xl font-bold text-textLight mb-4">
            No more ideas to swipe!
          </h2>
          <p className="text-textGray mb-8">Check back later for more terrible startup ideas.</p>
          <motion.button
            whileHover={{ scale: 1.05, boxShadow: '0 0 20px rgba(229, 9, 20, 0.5)' }}
            whileTap={{ scale: 0.95 }}
            onClick={() => {
              setCurrentIndex(0);
              loadIdeas();
            }}
            className="bg-netflixRed text-white px-8 py-3 rounded-lg font-semibold"
          >
            Reload Ideas
          </motion.button>
        </motion.div>
      </div>
    );
  }

  const currentIdea = ideas[currentIndex];
  const progress = ((currentIndex + 1) / ideas.length) * 100;

  return (
    <div className="min-h-screen bg-gradient-dark pt-24 pb-8 px-4">
      <div className="container mx-auto max-w-2xl">
        {/* Progress Bar */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-textGray text-sm">
              {currentIndex + 1} / {ideas.length}
            </span>
            <span className="text-textGray text-sm">
              {Math.round(progress)}% Complete
            </span>
          </div>
          <div className="w-full h-1 bg-gray-800 rounded-full overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${progress}%` }}
              className="h-full bg-netflixRed"
              transition={{ duration: 0.3 }}
            />
          </div>
        </div>

        {/* Card Stack */}
        <div className="relative h-[600px] flex items-center justify-center">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentIdea._id}
              initial={{ scale: 0.8, opacity: 0, rotateY: -90 }}
              animate={{ scale: 1, opacity: 1, rotateY: 0 }}
              exit={{
                scale: 0.8,
                opacity: 0,
                x: swipeDirection === 'right' ? 300 : -300,
                rotate: swipeDirection === 'right' ? 20 : -20,
              }}
              transition={{ type: 'spring', stiffness: 300, damping: 30 }}
              className="absolute w-full"
            >
              <div className="relative group">
                {/* Poster Card */}
                <motion.div
                  whileHover={{ scale: 1.02, y: -5 }}
                  className="bg-gradient-card rounded-2xl overflow-hidden shadow-card border border-gray-800 cursor-pointer"
                >
                  {/* Poster Image */}
                  <div className="relative h-96 bg-gradient-to-br from-darkPurple to-darkRed flex items-center justify-center overflow-hidden">
                    <motion.div
                      animate={{
                        scale: [1, 1.05, 1],
                      }}
                      transition={{ duration: 5, repeat: Infinity }}
                      className="absolute inset-0 bg-gradient-to-br from-netflixRed/20 to-purple-600/20"
                    />
                    <div className="relative z-10 text-center p-8">
                      <motion.h2
                        initial={{ y: -20, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        transition={{ delay: 0.2 }}
                        className="text-5xl font-bold text-textLight mb-4 drop-shadow-lg"
                      >
                        {currentIdea.name}
                      </motion.h2>
                      <motion.div
                        initial={{ y: 20, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        transition={{ delay: 0.3 }}
                        className="inline-block px-4 py-2 bg-netflixRed/80 backdrop-blur-sm rounded-full"
                      >
                        <span className="text-sm font-semibold text-white">
                          {currentIdea.tags?.[0] || 'Startup'}
                        </span>
                      </motion.div>
                    </div>

                    {/* Floating Particles */}
                    <div className="absolute inset-0 pointer-events-none">
                      {[...Array(5)].map((_, i) => (
                        <motion.div
                          key={i}
                          animate={{
                            y: [-20, -100],
                            opacity: [0, 1, 0],
                          }}
                          transition={{
                            duration: 3,
                            repeat: Infinity,
                            delay: i * 0.5,
                          }}
                          className="absolute w-2 h-2 bg-netflixRed/50 rounded-full"
                          style={{
                            left: `${20 + i * 15}%`,
                            bottom: '10%',
                          }}
                        />
                      ))}
                    </div>
                  </div>

                  {/* Card Info */}
                  <div className="p-6">
                    <p className="text-textLight text-lg mb-4">{currentIdea.oneLiner}</p>

                    <div className="flex flex-wrap gap-2 mb-4">
                      {currentIdea.tags?.map((tag, index) => (
                        <span
                          key={index}
                          className="px-3 py-1 bg-darkBg border border-gray-700 rounded-full text-textGray text-xs"
                        >
                          #{tag}
                        </span>
                      ))}
                    </div>

                    <div className="flex items-center gap-4 text-sm text-textGray">
                      <div className="flex items-center gap-2">
                        <span className="text-green-500">👍</span>
                        <span>{currentIdea.swipeRightCount || 0}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-red-500">👎</span>
                        <span>{currentIdea.swipeLeftCount || 0}</span>
                      </div>
                    </div>
                  </div>
                </motion.div>

                {/* Hover Glow Effect */}
                <div className="absolute inset-0 rounded-2xl bg-netflixRed/0 group-hover:bg-netflixRed/10 transition-all duration-300 pointer-events-none" />
              </div>
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Swipe Buttons */}
        <div className="flex items-center justify-center gap-8 mt-8">
          <motion.button
            whileHover={{ scale: 1.1, rotate: -5 }}
            whileTap={{ scale: 0.9 }}
            onClick={() => handleSwipe('left')}
            className="w-16 h-16 rounded-full bg-red-900/30 border-2 border-red-500 flex items-center justify-center text-red-500 text-3xl hover:bg-red-900/50 hover:shadow-glowSm transition"
          >
            ✕
          </motion.button>

          <motion.button
            whileHover={{ scale: 1.1, rotate: 5 }}
            whileTap={{ scale: 0.9 }}
            onClick={() => handleSwipe('right')}
            className="w-16 h-16 rounded-full bg-green-900/30 border-2 border-green-500 flex items-center justify-center text-green-500 text-3xl hover:bg-green-900/50 hover:shadow-glowSm transition"
          >
            ✓
          </motion.button>
        </div>

        {/* Keyboard Hints */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1 }}
          className="text-center mt-8 text-textGray text-sm"
        >
          <p>Press ← for Nope, → for Yep</p>
        </motion.div>
      </div>
    </div>
  );
}
