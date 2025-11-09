import { useState } from 'react';
import { motion } from 'framer-motion';
import SwipeDeck from '../components/SwipeDeck';
import { api } from '../api/api';

export default function SwipePage() {
  const [generating, setGenerating] = useState(false);

  const handleGenerateIdeas = async () => {
    setGenerating(true);
    try {
      await api.generateAndSave(5);
      window.location.reload();
    } catch (error) {
      console.error('Failed to generate ideas:', error);
      alert('Failed to generate ideas. Please try again.');
    } finally {
      setGenerating(false);
    }
  };

  return (
    <div className="h-screen bg-black pt-20 overflow-hidden flex flex-col">
      <div className="container mx-auto px-4 flex-1 flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between mb-4 flex-shrink-0">
          <motion.h1
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="text-3xl md:text-4xl font-light text-textLight tracking-tight"
          >
            Swipe through ideas
          </motion.h1>

          <motion.button
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={handleGenerateIdeas}
            disabled={generating}
            className="bg-netflixRed text-white px-6 py-2.5 rounded-md font-medium hover:bg-netflixRed/90 transition disabled:opacity-50 disabled:cursor-not-allowed text-sm md:text-base"
          >
            {generating ? 'Generating...' : 'Generate Ideas'}
          </motion.button>
        </div>

        {/* Swipe Deck */}
        <div className="flex-1 min-h-0">
          <SwipeDeck />
        </div>
      </div>
    </div>
  );
}
