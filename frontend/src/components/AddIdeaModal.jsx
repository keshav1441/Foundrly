import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../contexts/AuthContext';
import { api } from '../api/api';

export default function AddIdeaModal({ isOpen, onClose, onIdeaAdded, onIdeasGenerated, onIdeaGenerated }) {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('add'); // 'add' or 'generate'
  const [ideaName, setIdeaName] = useState('');
  const [oneLiner, setOneLiner] = useState('');
  const [generating, setGenerating] = useState(false);

  // Reset form when modal closes
  const handleClose = () => {
    setIdeaName('');
    setOneLiner('');
    setActiveTab('add');
    onClose();
  };

  const handleAddIdea = async (e) => {
    e.preventDefault();
    if (!ideaName.trim() || !oneLiner.trim()) {
      alert('Please fill in both idea name and description');
      return;
    }

    // Create idea object and pass to edit modal instead of saving immediately
    const ideaToEdit = {
      name: ideaName.trim(),
      oneLiner: oneLiner.trim(),
      tags: ['user-submitted'],
    };
    
    setIdeaName('');
    setOneLiner('');
    handleClose();
    onIdeaGenerated?.(ideaToEdit);
  };

  const handleGenerateIdeas = async () => {
    setGenerating(true);
    try {
      const response = await api.generateAndSave(1);
      console.log('Generate response:', response);
      if (response.data && response.data.ideas && response.data.ideas.length > 0) {
        const generatedIdea = response.data.ideas[0];
        // Close this modal and open the edit modal with the generated idea
        handleClose();
        onIdeaGenerated?.(generatedIdea);
      } else {
        console.error('Unexpected response format:', response);
        alert('Unexpected response from server. Please try again.');
      }
    } catch (error) {
      console.error('Failed to generate ideas:', error);
      const errorMessage = error.response?.data?.error || error.message || 'Failed to generate ideas. Please try again.';
      alert(errorMessage);
    } finally {
      setGenerating(false);
    }
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={handleClose}
          className="absolute inset-0 bg-black/80 backdrop-blur-sm"
        />

        {/* Modal */}
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          onClick={(e) => e.stopPropagation()}
          className="relative bg-darkBg border border-gray-800 rounded-lg shadow-2xl max-w-md w-full max-h-[90vh] overflow-y-auto"
        >
          {/* Close Button */}
          <button
            onClick={handleClose}
            className="absolute top-4 right-4 text-textGray hover:text-textLight transition z-10"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>

          <div className="p-6">
            <h2 className="text-2xl font-light text-textLight mb-6">Add Ideas</h2>

            {/* Tabs */}
            <div className="flex gap-2 mb-6 border-b border-gray-800">
              <button
                onClick={() => setActiveTab('add')}
                className={`px-4 py-2 font-medium transition ${
                  activeTab === 'add'
                    ? 'text-netflixRed border-b-2 border-netflixRed'
                    : 'text-textGray hover:text-textLight'
                }`}
              >
                Add Your Idea
              </button>
              <button
                onClick={() => setActiveTab('generate')}
                className={`px-4 py-2 font-medium transition ${
                  activeTab === 'generate'
                    ? 'text-netflixRed border-b-2 border-netflixRed'
                    : 'text-textGray hover:text-textLight'
                }`}
              >
                Generate with AI
              </button>
            </div>

            {/* Add Idea Tab */}
            {activeTab === 'add' && (
              <motion.form
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                onSubmit={handleAddIdea}
                className="space-y-4"
              >
                <div>
                  <label className="block text-textLight text-sm font-medium mb-2">
                    Idea Name
                  </label>
                  <input
                    type="text"
                    value={ideaName}
                    onChange={(e) => setIdeaName(e.target.value)}
                    placeholder="e.g., CryptoChores"
                    className="w-full px-4 py-2 bg-black/50 border border-gray-800 rounded-md text-textLight placeholder-textGray focus:outline-none focus:border-netflixRed transition"
                    required
                  />
                </div>

                <div>
                  <label className="block text-textLight text-sm font-medium mb-2">
                    One-liner Description
                  </label>
                  <textarea
                    value={oneLiner}
                    onChange={(e) => setOneLiner(e.target.value)}
                    placeholder="e.g., Blockchain-based chore tracking for kids"
                    rows={3}
                    className="w-full px-4 py-2 bg-black/50 border border-gray-800 rounded-md text-textLight placeholder-textGray focus:outline-none focus:border-netflixRed transition resize-none"
                    required
                  />
                </div>

                <p className="text-xs text-textGray">
                  Note: You'll be able to edit and add tags before saving. Your idea won't appear in your own swipe deck.
                </p>

                <motion.button
                  type="submit"
                  disabled={!ideaName.trim() || !oneLiner.trim()}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="w-full bg-netflixRed text-white px-6 py-3 rounded-md font-medium hover:bg-netflixRed/90 transition disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Continue to Edit
                </motion.button>
              </motion.form>
            )}

            {/* Generate with AI Tab */}
            {activeTab === 'generate' && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-4"
              >
                <p className="text-textLight">
                  Generate a hilariously bad startup idea using AI. Edit it before saving, and it'll appear under your name.
                </p>

                <motion.button
                  onClick={handleGenerateIdeas}
                  disabled={generating}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="w-full bg-netflixRed text-white px-6 py-3 rounded-md font-medium hover:bg-netflixRed/90 transition disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {generating ? 'Generating...' : 'Generate Idea with AI'}
                </motion.button>
              </motion.div>
            )}
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}

