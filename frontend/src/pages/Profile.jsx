import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '../contexts/AuthContext';
import { useToast } from '../contexts/ToastContext';
import { api } from '../api/api';
import Avatar from '../components/Avatar';

export default function Profile() {
  const { userId } = useParams();
  const { user: authUser, logout, fetchUser } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    bio: '',
    role: '',
    avatar: '',
    linkedinUrl: '',
    interests: [],
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
        
        // Set form data if own profile
        const isOwn = !userId || userId === authUser?._id;
        if (isOwn) {
          setFormData({
            name: userResponse.data.name || '',
            bio: userResponse.data.bio || '',
            role: userResponse.data.role || 'Visionary',
            avatar: userResponse.data.avatar || '',
            linkedinUrl: userResponse.data.linkedinUrl || '',
            interests: userResponse.data.interests || [],
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
      showToast('Profile updated successfully!', 'success');
    } catch (error) {
      console.error('Failed to update profile:', error);
      showToast('Failed to update profile. Please try again.', 'error');
    }
  };

  const handleCancel = () => {
    // Reset form data to current user data
    if (user) {
      setFormData({
        name: user.name || '',
        bio: user.bio || '',
        role: user.role || 'Visionary',
        avatar: user.avatar || '',
        linkedinUrl: user.linkedinUrl || '',
        interests: user.interests || [],
      });
    }
    setEditing(false);
  };

  const handleMessage = () => {
    navigate(`/chat`);
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
    <div className="h-screen bg-black pt-0 overflow-hidden">
      {/* Hero Section */}
      <div className="relative h-full overflow-hidden">
        {/* Background */}
        <div className="absolute inset-0">
          <div className="absolute inset-0 bg-gradient-to-b from-black via-darkBg to-black">
            {/* Subtle red accent spots */}
            <div className="absolute top-1/4 right-1/4 w-96 h-96 bg-netflixRed/5 rounded-full blur-3xl" />
            <div className="absolute bottom-1/3 left-1/4 w-80 h-80 bg-netflixRed/8 rounded-full blur-3xl" />
          </div>
          
          {/* User Avatar as Background Element */}
          <div className="absolute inset-0 opacity-10">
            <Avatar
              src={user.avatar}
              name={user.name}
              className="w-full h-full object-cover blur-3xl scale-150"
              size="xl"
            />
          </div>
        </div>

        {/* Content Overlay */}
        <div className="relative z-10 h-full flex flex-col justify-end container mx-auto px-6 pb-8">
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
              className="text-textGray mb-4 text-lg font-light"
            >
              {new Date().getFullYear()} • {user.role || 'Visionary'}
            </motion.div>

            {/* LinkedIn & Interests */}
            {(user.linkedinUrl || (user.interests && user.interests.length > 0)) && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.45 }}
                className="mb-8"
              >
                {user.linkedinUrl && (
                  <div className="mb-3">
                    <a
                      href={user.linkedinUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-white hover:text-textLight transition font-light flex items-center gap-2"
                    >
                      <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
                      </svg>
                      LinkedIn Profile
                    </a>
                  </div>
                )}
                {user.interests && user.interests.length > 0 && (
                  <div>
                    <p className="text-textGray text-sm mb-2 font-light">Interests</p>
                    <div className="flex flex-wrap gap-2">
                      {user.interests.map((interest, index) => (
                        <span
                          key={index}
                          className="px-3 py-1 bg-netflixRed/10 border border-netflixRed/30 rounded-full text-textLight text-sm font-light"
                        >
                          {interest}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </motion.div>
            )}

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
                  <Link to="/my-ideas">
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      className="bg-transparent border border-textGray/30 text-textLight px-8 py-3 rounded-md font-medium hover:border-textGray/60 transition"
                    >
                      My Ideas
                    </motion.button>
                  </Link>
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


      {/* Edit Modal */}
      {editing && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/90 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-y-auto"
          onClick={handleCancel}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            onClick={(e) => e.stopPropagation()}
            className="bg-darkBg rounded-lg p-8 max-w-2xl w-full border border-gray-900 my-8 max-h-[90vh] flex flex-col"
          >
            <h2 className="text-3xl font-light text-textLight mb-6 flex-shrink-0">Edit profile</h2>
            <form onSubmit={handleSave} className="space-y-4 overflow-y-auto flex-1 min-h-0 pr-2">
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
              <div>
                <label className="block text-textLight font-light mb-2">LinkedIn URL</label>
                <input
                  type="url"
                  value={formData.linkedinUrl}
                  onChange={(e) => setFormData({ ...formData, linkedinUrl: e.target.value })}
                  placeholder="https://linkedin.com/in/yourprofile"
                  className="w-full bg-black border border-gray-800 rounded-md px-4 py-3 text-textLight focus:outline-none focus:border-netflixRed/50 transition font-light"
                />
              </div>
              <div>
                <label className="block text-textLight font-light mb-2">Interests</label>
                <textarea
                  value={formData.interests.join(', ')}
                  onChange={(e) => {
                    const interestsArray = e.target.value
                      .split(',')
                      .map(interest => interest.trim())
                      .filter(interest => interest.length > 0);
                    setFormData({ ...formData, interests: interestsArray });
                  }}
                  placeholder="Enter interests separated by commas (e.g., AI, Startups, Technology)"
                  className="w-full bg-black border border-gray-800 rounded-md px-4 py-3 text-textLight focus:outline-none focus:border-netflixRed/50 transition resize-none font-light"
                  rows="3"
                />
                <p className="text-textGray text-xs mt-1 font-light">Separate multiple interests with commas</p>
              </div>
              <div className="flex gap-4 pt-4 flex-shrink-0">
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
                  onClick={handleCancel}
                  className="flex-1 bg-transparent border border-gray-800 text-textLight py-3 rounded-md font-medium hover:border-gray-700 transition"
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
