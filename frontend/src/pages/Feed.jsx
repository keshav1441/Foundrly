import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '../contexts/AuthContext';
import { api } from '../api/api';

export default function Feed() {
  const { user } = useAuth();
  const [memes, setMemes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [newMeme, setNewMeme] = useState({ title: '', description: '', imageUrl: '' });
  const [showForm, setShowForm] = useState(false);

  useEffect(() => {
    loadMemes();
  }, []);

  const loadMemes = async () => {
    try {
      const response = await api.getMemes();
      setMemes(response.data);
    } catch (error) {
      console.error('Failed to load memes:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitMeme = async (e) => {
    e.preventDefault();
    try {
      await api.createMeme(newMeme);
      setNewMeme({ title: '', description: '', imageUrl: '' });
      setShowForm(false);
      loadMemes();
    } catch (error) {
      console.error('Failed to submit meme:', error);
      alert('Failed to submit meme. Please try again.');
    }
  };

  const handleUpvote = async (memeId) => {
    try {
      await api.upvoteMeme(memeId);
      loadMemes();
    } catch (error) {
      console.error('Failed to upvote:', error);
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
    <div className="min-h-screen bg-black pt-20 pb-12 px-4">
      <div className="container mx-auto max-w-3xl">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center justify-between mb-12"
        >
          <div>
            <h1 className="text-4xl font-light text-textLight mb-2 tracking-tight">
              Feed
            </h1>
            <p className="text-textGray font-light">
              Founder fails & pitch disasters
            </p>
          </div>

          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setShowForm(!showForm)}
            className="bg-netflixRed text-white px-6 py-2.5 rounded-md font-medium hover:bg-netflixRed/90 transition"
          >
            {showForm ? 'Cancel' : '+ Post'}
          </motion.button>
        </motion.div>

        {/* Post Form */}
        {showForm && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="bg-darkBg/50 backdrop-blur-xl rounded-lg border border-gray-900 p-6 mb-8"
          >
            <form onSubmit={handleSubmitMeme} className="space-y-4">
              <div>
                <label className="block text-textLight font-light mb-2">
                  Title
                </label>
                <input
                  type="text"
                  value={newMeme.title}
                  onChange={(e) => setNewMeme({ ...newMeme, title: e.target.value })}
                  placeholder="Enter a catchy title..."
                  className="w-full bg-black border border-gray-800 rounded-md px-4 py-3 text-textLight focus:outline-none focus:border-netflixRed/50 transition font-light"
                  required
                />
              </div>
              <div>
                <label className="block text-textLight font-light mb-2">
                  Description
                </label>
                <textarea
                  value={newMeme.description}
                  onChange={(e) => setNewMeme({ ...newMeme, description: e.target.value })}
                  placeholder="Share your startup wisdom..."
                  className="w-full bg-black border border-gray-800 rounded-md px-4 py-3 text-textLight focus:outline-none focus:border-netflixRed/50 transition resize-none font-light"
                  rows="3"
                  required
                />
              </div>
              <div>
                <label className="block text-textLight font-light mb-2">
                  Image URL (optional)
                </label>
                <input
                  type="url"
                  value={newMeme.imageUrl}
                  onChange={(e) => setNewMeme({ ...newMeme, imageUrl: e.target.value })}
                  placeholder="https://..."
                  className="w-full bg-black border border-gray-800 rounded-md px-4 py-3 text-textLight focus:outline-none focus:border-netflixRed/50 transition font-light"
                />
              </div>
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                type="submit"
                className="w-full bg-netflixRed text-white py-3 rounded-md font-medium hover:bg-netflixRed/90 transition"
              >
                Post
              </motion.button>
            </form>
          </motion.div>
        )}

        {/* Memes Grid */}
        <div className="space-y-6">
          {memes.map((meme, index) => (
            <motion.div
              key={meme._id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              className="bg-darkBg/50 backdrop-blur-xl rounded-lg overflow-hidden border border-gray-900 hover:border-gray-800 transition-all"
            >
              {meme.imageUrl && (
                <div className="relative h-80 overflow-hidden">
                  <img
                    src={meme.imageUrl}
                    alt="Meme"
                    className="w-full h-full object-cover"
                  />
                </div>
              )}

              <div className="p-6">
                {meme.title ? (
                  <h3 className="text-textLight text-xl mb-2 font-medium">{meme.title}</h3>
                ) : null}
                {meme.description ? (
                  <p className="text-textGray text-base mb-6 font-light leading-relaxed">{meme.description}</p>
                ) : meme.content ? (
                  // Fallback for old posts with content field
                  <p className="text-textGray text-base mb-6 font-light leading-relaxed">{meme.content}</p>
                ) : (
                  <p className="text-textGray text-base mb-6 font-light leading-relaxed italic">No description available</p>
                )}

                <div className="flex items-center justify-between">
                  <Link 
                    to={`/profile/${meme.submittedBy?._id}`}
                    className="flex items-center gap-3 hover:opacity-80 transition"
                  >
                    <div className="w-8 h-8 rounded-full overflow-hidden bg-gray-800">
                      <img
                        src={meme.submittedBy?.avatar || `https://ui-avatars.com/api/?name=${meme.submittedBy?.name}`}
                        alt={meme.submittedBy?.name}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <span className="text-textGray text-sm font-light hover:text-textLight transition">
                      {meme.submittedBy?.name}
                    </span>
                  </Link>

                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => handleUpvote(meme._id)}
                    className={`flex items-center gap-2 px-4 py-2 rounded-md font-light transition ${
                      meme.upvotedBy?.includes(user._id)
                        ? 'bg-netflixRed/20 text-netflixRed border border-netflixRed/30'
                        : 'bg-black/50 border border-gray-800 text-textGray hover:border-gray-700'
                    }`}
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
                    </svg>
                    <span>{meme.upvotes || 0}</span>
                  </motion.button>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {memes.length === 0 && (
          <div className="text-center py-20">
            <p className="text-textGray text-lg font-light">No posts yet. Be the first to share!</p>
          </div>
        )}
      </div>
    </div>
  );
}
