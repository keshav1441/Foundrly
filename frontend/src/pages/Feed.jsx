import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '../contexts/AuthContext';
import { useToast } from '../contexts/ToastContext';
import { api } from '../api/api';

export default function Feed() {
  const { user } = useAuth();
  const { showToast } = useToast();
  const [memes, setMemes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [newMeme, setNewMeme] = useState({ title: '', description: '', imageUrl: '' });
  const [showForm, setShowForm] = useState(false);
  const [comments, setComments] = useState({}); // { memeId: [comments] }
  const [showComments, setShowComments] = useState({}); // { memeId: boolean }
  const [newComment, setNewComment] = useState({}); // { memeId: content }

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

  const loadComments = async (memeId) => {
    try {
      const response = await api.getComments(memeId);
      setComments((prev) => ({ ...prev, [memeId]: response.data }));
    } catch (error) {
      console.error('Failed to load comments:', error);
    }
  };

  const handleToggleComments = (memeId) => {
    const isShowing = showComments[memeId];
    setShowComments((prev) => ({ ...prev, [memeId]: !isShowing }));
    if (!isShowing && !comments[memeId]) {
      loadComments(memeId);
    }
  };

  const handleSubmitComment = async (e, memeId) => {
    e.preventDefault();
    if (!user) {
      showToast('Please sign in to comment', 'error');
      return;
    }

    const content = newComment[memeId]?.trim();
    if (!content) {
      return;
    }

    try {
      const response = await api.createComment(memeId, content);
      setComments((prev) => ({
        ...prev,
        [memeId]: [...(prev[memeId] || []), response.data],
      }));
      setNewComment((prev) => ({ ...prev, [memeId]: '' }));
      showToast('Comment added!', 'success');
    } catch (error) {
      console.error('Failed to submit comment:', error);
      showToast('Failed to submit comment. Please try again.', 'error');
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
      showToast('Failed to submit meme. Please try again.', 'error');
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

                <div className="flex items-center justify-between mb-4">
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

                  <div className="flex items-center gap-3">
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => handleToggleComments(meme._id)}
                      className="flex items-center gap-2 px-4 py-2 rounded-md font-light transition bg-black/50 border border-gray-800 text-textGray hover:border-gray-700"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                      </svg>
                      <span>{comments[meme._id]?.length || 0}</span>
                    </motion.button>

                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => handleUpvote(meme._id)}
                      className={`flex items-center gap-2 px-4 py-2 rounded-md font-light transition ${
                        meme.upvotedBy?.includes(user?._id)
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

                {/* Comments Section */}
                {showComments[meme._id] && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="border-t border-gray-800 pt-4 mt-4"
                  >
                    {/* Comment Input */}
                    {user && (
                      <form
                        onSubmit={(e) => handleSubmitComment(e, meme._id)}
                        className="mb-4"
                      >
                        <div className="flex gap-2">
                          <input
                            type="text"
                            value={newComment[meme._id] || ''}
                            onChange={(e) =>
                              setNewComment((prev) => ({
                                ...prev,
                                [meme._id]: e.target.value,
                              }))
                            }
                            placeholder="Add a comment..."
                            className="flex-1 bg-black border border-gray-800 rounded-md px-4 py-2 text-textLight focus:outline-none focus:border-netflixRed/50 transition font-light text-sm"
                          />
                          <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            type="submit"
                            className="bg-netflixRed text-white px-4 py-2 rounded-md font-medium hover:bg-netflixRed/90 transition text-sm"
                          >
                            Post
                          </motion.button>
                        </div>
                      </form>
                    )}

                    {/* Comments List */}
                    <div className="space-y-3 max-h-96 overflow-y-auto">
                      {comments[meme._id]?.length > 0 ? (
                        comments[meme._id].map((comment) => (
                          <div
                            key={comment._id}
                            className="flex gap-3 p-3 bg-black/30 rounded-md border border-gray-900"
                          >
                            <div className="w-8 h-8 rounded-full overflow-hidden bg-gray-800 flex-shrink-0">
                              <img
                                src={
                                  comment.author?.avatar ||
                                  `https://ui-avatars.com/api/?name=${comment.author?.name}`
                                }
                                alt={comment.author?.name}
                                className="w-full h-full object-cover"
                              />
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2 mb-1">
                                <Link
                                  to={`/profile/${comment.author?._id}`}
                                  className="text-textLight text-sm font-medium hover:text-netflixRed transition"
                                >
                                  {comment.author?.name}
                                </Link>
                                <span className="text-textGray text-xs font-light">
                                  {new Date(comment.createdAt).toLocaleDateString()}
                                </span>
                              </div>
                              <p className="text-textGray text-sm font-light leading-relaxed">
                                {comment.content}
                              </p>
                            </div>
                          </div>
                        ))
                      ) : (
                        <p className="text-textGray text-sm font-light text-center py-4">
                          No comments yet. Be the first to comment!
                        </p>
                      )}
                    </div>
                  </motion.div>
                )}
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
