import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { api } from '../api/api';

export default function EditIdeaModal({ isOpen, onClose, idea, onSave, onRegenerate }) {
  const [name, setName] = useState('');
  const [oneLiner, setOneLiner] = useState('');
  const [tags, setTags] = useState([]);
  const [tagInput, setTagInput] = useState('');
  const [saving, setSaving] = useState(false);
  const [regenerating, setRegenerating] = useState(false);

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
      alert('Please fill in both idea name and description');
      return;
    }

    setSaving(true);
    try {
      await api.createIdea({
        name: name.trim(),
        oneLiner: oneLiner.trim(),
        tags: tags,
      });
      onSave?.();
      handleClose();
    } catch (error) {
      console.error('Failed to save idea:', error);
      alert('Failed to save idea. Please try again.');
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
      alert(errorMessage);
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
                  {saving ? 'Saving...' : 'Save Idea'}
                </motion.button>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}

