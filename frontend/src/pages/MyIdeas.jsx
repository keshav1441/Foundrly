import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '../contexts/AuthContext';
import { useToast } from '../contexts/ToastContext';
import { api } from '../api/api';
import IdeaDetailModal from '../components/IdeaDetailModal';

export default function MyIdeas() {
  const { user } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();
  const [ideas, setIdeas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isIdeaModalOpen, setIsIdeaModalOpen] = useState(false);
  const [selectedIdea, setSelectedIdea] = useState(null);

  useEffect(() => {
    loadIdeas();
  }, [user?._id]);

  const loadIdeas = async () => {
    if (!user?._id) return;
    
    try {
      setLoading(true);
      const response = await api.getUserIdeas(user._id);
      setIdeas(response.data);
    } catch (error) {
      console.error('Failed to load ideas:', error);
      showToast('Failed to load ideas', 'error');
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
    <div className="min-h-screen bg-black pt-16 md:pt-20 pb-12">
      <div className="container mx-auto px-4 sm:px-6">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-6 sm:mb-8"
        >
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-light text-textLight mb-2 sm:mb-4">My Ideas</h1>
          <p className="text-textGray text-base sm:text-lg font-light">
            Manage and view all your startup ideas
          </p>
        </motion.div>

        {/* Ideas Grid */}
        {ideas.length === 0 ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-20"
          >
            <p className="text-textGray text-lg mb-6 font-light">
              No ideas yet
            </p>
            <div className="flex gap-4 justify-center">
              <Link to="/swipe">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="bg-netflixRed text-white px-6 py-3 rounded-md font-medium"
                >
                  Generate Ideas
                </motion.button>
              </Link>
            </div>
          </motion.div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
            {ideas.map((idea, index) => (
              <motion.div
                key={idea._id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                whileHover={{ scale: 1.05, y: -10 }}
                onClick={() => {
                  setSelectedIdea(idea);
                  setIsIdeaModalOpen(true);
                }}
                className="cursor-pointer group"
              >
                <div className="bg-darkBg/50 backdrop-blur-xl rounded-lg overflow-hidden border border-gray-900 hover:border-gray-800 transition-all h-full flex flex-col">
                  {/* Idea Header */}
                  <div className="relative h-48 bg-gradient-to-br from-black via-darkBg to-black overflow-hidden">
                    <div className="absolute inset-0 bg-netflixRed/5" />
                    
                    {/* Idea Title centered */}
                    <div className="absolute inset-0 flex items-center justify-center p-6">
                      <h3 className="text-2xl font-light text-textLight text-center line-clamp-3">
                        {idea.name}
                      </h3>
                    </div>
                  </div>

                  {/* Idea Info */}
                  <div className="p-5 flex-1 flex flex-col">
                    <p className="text-textGray text-sm mb-3 line-clamp-2 font-light flex-1">
                      {idea.oneLiner}
                    </p>
                    {idea.tags && idea.tags.length > 0 && (
                      <div className="flex flex-wrap gap-2 mb-3">
                        {idea.tags.map((tag, tagIndex) => (
                          <span
                            key={tagIndex}
                            className="px-2 py-1 bg-black/50 border border-gray-800 rounded text-textGray text-xs"
                          >
                            {tag}
                          </span>
                        ))}
                      </div>
                    )}
                    <div className="flex items-center gap-3 text-xs text-textGray font-light mt-auto">
                      <div className="flex items-center gap-1">
                        <div className="w-2 h-2 bg-green-500 rounded-full" />
                        <span>{idea.swipeRightCount || 0} likes</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <div className="w-2 h-2 bg-red-500 rounded-full" />
                        <span>{idea.swipeLeftCount || 0} passes</span>
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>

      {/* Idea Detail Modal */}
      <IdeaDetailModal
        isOpen={isIdeaModalOpen}
        onClose={() => {
          setIsIdeaModalOpen(false);
          setSelectedIdea(null);
        }}
        idea={selectedIdea}
        canEdit={true}
        onUpdate={() => {
          loadIdeas();
        }}
      />
    </div>
  );
}

