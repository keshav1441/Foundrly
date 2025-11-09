import { Link, useLocation, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../contexts/AuthContext';
import { useState, useEffect, useRef } from 'react';
import Notifications from './Notifications';
import Avatar from './Avatar';
import { BASE_URL } from '../config/api.js';

export default function Navbar() {
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [scrolled, setScrolled] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const dropdownRef = useRef(null);
  const socketRef = useRef(null);

  // Ensure dropdown is closed when user changes or on mount
  useEffect(() => {
    setShowDropdown(false);
    setShowNotifications(false);
  }, [user?._id, location.pathname]);

  // Load notifications count and setup Socket.io listener
  useEffect(() => {
    if (!user?._id) return;

    const loadNotifications = async () => {
      try {
        const { api } = await import('../api/api');
        const response = await api.getNotifications();
        setUnreadCount(response.data.unreadCount || 0);
      } catch (error) {
        console.error('Failed to load notifications:', error);
      }
    };

    loadNotifications();

    // Setup Socket.io for real-time notifications
    const baseURL = BASE_URL;
    const token = localStorage.getItem('token');

    let interval = null;

    if (token) {
      import('socket.io-client').then(({ io }) => {
        const socket = io(`${baseURL}/chat`, {
          auth: { token },
          transports: ['websocket', 'polling'],
          reconnection: true,
        });

        socketRef.current = socket;

        // Listen for new notifications (unified event)
        socket.on('new_notification', () => {
          loadNotifications();
        });

        // Listen for backward compatibility events
        socket.on('new_request_notification', () => {
          loadNotifications();
        });

        socket.on('new_message_notification', () => {
          loadNotifications();
        });

        socket.on('request_accepted_notification', () => {
          loadNotifications();
        });

        socket.on('match_notification', () => {
          loadNotifications();
        });
      });
    }

    // Refresh every 30 seconds as fallback
    interval = setInterval(loadNotifications, 30000);

    return () => {
      if (socketRef.current) {
        socketRef.current.off('new_notification');
        socketRef.current.off('new_request_notification');
        socketRef.current.off('new_message_notification');
        socketRef.current.off('request_accepted_notification');
        socketRef.current.off('match_notification');
        socketRef.current.disconnect();
        socketRef.current = null;
      }
      if (interval) {
        clearInterval(interval);
      }
    };
  }, [user?._id]);

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

    if (showDropdown) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [showDropdown]);

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
            <NavLink to="/chat" isActive={location.pathname.startsWith('/chat') || location.pathname === '/matches'}>
              Matches
            </NavLink>
            <NavLink to="/requests" isActive={isActive('/requests')}>
              Requests
            </NavLink>
            <NavLink to="/my-ideas" isActive={isActive('/my-ideas')}>
              My Ideas
            </NavLink>

            {/* Notifications Icon */}
            <div className="relative">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setShowNotifications(!showNotifications)}
                className="relative w-10 h-10 flex items-center justify-center text-textGray hover:text-textLight transition-colors"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                </svg>
                {unreadCount > 0 && (
                  <motion.span
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="absolute -top-1 -right-1 bg-netflixRed text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center"
                  >
                    {unreadCount > 9 ? '9+' : unreadCount}
                  </motion.span>
                )}
              </motion.button>

              <Notifications
                isOpen={showNotifications}
                onClose={() => {
                  setShowNotifications(false);
                }}
                onNotificationsChange={() => {
                  // Reload notifications count when notifications change
                  import('../api/api').then(({ api }) => {
                    api.getNotifications().then(res => {
                      setUnreadCount(res.data.unreadCount || 0);
                    }).catch(console.error);
                  });
                }}
              />
            </div>

            {/* User Avatar & Dropdown */}
            <div className="relative" ref={dropdownRef}>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setShowDropdown(!showDropdown)}
                className="border border-netflixRed/30 hover:border-netflixRed transition cursor-pointer rounded-full overflow-hidden"
              >
                <Avatar
                  src={user.avatar}
                  name={user.name}
                  size="sm"
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

