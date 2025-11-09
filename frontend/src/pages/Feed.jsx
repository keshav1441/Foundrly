import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '../contexts/AuthContext';
import { api } from '../api/api';

export default function Feed() {
  const { user } = useAuth();
  const [memes, setMemes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [newMeme, setNewMeme] = useState({ content: '', imageUrl: '' });
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
      setNewMeme({ content: '', imageUrl: '' });
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
      <div className="min-h-screen bg-gradient-dark flex items-center justify-center pt-20">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
          className="w-16 h-16 border-4 border-netflixRed border-t-transparent rounded-full"
        />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-dark pt-20 pb-12 px-4">
      <div className="container mx-auto max-w-4xl">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center justify-between mb-12"
        >
          <div>
            <h1 className="text-5xl font-bold text-textLight mb-2">
              Meme Feed
            </h1>
            <p className="text-textGray">
              Trending Founder Fails & Pitch Disasters
            </p>
          </div>

          <motion.button
            whileHover={{ scale: 1.05, boxShadow: '0 0 20px rgba(229, 9, 20, 0.5)' }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setShowForm(!showForm)}
            className="bg-netflixRed text-white px-6 py-3 rounded-lg font-semibold"
          >
            {showForm ? 'Cancel' : '+ Post Meme'}
          </motion.button>
        </motion.div>

        {/* Post Form */}
        {showForm && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="bg-gradient-card rounded-xl p-6 border border-gray-800 mb-8"
          >
            <form onSubmit={handleSubmitMeme} className="space-y-4">
              <div>
                <label className="block text-textLight font-semibold mb-2">
                  Content
                </label>
                <textarea
                  value={newMeme.content}
                  onChange={(e) => setNewMeme({ ...newMeme, content: e.target.value })}
                  placeholder="Share your startup wisdom..."
                  className="w-full bg-darkBg border border-gray-700 rounded-lg px-4 py-3 text-textLight focus:outline-none focus:border-netflixRed transition resize-none"
                  rows="3"
                  required
                />
              </div>
              <div>
                <label className="block text-textLight font-semibold mb-2">
                  Image URL (optional)
                </label>
                <input
                  type="url"
                  value={newMeme.imageUrl}
                  onChange={(e) => setNewMeme({ ...newMeme, imageUrl: e.target.value })}
                  placeholder="https://..."
                  className="w-full bg-darkBg border border-gray-700 rounded-lg px-4 py-3 text-textLight focus:outline-none focus:border-netflixRed transition"
                />
              </div>
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                type="submit"
                className="w-full bg-netflixRed text-white py-3 rounded-lg font-semibold hover:bg-accentHover transition"
              >
                Post Meme
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
              transition={{ delay: index * 0.1 }}
              className="bg-gradient-card rounded-xl overflow-hidden border border-gray-800 shadow-card hover:border-netflixRed/50 transition-all"
            >
              {meme.imageUrl && (
                <div className="relative h-64 overflow-hidden">
                  <img
                    src={meme.imageUrl}
                    alt="Meme"
                    className="w-full h-full object-cover"
                  />
                </div>
              )}

              <div className="p-6">
                <p className="text-textLight text-lg mb-4">{meme.content}</p>

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-full overflow-hidden">
                        <img
                          src={meme.submittedBy?.avatar || `https://ui-avatars.com/api/?name=${meme.submittedBy?.name}`}
                          alt={meme.submittedBy?.name}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <span className="text-textGray text-sm">
                        {meme.submittedBy?.name}
                      </span>
                    </div>
                  </div>

                  <motion.button
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={() => handleUpvote(meme._id)}
                    className={`flex items-center gap-2 px-4 py-2 rounded-lg font-semibold transition ${
                      meme.upvotedBy?.includes(user._id)
                        ? 'bg-netflixRed text-white'
                        : 'bg-darkBg border border-gray-700 text-textGray hover:border-netflixRed'
                    }`}
                  >
                    <span>👍</span>
                    <span>{meme.upvotes || 0}</span>
                  </motion.button>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}
