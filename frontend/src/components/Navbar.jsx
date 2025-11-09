import { Link, useLocation, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '../contexts/AuthContext';
import { useState, useEffect } from 'react';

export default function Navbar() {
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Don't show navbar on marketing, login page or auth callback
  if (location.pathname === '/' || location.pathname === '/login' || location.pathname === '/auth/callback') {
    return null;
  }

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const isActive = (path) => location.pathname === path;

  if (!user) return null;

  return (
    <motion.nav
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled ? 'bg-darkBg/95 backdrop-blur-md shadow-lg' : 'bg-transparent'
      }`}
    >
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <Link to="/swipe">
            <motion.div
              whileHover={{ scale: 1.05 }}
              className="flex items-center gap-2"
            >
              <span className="text-3xl font-bold bg-gradient-to-r from-netflixRed to-red-400 bg-clip-text text-transparent">
                F
              </span>
              <span className="text-xl font-semibold text-textLight">oundrly</span>
            </motion.div>
          </Link>

          {/* Nav Links */}
          <div className="flex items-center gap-6">
            <NavLink to="/swipe" isActive={isActive('/swipe')}>
              Swipe
            </NavLink>
            <NavLink to="/matches" isActive={isActive('/matches')}>
              Matches
            </NavLink>
            <NavLink to="/feed" isActive={isActive('/feed')}>
              Feed
            </NavLink>
            <NavLink to="/profile" isActive={isActive('/profile')}>
              Profile
            </NavLink>

            {/* User Avatar & Logout */}
            <div className="relative group">
              <motion.div
                whileHover={{ scale: 1.1 }}
                className="w-10 h-10 rounded-full overflow-hidden border-2 border-netflixRed cursor-pointer"
              >
                <img
                  src={user.avatar || `https://ui-avatars.com/api/?name=${user.name}`}
                  alt={user.name}
                  className="w-full h-full object-cover"
                />
              </motion.div>

              {/* Dropdown */}
              <div className="absolute right-0 mt-2 w-48 bg-cardBg border border-gray-700 rounded-lg shadow-glow opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200">
                <div className="p-4 border-b border-gray-700">
                  <p className="text-textLight font-semibold truncate">{user.name}</p>
                  <p className="text-textGray text-sm truncate">{user.email}</p>
                </div>
                <button
                  onClick={handleLogout}
                  className="w-full text-left px-4 py-3 text-textLight hover:bg-netflixRed/20 transition-colors"
                >
                  Sign Out
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </motion.nav>
  );
}

function NavLink({ to, isActive, children }) {
  return (
    <Link to={to}>
      <motion.div
        whileHover={{ scale: 1.05 }}
        className="relative"
      >
        <span className={`text-sm font-medium transition-colors ${
          isActive ? 'text-textLight' : 'text-textGray hover:text-textLight'
        }`}>
          {children}
        </span>
        {isActive && (
          <motion.div
            layoutId="navbar-indicator"
            className="absolute -bottom-1 left-0 right-0 h-0.5 bg-netflixRed"
            transition={{ type: 'spring', stiffness: 380, damping: 30 }}
          />
        )}
      </motion.div>
    </Link>
  );
}

