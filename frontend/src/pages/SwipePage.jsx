import { useState, useRef } from 'react';
import { motion } from 'framer-motion';
import SwipeDeck from '../components/SwipeDeck';
import AddIdeaModal from '../components/AddIdeaModal';
import EditIdeaModal from '../components/EditIdeaModal';
import IdeaDetailModal from '../components/IdeaDetailModal';

export default function SwipePage() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [generatedIdea, setGeneratedIdea] = useState(null);
  const [selectedIdea, setSelectedIdea] = useState(null);
  const swipeDeckRef = useRef(null);

  const handleIdeaAdded = () => {
    // Reload ideas after adding
    if (swipeDeckRef.current) {
      swipeDeckRef.current.reloadIdeas();
    }
  };

  const handleIdeasGenerated = () => {
    // Reload ideas after generating
    if (swipeDeckRef.current) {
      swipeDeckRef.current.reloadIdeas();
    }
  };

  const handleIdeaGenerated = (idea) => {
    setGeneratedIdea(idea);
    setIsEditModalOpen(true);
  };

  const handleEditModalClose = () => {
    setIsEditModalOpen(false);
    setGeneratedIdea(null);
  };

  return (
    <div className="h-screen bg-black pt-16 md:pt-20 overflow-hidden flex flex-col">
      <div className="container mx-auto px-4 sm:px-6 flex-1 flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between mb-4 flex-shrink-0 gap-4">
          <motion.h1
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="text-2xl sm:text-3xl md:text-4xl font-light text-textLight tracking-tight flex-1 min-w-0"
          >
            <span className="hidden sm:inline">Swipe through ideas</span>
            <span className="sm:hidden">Swipe</span>
          </motion.h1>

          <motion.button
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setIsModalOpen(true)}
            className="bg-netflixRed text-white px-4 sm:px-6 py-2.5 rounded-md font-medium hover:bg-netflixRed/90 transition text-sm md:text-base flex-shrink-0"
          >
            <span className="hidden sm:inline">Add Ideas</span>
            <span className="sm:hidden">Add</span>
          </motion.button>
        </div>

        {/* Swipe Deck */}
        <div className="flex-1 min-h-0">
          <SwipeDeck 
            ref={swipeDeckRef} 
            onIdeaClick={(idea) => {
              setSelectedIdea(idea);
              setIsDetailModalOpen(true);
            }}
          />
        </div>
      </div>

      {/* Add Idea Modal */}
      <AddIdeaModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onIdeaAdded={handleIdeaAdded}
        onIdeasGenerated={handleIdeasGenerated}
        onIdeaGenerated={handleIdeaGenerated}
      />

      {/* Edit Generated Idea Modal */}
      <EditIdeaModal
        isOpen={isEditModalOpen}
        onClose={handleEditModalClose}
        idea={generatedIdea}
        onSave={() => {
          handleIdeasGenerated();
          handleEditModalClose();
        }}
      />

      {/* Idea Detail Modal */}
      <IdeaDetailModal
        isOpen={isDetailModalOpen}
        onClose={() => {
          setIsDetailModalOpen(false);
          setSelectedIdea(null);
        }}
        idea={selectedIdea}
        canEdit={false}
      />
    </div>
  );
}
