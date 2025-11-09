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
    <div className="min-h-screen bg-gradient-dark pt-20">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <motion.h1
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="text-4xl font-bold text-textLight"
          >
            Swipe Through Ideas
          </motion.h1>

          <motion.button
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            whileHover={{ scale: 1.05, boxShadow: '0 0 20px rgba(229, 9, 20, 0.5)' }}
            whileTap={{ scale: 0.95 }}
            onClick={handleGenerateIdeas}
            disabled={generating}
            className="bg-netflixRed text-white px-6 py-3 rounded-lg font-semibold hover:bg-accentHover transition disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {generating ? 'Generating...' : 'Generate AI Ideas'}
          </motion.button>
        </div>

        {/* Swipe Deck */}
        <SwipeDeck />
      </div>
    </div>
  );
}
