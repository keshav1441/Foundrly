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
      <div className="flex items-center justify-center min-h-[600px]">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
          className="w-16 h-16 border-2 border-netflixRed border-t-transparent rounded-full"
        />
      </div>
    );
  }

  if (currentIndex >= ideas.length) {
    return (
      <div className="flex items-center justify-center min-h-[600px] px-4">
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="text-center"
        >
          <h2 className="text-4xl font-light text-textLight mb-4">
            No more ideas
          </h2>
          <p className="text-textGray mb-8 font-light">Check back later for more terrible startup ideas</p>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => {
              setCurrentIndex(0);
              loadIdeas();
            }}
            className="bg-netflixRed text-white px-8 py-3 rounded-md font-medium"
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
    <div className="max-w-2xl mx-auto">
      {/* Progress Bar */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-2">
          <span className="text-textGray text-sm font-light">
            {currentIndex + 1} / {ideas.length}
          </span>
          <span className="text-textGray text-sm font-light">
            {Math.round(progress)}%
          </span>
        </div>
        <div className="w-full h-[2px] bg-gray-900 rounded-full overflow-hidden">
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
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{
              scale: 0.9,
              opacity: 0,
              x: swipeDirection === 'right' ? 400 : -400,
            }}
            transition={{ type: 'spring', stiffness: 300, damping: 30 }}
            className="absolute w-full"
          >
            <div className="relative group">
              {/* Card */}
              <motion.div
                whileHover={{ y: -5 }}
                className="bg-darkBg/50 backdrop-blur-xl rounded-lg overflow-hidden border border-gray-900 cursor-pointer"
              >
                {/* Header Section */}
                <div className="relative h-80 bg-gradient-to-br from-black via-darkBg to-black flex items-center justify-center overflow-hidden">
                  <div className="absolute inset-0 bg-netflixRed/5" />
                  <div className="relative z-10 text-center p-8">
                    <motion.h2
                      initial={{ y: -10, opacity: 0 }}
                      animate={{ y: 0, opacity: 1 }}
                      transition={{ delay: 0.1 }}
                      className="text-5xl font-light text-textLight mb-6 tracking-tight"
                    >
                      {currentIdea.name}
                    </motion.h2>
                    {currentIdea.tags?.[0] && (
                      <motion.div
                        initial={{ y: 10, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        transition={{ delay: 0.2 }}
                        className="inline-block px-4 py-1.5 bg-netflixRed/20 backdrop-blur-sm rounded-md border border-netflixRed/30"
                      >
                        <span className="text-xs font-medium text-textLight uppercase tracking-wider">
                          {currentIdea.tags[0]}
                        </span>
                      </motion.div>
                    )}
                  </div>
                </div>

                {/* Card Info */}
                <div className="p-8">
                  <p className="text-textLight text-lg mb-6 font-light leading-relaxed">
                    {currentIdea.oneLiner}
                  </p>

                  {currentIdea.tags && currentIdea.tags.length > 1 && (
                    <div className="flex flex-wrap gap-2 mb-6">
                      {currentIdea.tags.slice(1).map((tag, index) => (
                        <span
                          key={index}
                          className="px-3 py-1 bg-black/50 border border-gray-800 rounded-md text-textGray text-xs font-light"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  )}

                  <div className="flex items-center gap-6 text-sm text-textGray font-light">
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-green-500 rounded-full" />
                      <span>{currentIdea.swipeRightCount || 0} likes</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-red-500 rounded-full" />
                      <span>{currentIdea.swipeLeftCount || 0} passes</span>
                    </div>
                  </div>
                </div>
              </motion.div>
            </div>
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Swipe Buttons */}
      <div className="flex items-center justify-center gap-6 mt-8">
        <motion.button
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          onClick={() => handleSwipe('left')}
          className="w-14 h-14 rounded-full bg-red-900/20 border border-red-500/30 flex items-center justify-center text-red-500 hover:bg-red-900/30 hover:border-red-500/50 transition"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </motion.button>

        <motion.button
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          onClick={() => handleSwipe('right')}
          className="w-14 h-14 rounded-full bg-green-900/20 border border-green-500/30 flex items-center justify-center text-green-500 hover:bg-green-900/30 hover:border-green-500/50 transition"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
        </motion.button>
      </div>

      {/* Keyboard Hints */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
        className="text-center mt-8 text-textGray text-sm font-light"
      >
        Use arrow keys: ← pass, → like
      </motion.div>
    </div>
  );
}
