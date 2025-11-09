import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useToast } from '../contexts/ToastContext';
import { api } from '../api/api';
import { formatMarkdown } from '../utils/markdownFormatter';

export default function EditIdeaModal({ isOpen, onClose, idea, onSave, onRegenerate }) {
  const { showToast } = useToast();
  const [name, setName] = useState('');
  const [oneLiner, setOneLiner] = useState('');
  const [tags, setTags] = useState([]);
  const [tagInput, setTagInput] = useState('');
  const [saving, setSaving] = useState(false);
  const [regenerating, setRegenerating] = useState(false);
  const [showPitchModal, setShowPitchModal] = useState(false);
  const [showPitchModeSelect, setShowPitchModeSelect] = useState(false);
  const [badPitch, setBadPitch] = useState('');
  const [pitchMode, setPitchMode] = useState('');
  const [pitching, setPitching] = useState(false);

  useEffect(() => {
    if (idea) {
      setName(idea.name || '');
      setOneLiner(idea.oneLiner || '');
      setTags(idea.tags || []);
    }
  }, [idea]);

  const handleClose = () => {
    setName('');
    setOneLiner('');
    setTags([]);
    setTagInput('');
    onClose();
  };

  const handleSave = async () => {
    if (!name.trim() || !oneLiner.trim()) {
      showToast('Please fill in both idea name and description', 'error');
      return;
    }

    setSaving(true);
    try {
      await api.createIdea({
        name: name.trim(),
        oneLiner: oneLiner.trim(),
        tags: tags,
      });
      showToast('Idea saved successfully', 'success');
      onSave?.();
      handleClose();
    } catch (error) {
      console.error('Failed to save idea:', error);
      showToast('Failed to save idea. Please try again.', 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleRegenerate = async () => {
    setRegenerating(true);
    try {
      const response = await api.generateAndSave(1);
      if (response.data && response.data.ideas && response.data.ideas.length > 0) {
        const newIdea = response.data.ideas[0];
        setName(newIdea.name || '');
        setOneLiner(newIdea.oneLiner || '');
        setTags(newIdea.tags || []);
      }
    } catch (error) {
      console.error('Failed to regenerate idea:', error);
      const errorMessage = error.response?.data?.error || error.message || 'Failed to regenerate idea. Please try again.';
      showToast(errorMessage, 'error');
    } finally {
      setRegenerating(false);
    }
  };

  const handleAddTag = () => {
    if (tagInput.trim() && !tags.includes(tagInput.trim())) {
      setTags([...tags, tagInput.trim()]);
      setTagInput('');
    }
  };

  const handleRemoveTag = (tagToRemove) => {
    setTags(tags.filter(tag => tag !== tagToRemove));
  };

  const handleTagInputKeyPress = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleAddTag();
    }
  };

  const handlePitchBadly = async (mode) => {
    if (!name.trim() || !oneLiner.trim()) {
      showToast('Please fill in both idea name and description first', 'error');
      return;
    }

    setPitching(true);
    setShowPitchModeSelect(false);
    setShowPitchModal(true);
    setBadPitch('');
    setPitchMode(mode);

    try {
      // Use idea data directly (for unsaved ideas) or ideaId if idea is already saved
      const ideaData = {
        name: name.trim(),
        oneLiner: oneLiner.trim(),
        tags: tags,
      };

      // If idea has an _id, use it; otherwise use ideaData
      const response = idea?._id 
        ? await api.pitchBadly(idea._id, mode)
        : await api.pitchBadlyWithData(ideaData, mode);
      
      setBadPitch(response.data.pitch);
    } catch (error) {
      console.error('Failed to pitch badly:', error);
      const errorMessage = error.response?.data?.error || error.message || 'Failed to generate bad pitch. Please try again.';
      showToast(errorMessage, 'error');
      setShowPitchModal(false);
    } finally {
      setPitching(false);
    }
  };

  if (!isOpen || !idea) return null;

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
          className="relative bg-darkBg border border-gray-800 rounded-lg shadow-2xl max-w-md w-full"
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
            <h2 className="text-2xl font-light text-textLight mb-6">Edit Idea</h2>

            <div className="space-y-4">
              <div>
                <label className="block text-textLight text-sm font-medium mb-2">
                  Idea Name
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Idea Name"
                  className="w-full px-4 py-2 bg-black/50 border border-gray-800 rounded-md text-textLight placeholder-textGray focus:outline-none focus:border-netflixRed transition"
                />
              </div>

              <div>
                <label className="block text-textLight text-sm font-medium mb-2">
                  One-liner Description
                </label>
                <textarea
                  value={oneLiner}
                  onChange={(e) => setOneLiner(e.target.value)}
                  placeholder="One-liner description"
                  rows={4}
                  className="w-full px-4 py-2 bg-black/50 border border-gray-800 rounded-md text-textLight placeholder-textGray focus:outline-none focus:border-netflixRed transition resize-none"
                />
              </div>

              <div>
                <label className="block text-textLight text-sm font-medium mb-2">
                  Tags
                </label>
                <div className="flex flex-wrap gap-2 mb-2">
                  {tags.map((tag, index) => (
                    <span
                      key={index}
                      className="inline-flex items-center gap-1 px-3 py-1 bg-netflixRed/20 border border-netflixRed/30 rounded-md text-textLight text-sm"
                    >
                      {tag}
                      <button
                        onClick={() => handleRemoveTag(tag)}
                        className="text-netflixRed hover:text-red-400 transition"
                        type="button"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </button>
                    </span>
                  ))}
                </div>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={tagInput}
                    onChange={(e) => setTagInput(e.target.value)}
                    onKeyPress={handleTagInputKeyPress}
                    placeholder="Add a tag"
                    className="flex-1 px-4 py-2 bg-black/50 border border-gray-800 rounded-md text-textLight placeholder-textGray focus:outline-none focus:border-netflixRed transition text-sm"
                  />
                  <motion.button
                    onClick={handleAddTag}
                    type="button"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="px-4 py-2 bg-gray-800 text-white rounded-md hover:bg-gray-700 transition text-sm"
                  >
                    Add
                  </motion.button>
                </div>
              </div>

              <p className="text-xs text-textGray">
                Edit the idea above, then save it. It'll appear under your name in the swipe deck.
              </p>

              <div className="flex flex-col gap-2">
                <div className="flex gap-2">
                  <motion.button
                    onClick={handleRegenerate}
                    disabled={regenerating}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className="flex-1 bg-gray-800 text-white px-6 py-3 rounded-md font-medium hover:bg-gray-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {regenerating ? 'Regenerating...' : 'Regenerate'}
                  </motion.button>
                  <motion.button
                    onClick={handleSave}
                    disabled={saving || !name.trim() || !oneLiner.trim()}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className="flex-1 bg-netflixRed text-white px-6 py-3 rounded-md font-medium hover:bg-netflixRed/90 transition disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {saving ? 'Saving...' : 'Steal This Idea'}
                  </motion.button>
                </div>
                <motion.button
                  onClick={() => setShowPitchModeSelect(true)}
                  disabled={pitching || !name.trim() || !oneLiner.trim()}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="w-full bg-purple-900/30 border border-purple-500/30 text-purple-400 px-6 py-3 rounded-md font-medium hover:bg-purple-900/50 hover:border-purple-500/50 transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  <span>🤡</span>
                  <span>Pitch It Badly</span>
                </motion.button>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Pitch Mode Selection Modal */}
        <AnimatePresence>
          {showPitchModeSelect && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-[60] flex items-center justify-center p-4"
            >
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => setShowPitchModeSelect(false)}
                className="absolute inset-0 bg-black/90 backdrop-blur-sm"
              />
              <motion.div
                initial={{ scale: 0.9, opacity: 0, y: 20 }}
                animate={{ scale: 1, opacity: 1, y: 0 }}
                exit={{ scale: 0.9, opacity: 0, y: 20 }}
                onClick={(e) => e.stopPropagation()}
                className="relative bg-darkBg border border-purple-500/30 rounded-lg shadow-2xl max-w-md w-full"
              >
                <div className="p-6 md:p-8">
                  <div className="flex items-center justify-between mb-6">
                    <h3 className="text-2xl font-light text-purple-400 flex items-center gap-2">
                      <span>🤡</span>
                      <span>Choose Pitch Mode</span>
                    </h3>
                    <button
                      onClick={() => setShowPitchModeSelect(false)}
                      className="text-textGray hover:text-textLight transition"
                    >
                      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </div>
                  <div className="space-y-3">
                    <motion.button
                      onClick={() => handlePitchBadly('investor')}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      className="w-full bg-purple-900/30 border border-purple-500/30 text-purple-400 px-6 py-4 rounded-md font-medium hover:bg-purple-900/50 hover:border-purple-500/50 transition text-left"
                    >
                      <div className="font-semibold mb-1">Investor Edition</div>
                      <div className="text-sm text-textGray font-light">
                        "We're revolutionizing the act of burning VC money."
                      </div>
                    </motion.button>
                    <motion.button
                      onClick={() => handlePitchBadly('techbro')}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      className="w-full bg-purple-900/30 border border-purple-500/30 text-purple-400 px-6 py-4 rounded-md font-medium hover:bg-purple-900/50 hover:border-purple-500/50 transition text-left"
                    >
                      <div className="font-semibold mb-1">TechBro Edition</div>
                      <div className="text-sm text-textGray font-light">
                        "We're disrupting human interaction using blockchain and vibes."
                      </div>
                    </motion.button>
                    <motion.button
                      onClick={() => handlePitchBadly('doomer')}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      className="w-full bg-purple-900/30 border border-purple-500/30 text-purple-400 px-6 py-4 rounded-md font-medium hover:bg-purple-900/50 hover:border-purple-500/50 transition text-left"
                    >
                      <div className="font-semibold mb-1">Doomer Edition</div>
                      <div className="text-sm text-textGray font-light">
                        "It doesn't matter; the robots win anyway."
                      </div>
                    </motion.button>
                  </div>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Bad Pitch Modal */}
        <AnimatePresence>
          {showPitchModal && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-[60] flex items-center justify-center p-4"
            >
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => setShowPitchModal(false)}
                className="absolute inset-0 bg-black/90 backdrop-blur-sm"
              />
              <motion.div
                initial={{ scale: 0.9, opacity: 0, y: 20 }}
                animate={{ scale: 1, opacity: 1, y: 0 }}
                exit={{ scale: 0.9, opacity: 0, y: 20 }}
                onClick={(e) => e.stopPropagation()}
                className="relative bg-gradient-to-br from-darkBg via-black to-darkBg border-2 border-purple-500/40 rounded-xl shadow-2xl max-w-3xl w-full overflow-hidden"
              >
                {/* Animated gradient background */}
                <div className="absolute inset-0 bg-gradient-to-br from-purple-500/5 via-transparent to-purple-500/5 opacity-50" />
                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-purple-500 via-purple-400 to-purple-500" />
                
                <div className="relative p-6 md:p-8">
                  <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-3">
                      <motion.div
                        animate={{ rotate: [0, 10, -10, 0] }}
                        transition={{ duration: 2, repeat: Infinity }}
                        className="text-3xl"
                      >
                        🤡
                      </motion.div>
                      <h3 className="text-2xl md:text-3xl font-light text-purple-400">
                        Pitch It Badly - {pitchMode === 'investor' ? 'Investor Edition' : pitchMode === 'techbro' ? 'TechBro Edition' : 'Doomer Edition'}
                      </h3>
                    </div>
                    <button
                      onClick={() => setShowPitchModal(false)}
                      className="text-textGray hover:text-purple-400 transition p-2 hover:bg-purple-500/10 rounded-lg"
                    >
                      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </div>
                  {pitching ? (
                    <div className="flex flex-col items-center justify-center py-16">
                      <motion.div
                        animate={{ rotate: 360 }}
                        transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                        className="w-16 h-16 border-4 border-purple-500/30 border-t-purple-500 rounded-full mb-4"
                      />
                      <p className="text-textGray text-sm">Generating cursed pitch...</p>
                    </div>
                  ) : (
                    <div className="bg-black/40 backdrop-blur-sm border border-purple-500/20 rounded-lg p-6 md:p-8 max-h-[60vh] overflow-y-auto custom-scrollbar">
                      <div className="text-textLight text-base md:text-lg font-light">
                        {badPitch ? formatMarkdown(badPitch) : <p className="text-textGray">Generating cursed pitch...</p>}
                      </div>
                    </div>
                  )}
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </AnimatePresence>
  );
}

