import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '../contexts/AuthContext';
import { api } from '../api/api';
import IdeaDetailModal from '../components/IdeaDetailModal';

export default function Profile() {
  const { userId } = useParams();
  const { user: authUser, logout, fetchUser } = useAuth();
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [ideas, setIdeas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [isIdeaModalOpen, setIsIdeaModalOpen] = useState(false);
  const [selectedIdea, setSelectedIdea] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    bio: '',
    role: '',
    avatar: '',
  });
  const ideasSectionRef = useRef(null);

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

  const scrollToIdeas = () => {
    ideasSectionRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
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

  if (!user) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center pt-20">
        <div className="text-center">
          <h2 className="text-2xl font-light text-textLight mb-4">User not found</h2>
          <button
            onClick={() => navigate('/swipe')}
            className="text-netflixRed hover:text-netflixRed/80 transition font-light"
          >
            Go back
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black pt-0 pb-12">
      {/* Hero Section */}
      <div className="relative h-[100vh] min-h-[600px] overflow-hidden">
        {/* Background */}
        <div className="absolute inset-0">
          <div className="absolute inset-0 bg-gradient-to-b from-black via-darkBg to-black">
            {/* Subtle red accent spots */}
            <div className="absolute top-1/4 right-1/4 w-96 h-96 bg-netflixRed/5 rounded-full blur-3xl" />
            <div className="absolute bottom-1/3 left-1/4 w-80 h-80 bg-netflixRed/8 rounded-full blur-3xl" />
          </div>
          
          {/* User Avatar as Background Element */}
          {user.avatar && (
            <div className="absolute inset-0 opacity-10">
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
            {/* User Name */}
            <motion.h1
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="text-6xl md:text-8xl font-light text-textLight mb-6 tracking-tight"
            >
              {user.name}
            </motion.h1>

            {/* Bio */}
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="text-textLight text-lg md:text-xl mb-6 max-w-3xl leading-relaxed font-light"
            >
              {user.bio || 'No bio yet'}
            </motion.p>

            {/* Metadata */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="text-textGray mb-8 text-lg font-light"
            >
              {new Date().getFullYear()} • {user.role || 'Visionary'} • {ideas.length} Ideas
            </motion.div>

            {/* Action Buttons */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className="flex items-center gap-4"
            >
              {isOwnProfile ? (
                <>
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setEditing(true)}
                    className="bg-netflixRed text-white px-8 py-3 rounded-md font-medium"
                  >
                    Edit Profile
                  </motion.button>
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={scrollToIdeas}
                    className="bg-transparent border border-textGray/30 text-textLight px-8 py-3 rounded-md font-medium hover:border-textGray/60 transition"
                  >
                    My Ideas
                  </motion.button>
                </>
              ) : (
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={handleMessage}
                  className="bg-netflixRed text-white px-8 py-3 rounded-md font-medium"
                >
                  Message
                </motion.button>
              )}
            </motion.div>
          </div>
        </div>
      </div>

      {/* Ideas Section */}
      <div ref={ideasSectionRef} className="container mx-auto px-6 mt-8 scroll-mt-20">
        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-3xl font-light text-textLight mb-6"
        >
          {isOwnProfile ? 'Your ideas' : `${user.name}'s ideas`}
        </motion.h2>

        {ideas.length === 0 ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-12"
          >
            <p className="text-textGray text-lg mb-4 font-light">
              {isOwnProfile ? "No ideas yet" : "This user hasn't submitted any ideas yet"}
            </p>
            {isOwnProfile && (
              <Link to="/swipe">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="bg-netflixRed text-white px-6 py-3 rounded-md font-medium"
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
                  transition={{ delay: index * 0.05 }}
                  whileHover={{ scale: 1.05, y: -10 }}
                  onClick={() => {
                    setSelectedIdea(idea);
                    setIsIdeaModalOpen(true);
                  }}
                  className="flex-shrink-0 w-80 cursor-pointer group"
                >
                  <div className="bg-darkBg/50 backdrop-blur-xl rounded-lg overflow-hidden border border-gray-900 hover:border-gray-800 transition-all">
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
                    <div className="p-5">
                      <p className="text-textGray text-sm mb-3 line-clamp-2 font-light">
                        {idea.oneLiner}
                      </p>
                      {idea.tags && idea.tags.length > 0 && (
                        <div className="flex flex-wrap gap-2 mb-3">
                          {idea.tags.map((tag, index) => (
                            <span
                              key={index}
                              className="px-2 py-1 bg-black/50 border border-gray-800 rounded text-textGray text-xs"
                            >
                              {tag}
                            </span>
                          ))}
                        </div>
                      )}
                      <div className="flex items-center gap-3 text-xs text-textGray font-light">
                        <div className="flex items-center gap-1">
                          <div className="w-2 h-2 bg-green-500 rounded-full" />
                          <span>{idea.swipeRightCount || 0}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <div className="w-2 h-2 bg-red-500 rounded-full" />
                          <span>{idea.swipeLeftCount || 0}</span>
                        </div>
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
          className="fixed inset-0 bg-black/90 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          onClick={() => setEditing(false)}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            onClick={(e) => e.stopPropagation()}
            className="bg-darkBg rounded-lg p-8 max-w-2xl w-full border border-gray-900"
          >
            <h2 className="text-3xl font-light text-textLight mb-6">Edit profile</h2>
            <form onSubmit={handleSave} className="space-y-4">
              <div>
                <label className="block text-textLight font-light mb-2">Name</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full bg-black border border-gray-800 rounded-md px-4 py-3 text-textLight focus:outline-none focus:border-netflixRed/50 transition font-light"
                />
              </div>
              <div>
                <label className="block text-textLight font-light mb-2">Role</label>
                <select
                  value={formData.role}
                  onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                  className="w-full bg-black border border-gray-800 rounded-md px-4 py-3 text-textLight focus:outline-none focus:border-netflixRed/50 transition font-light"
                >
                  <option value="Visionary">Visionary</option>
                  <option value="Code">Code Monkey</option>
                  <option value="Marketing">Marketing Guru</option>
                  <option value="Fundless VC">Fundless VC</option>
                </select>
              </div>
              <div>
                <label className="block text-textLight font-light mb-2">Bio</label>
                <textarea
                  value={formData.bio}
                  onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                  className="w-full bg-black border border-gray-800 rounded-md px-4 py-3 text-textLight focus:outline-none focus:border-netflixRed/50 transition resize-none font-light"
                  rows="4"
                />
              </div>
              <div>
                <label className="block text-textLight font-light mb-2">Avatar URL</label>
                <input
                  type="url"
                  value={formData.avatar}
                  onChange={(e) => setFormData({ ...formData, avatar: e.target.value })}
                  className="w-full bg-black border border-gray-800 rounded-md px-4 py-3 text-textLight focus:outline-none focus:border-netflixRed/50 transition font-light"
                />
              </div>
              <div className="flex gap-4 pt-4">
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  type="submit"
                  className="flex-1 bg-netflixRed text-white py-3 rounded-md font-medium"
                >
                  Save Changes
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  type="button"
                  onClick={() => setEditing(false)}
                  className="flex-1 bg-transparent border border-gray-800 text-textLight py-3 rounded-md font-medium hover:border-gray-700 transition"
                >
                  Cancel
                </motion.button>
              </div>
            </form>
          </motion.div>
        </motion.div>
      )}

      {/* Idea Detail Modal */}
      <IdeaDetailModal
        isOpen={isIdeaModalOpen}
        onClose={() => {
          setIsIdeaModalOpen(false);
          setSelectedIdea(null);
        }}
        idea={selectedIdea}
        canEdit={isOwnProfile}
        onUpdate={() => {
          loadProfile();
        }}
      />
    </div>
  );
}
