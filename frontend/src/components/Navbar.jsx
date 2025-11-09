import { Link, useLocation, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../contexts/AuthContext';
import { useState, useEffect, useRef } from 'react';

export default function Navbar() {
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [scrolled, setScrolled] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
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
              whileHover={{ opacity: 0.8 }}
              className="text-2xl font-light tracking-tight text-textLight"
            >
              found<span className="text-netflixRed">r</span>ly
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

            {/* User Avatar & Dropdown */}
            <div className="relative" ref={dropdownRef}>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setShowDropdown(!showDropdown)}
                className="w-10 h-10 rounded-full overflow-hidden border border-netflixRed/30 hover:border-netflixRed transition cursor-pointer"
              >
                <img
                  src={user.avatar || `https://ui-avatars.com/api/?name=${user.name}`}
                  alt={user.name}
                  className="w-full h-full object-cover"
                />
              </motion.button>

              {/* Dropdown */}
              <AnimatePresence>
                {showDropdown && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.2 }}
                    className="absolute right-0 mt-2 w-48 bg-darkBg/95 backdrop-blur-xl border border-gray-900 rounded-lg shadow-2xl"
                  >
                    <div className="p-4 border-b border-gray-900">
                      <p className="text-textLight font-light truncate">{user.name}</p>
                      <p className="text-textGray text-sm truncate font-light">{user.email}</p>
                    </div>
                    <button
                      onClick={() => {
                        navigate('/profile');
                        setShowDropdown(false);
                      }}
                      className="w-full text-left px-4 py-3 text-textLight hover:bg-netflixRed/20 transition-colors font-light"
                    >
                      Profile
                    </button>
                    <button
                      onClick={handleLogout}
                      className="w-full text-left px-4 py-3 text-textLight hover:bg-netflixRed/20 transition-colors font-light"
                    >
                      Sign Out
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>
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

