import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '../contexts/AuthContext';
import { api } from '../api/api';

export default function Profile() {
  const { userId } = useParams();
  const { user: authUser, logout, fetchUser } = useAuth();
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [ideas, setIdeas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    bio: '',
    role: '',
    avatar: '',
  });

  const isOwnProfile = !userId || userId === authUser?._id;

  useEffect(() => {
    loadProfile();
  }, [userId]);

  const loadProfile = async () => {
    try {
      setLoading(true);
      const targetUserId = userId || authUser?._id;
      
      if (targetUserId) {
        // Get user data
        const userResponse = await api.getUser(targetUserId);
        setUser(userResponse.data);
        
        // Get user's ideas
        const ideasResponse = await api.getUserIdeas(targetUserId);
        setIdeas(ideasResponse.data);
        
        // Set form data if own profile
        if (isOwnProfile) {
          setFormData({
            name: userResponse.data.name || '',
            bio: userResponse.data.bio || '',
            role: userResponse.data.role || 'Visionary',
            avatar: userResponse.data.avatar || '',
          });
        }
      }
    } catch (error) {
      console.error('Failed to load profile:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async (e) => {
    e.preventDefault();
    try {
      await api.updateUser(user._id, formData);
      await fetchUser();
      await loadProfile();
      setEditing(false);
    } catch (error) {
      console.error('Failed to update profile:', error);
      alert('Failed to update profile. Please try again.');
    }
  };

  const handleMessage = () => {
    navigate(`/matches`);
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

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-dark flex items-center justify-center pt-20">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-textLight mb-4">User not found</h2>
          <button
            onClick={() => navigate('/swipe')}
            className="text-netflixRed hover:text-accentHover transition"
          >
            Go back
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-dark pt-0 pb-12">
      {/* Hero Section - Netflix Mulan Style */}
      <div className="relative h-[100vh] min-h-[600px] overflow-hidden">
        {/* Background Image/Gradient */}
        <div className="absolute inset-0">
          <div className="absolute inset-0 bg-gradient-to-br from-darkPurple via-netflixRed/40 to-darkRed">
            <motion.div
              animate={{
                scale: [1, 1.1, 1],
                opacity: [0.3, 0.5, 0.3],
              }}
              transition={{ duration: 8, repeat: Infinity }}
              className="absolute inset-0 bg-gradient-to-br from-netflixRed/20 to-purple-600/20"
            />
          </div>
          
          {/* User Avatar as Background Element */}
          {user.avatar && (
            <div className="absolute inset-0 opacity-20">
              <img
                src={user.avatar}
                alt={user.name}
                className="w-full h-full object-cover blur-3xl scale-150"
              />
            </div>
          )}
        </div>

        {/* Content Overlay */}
        <div className="relative z-10 h-full flex flex-col justify-end container mx-auto px-6 pb-16">
          <div className="max-w-4xl">
            {/* User Name - Large Title */}
            <motion.h1
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="text-7xl md:text-9xl font-bold text-textLight mb-6 uppercase tracking-tight"
            >
              {user.name}
            </motion.h1>

            {/* Description/Bio */}
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="text-textLight text-lg md:text-xl mb-6 max-w-3xl leading-relaxed"
            >
              {user.bio || 'No bio yet. Add one to tell others about your vision!'}
            </motion.p>

            {/* Metadata */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="text-textLight mb-8 text-lg"
            >
              {new Date().getFullYear()} • {user.role || 'Visionary'} • {ideas.length} Ideas
            </motion.div>

            {/* Action Button - Netflix Play Button Style */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className="flex items-center gap-4"
            >
              {isOwnProfile ? (
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setEditing(true)}
                  className="bg-netflixRed text-white px-8 py-4 rounded-full font-semibold flex items-center gap-3 text-lg shadow-glow"
                >
                  <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M8 5v14l11-7z" />
                  </svg>
                  Edit Profile
                </motion.button>
              ) : (
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={handleMessage}
                  className="bg-netflixRed text-white px-8 py-4 rounded-full font-semibold flex items-center gap-3 text-lg shadow-glow"
                >
                  <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M8 5v14l11-7z" />
                  </svg>
                  Message
                </motion.button>
              )}
              
              {isOwnProfile && (
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={logout}
                  className="bg-darkBg/50 backdrop-blur-sm border-2 border-textLight text-textLight px-8 py-4 rounded-full font-semibold hover:bg-darkBg/70 transition text-lg"
                >
                  Logout
                </motion.button>
              )}
            </motion.div>
          </div>
        </div>
      </div>

      {/* Ideas Section - Netflix Trailers Style */}
      <div className="container mx-auto px-6 mt-8">
        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-2xl font-bold text-textLight mb-6"
        >
          {isOwnProfile ? 'Your Ideas' : `${user.name}'s Ideas`}
        </motion.h2>

        {ideas.length === 0 ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-12"
          >
            <p className="text-textGray text-lg mb-4">
              {isOwnProfile ? "You haven't submitted any ideas yet." : "This user hasn't submitted any ideas yet."}
            </p>
            {isOwnProfile && (
              <Link to="/swipe">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="bg-netflixRed text-white px-6 py-3 rounded-lg font-semibold"
                >
                  Generate Ideas
                </motion.button>
              </Link>
            )}
          </motion.div>
        ) : (
          <div className="overflow-x-auto pb-4 -mx-6 px-6">
            <div className="flex gap-4" style={{ width: 'max-content' }}>
              {ideas.map((idea, index) => (
                <motion.div
                  key={idea._id}
                  initial={{ opacity: 0, x: 50 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1 }}
                  whileHover={{ scale: 1.08, y: -10 }}
                  className="flex-shrink-0 w-80 cursor-pointer group"
                >
                  <div className="bg-gradient-card rounded-lg overflow-hidden border border-gray-800 hover:border-netflixRed/50 transition-all shadow-card">
                    {/* Idea Thumbnail */}
                    <div className="relative h-48 bg-gradient-to-br from-darkPurple to-darkRed overflow-hidden">
                      <motion.div
                        animate={{
                          scale: [1, 1.05, 1],
                        }}
                        transition={{ duration: 3, repeat: Infinity }}
                        className="absolute inset-0 bg-gradient-to-br from-netflixRed/30 to-purple-600/30"
                      />
                      
                      {/* Idea Icon/Preview */}
                      <div className="absolute inset-0 flex items-center justify-center">
                        <span className="text-6xl">
                          {idea.tags?.[0] === 'nft' ? '🎨' : 
                           idea.tags?.[0] === 'food' ? '🍕' : 
                           idea.tags?.[0] === 'social' ? '📱' : 
                           idea.tags?.[0] === 'ai' ? '🤖' : '💡'}
                        </span>
                      </div>

                      {/* Play Overlay on Hover */}
                      <motion.div
                        initial={{ opacity: 0 }}
                        whileHover={{ opacity: 1 }}
                        className="absolute inset-0 bg-black/60 flex items-center justify-center"
                      >
                        <div className="bg-netflixRed rounded-full p-4">
                          <svg className="w-8 h-8 text-white" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M8 5v14l11-7z" />
                          </svg>
                        </div>
                      </motion.div>
                    </div>

                    {/* Idea Info */}
                    <div className="p-5">
                      <h3 className="text-xl font-bold text-textLight mb-2 line-clamp-1 group-hover:text-netflixRed transition">
                        {idea.name}
                      </h3>
                      <p className="text-textGray text-sm mb-3 line-clamp-2">
                        {idea.oneLiner}
                      </p>
                      <div className="flex items-center justify-between text-xs text-textGray">
                        <div className="flex items-center gap-3">
                          <div className="flex items-center gap-1">
                            <span className="text-green-500">👍</span>
                            <span>{idea.swipeRightCount || 0}</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <span className="text-red-500">👎</span>
                            <span>{idea.swipeLeftCount || 0}</span>
                          </div>
                        </div>
                        {idea.tags?.[0] && (
                          <span className="px-2 py-1 bg-darkBg border border-gray-700 rounded text-textGray">
                            {idea.tags[0]}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Edit Modal */}
      {editing && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          onClick={() => setEditing(false)}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            onClick={(e) => e.stopPropagation()}
            className="bg-cardBg rounded-2xl p-8 max-w-2xl w-full border border-gray-800"
          >
            <h2 className="text-3xl font-bold text-textLight mb-6">Edit Profile</h2>
            <form onSubmit={handleSave} className="space-y-4">
              <div>
                <label className="block text-textLight font-semibold mb-2">Name</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full bg-darkBg border border-gray-700 rounded-lg px-4 py-3 text-textLight focus:outline-none focus:border-netflixRed transition"
                />
              </div>
              <div>
                <label className="block text-textLight font-semibold mb-2">Role</label>
                <select
                  value={formData.role}
                  onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                  className="w-full bg-darkBg border border-gray-700 rounded-lg px-4 py-3 text-textLight focus:outline-none focus:border-netflixRed transition"
                >
                  <option value="Visionary">Visionary</option>
                  <option value="Code">Code Monkey</option>
                  <option value="Marketing">Marketing Guru</option>
                  <option value="Fundless VC">Fundless VC</option>
                </select>
              </div>
              <div>
                <label className="block text-textLight font-semibold mb-2">Bio</label>
                <textarea
                  value={formData.bio}
                  onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                  className="w-full bg-darkBg border border-gray-700 rounded-lg px-4 py-3 text-textLight focus:outline-none focus:border-netflixRed transition resize-none"
                  rows="4"
                />
              </div>
              <div>
                <label className="block text-textLight font-semibold mb-2">Avatar URL</label>
                <input
                  type="url"
                  value={formData.avatar}
                  onChange={(e) => setFormData({ ...formData, avatar: e.target.value })}
                  className="w-full bg-darkBg border border-gray-700 rounded-lg px-4 py-3 text-textLight focus:outline-none focus:border-netflixRed transition"
                />
              </div>
              <div className="flex gap-4">
                <motion.button
                  whileHover={{ scale: 1.02, boxShadow: '0 0 20px rgba(229, 9, 20, 0.5)' }}
                  whileTap={{ scale: 0.98 }}
                  type="submit"
                  className="flex-1 bg-netflixRed text-white py-3 rounded-lg font-semibold"
                >
                  Save Changes
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  type="button"
                  onClick={() => setEditing(false)}
                  className="flex-1 bg-darkBg border border-gray-700 text-textLight py-3 rounded-lg font-semibold hover:border-netflixRed transition"
                >
                  Cancel
                </motion.button>
              </div>
            </form>
          </motion.div>
        </motion.div>
      )}
    </div>
  );
}
