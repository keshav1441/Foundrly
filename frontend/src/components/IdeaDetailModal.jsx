import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../contexts/AuthContext';
import { useToast } from '../contexts/ToastContext';
import { api } from '../api/api';
import ConfirmationModal from './ConfirmationModal';

export default function IdeaDetailModal({ isOpen, onClose, idea, onUpdate, canEdit = false }) {
  const { user } = useAuth();
  const { showToast } = useToast();
  const [isEditing, setIsEditing] = useState(false);
  const [name, setName] = useState('');
  const [oneLiner, setOneLiner] = useState('');
  const [tags, setTags] = useState([]);
  const [tagInput, setTagInput] = useState('');
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  useEffect(() => {
    if (idea) {
      setName(idea.name || '');
      setOneLiner(idea.oneLiner || '');
      setTags(idea.tags || []);
      setIsEditing(false);
    }
  }, [idea]);

  const handleClose = () => {
    setIsEditing(false);
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

    if (!idea?._id) {
      showToast('Invalid idea', 'error');
      return;
    }

    setSaving(true);
    try {
      await api.updateIdea(idea._id, {
        name: name.trim(),
        oneLiner: oneLiner.trim(),
        tags: tags,
      });
      showToast('Idea updated successfully', 'success');
      onUpdate?.();
      setIsEditing(false);
      handleClose();
    } catch (error) {
      console.error('Failed to update idea:', error);
      showToast('Failed to update idea. Please try again.', 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!idea?._id) {
      showToast('Invalid idea', 'error');
      return;
    }

    setShowDeleteConfirm(true);
  };

  const confirmDelete = async () => {
    setDeleting(true);
    try {
      await api.deleteIdea(idea._id);
      showToast('Idea deleted successfully', 'success');
      onUpdate?.();
      handleClose();
    } catch (error) {
      console.error('Failed to delete idea:', error);
      showToast('Failed to delete idea. Please try again.', 'error');
    } finally {
      setDeleting(false);
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
    <AnimatePresence mode="wait">
      {isOpen && idea && (
      <motion.div
        key={`idea-modal-${idea._id}`}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-center justify-center p-4"
      >
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={handleClose}
          className="absolute inset-0 bg-black/90 backdrop-blur-sm"
        />

        {/* Modal */}
        <motion.div
          initial={{ scale: 0.9, opacity: 0, y: 20 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.9, opacity: 0, y: 20 }}
          onClick={(e) => e.stopPropagation()}
          className="relative bg-darkBg border border-gray-800 rounded-lg shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
        >
          <div className="p-6 md:p-8">
            {/* Header Section */}
            <div className="relative mb-6 bg-gradient-to-br from-black via-darkBg to-black rounded-lg overflow-hidden border border-gray-800">
              {/* Close Button - Positioned in header */}
              <button
                type="button"
                onClick={handleClose}
                className="absolute top-3 right-3 md:top-4 md:right-4 z-20 w-8 h-8 md:w-10 md:h-10 flex items-center justify-center text-white hover:text-textLight hover:bg-black/30 rounded-full transition-colors"
                aria-label="Close modal"
              >
                <svg className="w-5 h-5 md:w-6 md:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
              <div className="absolute inset-0 bg-netflixRed/5" />
              <div className="relative z-10 p-6 md:p-8 text-center">
                {isEditing ? (
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full text-3xl md:text-4xl font-light text-textLight bg-transparent border-b-2 border-netflixRed/50 focus:border-netflixRed focus:outline-none text-center"
                    placeholder="Idea Name"
                  />
                ) : (
                  <motion.h2
                    initial={{ y: -10, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    className="text-3xl md:text-4xl font-light text-textLight tracking-tight"
                  >
                    {idea.name}
                  </motion.h2>
                )}
              </div>
            </div>

            {/* Content Section */}
            <div className="space-y-6">
              <div>
                <label className="block text-textLight text-sm font-medium mb-2">
                  Description
                </label>
                {isEditing ? (
                  <textarea
                    value={oneLiner}
                    onChange={(e) => setOneLiner(e.target.value)}
                    placeholder="One-liner description"
                    rows={4}
                    className="w-full px-4 py-3 bg-black/50 border border-gray-800 rounded-md text-textLight placeholder-textGray focus:outline-none focus:border-netflixRed transition resize-none"
                  />
                ) : (
                  <p className="text-textLight text-base md:text-lg font-light leading-relaxed">
                    {idea.oneLiner}
                  </p>
                )}
              </div>

              {/* Tags Section */}
              <div>
                <label className="block text-textLight text-sm font-medium mb-2">
                  Tags
                </label>
                {isEditing ? (
                  <div className="flex flex-wrap items-center gap-2">
                    {tags.map((tag, index) => (
                      <span
                        key={`edit-tag-${tag}-${index}`}
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
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={tagInput}
                        onChange={(e) => setTagInput(e.target.value)}
                        onKeyPress={handleTagInputKeyPress}
                        placeholder="Add tag"
                        className="px-3 py-1 bg-black/50 border border-gray-800 rounded-md text-textLight placeholder-textGray focus:outline-none focus:border-netflixRed transition text-sm w-24"
                      />
                      <motion.button
                        onClick={handleAddTag}
                        type="button"
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        className="px-3 py-1 bg-gray-800 text-white rounded-md hover:bg-gray-700 transition text-sm"
                      >
                        Add
                      </motion.button>
                    </div>
                  </div>
                ) : (
                  idea.tags && idea.tags.length > 0 ? (
                    <div className="flex flex-wrap gap-2">
                      {idea.tags.map((tag, index) => (
                        <span
                          key={`view-tag-${tag}-${index}`}
                          className="inline-block px-3 py-1.5 bg-netflixRed/20 backdrop-blur-sm rounded-md border border-netflixRed/30"
                        >
                          <span className="text-xs font-medium text-textLight uppercase tracking-wider">
                            {tag}
                          </span>
                        </span>
                      ))}
                    </div>
                  ) : (
                    <p className="text-textGray text-sm">No tags</p>
                  )
                )}
              </div>

              {/* Stats */}
              <div className="flex items-center gap-6 text-sm text-textGray font-light pb-4 border-b border-gray-800">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full" />
                  <span>{idea.swipeRightCount || 0} likes</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-red-500 rounded-full" />
                  <span>{idea.swipeLeftCount || 0} passes</span>
                </div>
                {idea.submittedBy && (
                  <div className="flex items-center gap-2 ml-auto">
                    <span className="text-textGray/60">by</span>
                    <span className="text-textLight font-medium">
                      {idea.submittedBy.name || 'Anonymous'}
                    </span>
                  </div>
                )}
              </div>

              {/* Action Buttons */}
              {canEdit && (
                <div className="flex gap-2 pt-4">
                  {isEditing ? (
                    <>
                      <motion.button
                        onClick={() => setIsEditing(false)}
                        disabled={saving}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        className="flex-1 bg-gray-800 text-white px-6 py-3 rounded-md font-medium hover:bg-gray-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        Cancel
                      </motion.button>
                      <motion.button
                        onClick={handleSave}
                        disabled={saving || !name.trim() || !oneLiner.trim()}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        className="flex-1 bg-netflixRed text-white px-6 py-3 rounded-md font-medium hover:bg-netflixRed/90 transition disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {saving ? 'Saving...' : 'Save Changes'}
                      </motion.button>
                    </>
                  ) : (
                    <>
                      <motion.button
                        onClick={() => setIsEditing(true)}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        className="flex-1 bg-netflixRed text-white px-6 py-3 rounded-md font-medium hover:bg-netflixRed/90 transition"
                      >
                        Edit Idea
                      </motion.button>
                      <motion.button
                        onClick={handleDelete}
                        disabled={deleting}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        className="px-6 py-3 bg-red-900/30 border border-red-500/30 text-red-500 rounded-md font-medium hover:bg-red-900/50 hover:border-red-500/50 transition disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {deleting ? 'Deleting...' : 'Delete'}
                      </motion.button>
                    </>
                  )}
                </div>
              )}
            </div>
          </div>
        </motion.div>

        {/* Delete Confirmation Modal */}
        <ConfirmationModal
          isOpen={showDeleteConfirm}
          onClose={() => setShowDeleteConfirm(false)}
          onConfirm={confirmDelete}
          title="Delete Idea"
          message="Are you sure you want to delete this idea? This action cannot be undone."
          confirmText="Delete"
          cancelText="Cancel"
          danger={true}
        />
      </motion.div>
      )}
    </AnimatePresence>
  );
}

