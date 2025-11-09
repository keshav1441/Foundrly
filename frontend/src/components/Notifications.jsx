import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { api } from '../api/api';
import { useAuth } from '../contexts/AuthContext';
import { io } from 'socket.io-client';
import Avatar from './Avatar';
import { BASE_URL } from '../config/api.js';

export default function Notifications({ isOpen, onClose, onNotificationsChange }) {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const socketRef = useRef(null);
  const notificationsRef = useRef(null);

  useEffect(() => {
    if (!user?._id) return;

    loadNotifications();

    // Setup Socket.io connection for real-time notifications
    const baseURL = BASE_URL;
    const token = localStorage.getItem('token');

    if (token) {
      const socketInstance = io(`${baseURL}/chat`, {
        auth: { token },
        transports: ['websocket', 'polling'],
        reconnection: true,
      });

      socketRef.current = socketInstance;

      // Listen for new notifications (unified event)
      socketInstance.on('new_notification', (notification) => {
        console.log('New notification received:', notification);
        // Add notification to the list
        setNotifications(prev => {
          // Check if notification already exists
          const exists = prev.some(n => n.id === notification.id && n.type === notification.type);
          if (exists) return prev;
          // Add to beginning and sort
          const updated = [notification, ...prev].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
          return updated;
        });
        // Update unread count
        setUnreadCount(prev => prev + 1);
        onNotificationsChange?.(); // Update navbar count
      });

      // Listen for new request notifications (backward compatibility)
      socketInstance.on('new_request_notification', (data) => {
        console.log('New request notification:', data);
        if (data.type && data.id) {
          // If it's already in the new format, handle it directly
          setNotifications(prev => {
            const exists = prev.some(n => n.id === data.id && n.type === data.type);
            if (exists) return prev;
            const updated = [data, ...prev].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
            return updated;
          });
          setUnreadCount(prev => prev + 1);
        } else {
          loadNotifications(); // Fallback to reload
        }
        onNotificationsChange?.();
      });

      // Listen for new message notifications (backward compatibility)
      socketInstance.on('new_message_notification', (data) => {
        console.log('New message notification:', data);
        if (data.type && data.id) {
          // If it's already in the new format, handle it directly
          setNotifications(prev => {
            const exists = prev.some(n => n.id === data.id && n.type === data.type);
            if (exists) return prev;
            const updated = [data, ...prev].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
            return updated;
          });
          setUnreadCount(prev => prev + 1);
        } else {
          loadNotifications(); // Fallback to reload
        }
        onNotificationsChange?.();
      });

      // Listen for request accepted notifications (backward compatibility)
      socketInstance.on('request_accepted_notification', (data) => {
        console.log('Request accepted notification:', data);
        if (data.type && data.id) {
          // If it's already in the new format, handle it directly
          setNotifications(prev => {
            const exists = prev.some(n => n.id === data.id && n.type === data.type);
            if (exists) return prev;
            const updated = [data, ...prev].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
            return updated;
          });
          setUnreadCount(prev => prev + 1);
        } else {
          loadNotifications(); // Fallback to reload
        }
        onNotificationsChange?.();
      });

      // Listen for match notifications (also triggers when requests are accepted)
      socketInstance.on('match_notification', (data) => {
        console.log('Match notification:', data);
        loadNotifications(); // Reload to get updated match data
        onNotificationsChange?.();
      });

      return () => {
        socketInstance.off('new_notification');
        socketInstance.off('new_request_notification');
        socketInstance.off('new_message_notification');
        socketInstance.off('request_accepted_notification');
        socketInstance.off('match_notification');
        socketInstance.disconnect();
        socketRef.current = null;
      };
    }
  }, [user?._id]);

  // Close on outside click
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (notificationsRef.current && !notificationsRef.current.contains(event.target)) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [isOpen, onClose]);

  const loadNotifications = async () => {
    try {
      const response = await api.getNotifications();
      setNotifications(response.data.notifications || []);
      setUnreadCount(response.data.unreadCount || 0);
    } catch (error) {
      console.error('Failed to load notifications:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleNotificationClick = async (notification) => {
    // Mark notification as read when clicked
    try {
      await api.markNotificationRead(notification.id, notification.type);
      await loadNotifications(); // Reload to update UI
      onNotificationsChange?.(); // Update navbar count
    } catch (error) {
      console.error('Failed to mark notification as read:', error);
    }

    // Navigate based on notification type
    if (notification.type === 'request') {
      navigate('/requests');
      onClose();
    } else if (notification.type === 'request_accepted') {
      navigate('/chat');
      onClose();
    } else if (notification.type === 'message') {
      navigate(`/chat/${notification.data.match._id}`);
      onClose();
    }
  };

  const handleMarkAsRead = async (e, notification) => {
    e.stopPropagation();
    try {
      console.log('Marking notification as read:', notification.id, notification.type);
      const response = await api.markNotificationRead(notification.id, notification.type);
      console.log('Mark as read response:', response.data);
      await loadNotifications();
      onNotificationsChange?.();
    } catch (error) {
      console.error('Failed to mark notification as read:', error);
      if (error.response) {
        console.error('Error response:', error.response.data);
      }
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      console.log('Marking all notifications as read');
      const response = await api.markAllNotificationsRead();
      console.log('Mark all as read response:', response.data);
      await loadNotifications();
      onNotificationsChange?.();
    } catch (error) {
      console.error('Failed to mark all as read:', error);
      if (error.response) {
        console.error('Error response:', error.response.data);
      }
    }
  };

  const formatTime = (date) => {
    const now = new Date();
    const notificationDate = new Date(date);
    const diffMs = now - notificationDate;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return notificationDate.toLocaleDateString();
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/20 z-[9998]"
          />

          {/* Notifications Panel */}
          <motion.div
            ref={notificationsRef}
            initial={{ opacity: 0, x: 20, scale: 0.95 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            exit={{ opacity: 0, x: 20, scale: 0.95 }}
            className="fixed right-2 sm:right-4 top-16 md:top-20 w-[calc(100vw-1rem)] sm:w-96 max-w-[calc(100vw-2rem)] bg-darkBg/95 backdrop-blur-xl border border-gray-900 rounded-lg shadow-2xl z-[9999] max-h-[calc(100vh-5rem)] md:max-h-[calc(100vh-6rem)] flex flex-col"
          >
            {/* Header */}
            <div className="p-4 border-b border-gray-900">
              <div className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                  <h2 className="text-lg font-light text-textLight">Notifications</h2>
                  {unreadCount > 0 && (
                    <span className="bg-netflixRed text-white text-xs px-2 py-1 rounded-full">
                      {unreadCount}
                    </span>
                  )}
                </div>
              {notifications.length > 0 && (
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={handleMarkAllAsRead}
                  className="text-xs text-textGray hover:text-textLight px-3 py-1.5 rounded-md border border-gray-800 hover:border-gray-700 transition-colors"
                >
                  Mark all as read
                </motion.button>
              )}
              </div>
            </div>

            {/* Notifications List */}
            <div className="flex-1 overflow-y-auto">
              {loading ? (
                <div className="p-8 text-center">
                  <div className="w-8 h-8 border-2 border-netflixRed border-t-transparent rounded-full animate-spin mx-auto" />
                </div>
              ) : notifications.length === 0 ? (
                <div className="p-8 text-center">
                  <p className="text-textGray font-light">No notifications</p>
                </div>
              ) : (
                <div className="divide-y divide-gray-900">
                  {notifications.map((notification) => (
                    <motion.div
                      key={`${notification.type}-${notification.id}`}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="p-4 hover:bg-netflixRed/10 transition-colors group"
                    >
                      <div className="flex items-start gap-3">
                        {notification.type === 'request' ? (
                          <>
                            <div className="w-10 h-10 rounded-full overflow-hidden bg-gradient-to-br from-netflixRed/20 to-purple-600/20 flex items-center justify-center flex-shrink-0">
                              <span className="text-lg">💬</span>
                            </div>
                            <div
                              onClick={() => handleNotificationClick(notification)}
                              className="flex-1 min-w-0 cursor-pointer"
                            >
                              <p className="text-textLight text-sm font-medium mb-1">
                                {notification.data.requester?.name} sent a request
                              </p>
                              <p className="text-textGray text-xs mb-1 truncate">
                                {notification.data.idea?.name}
                              </p>
                              <p className="text-textGray text-xs mt-1">
                                {formatTime(notification.createdAt)}
                              </p>
                            </div>
                          </>
                        ) : notification.type === 'request_accepted' ? (
                          <>
                            <div className="w-10 h-10 rounded-full overflow-hidden bg-gradient-to-br from-green-500/20 to-emerald-600/20 flex items-center justify-center flex-shrink-0">
                              <span className="text-lg">✅</span>
                            </div>
                            <div
                              onClick={() => handleNotificationClick(notification)}
                              className="flex-1 min-w-0 cursor-pointer"
                            >
                              <p className="text-textLight text-sm font-medium mb-1">
                                {notification.data.ideaOwner?.name} accepted your request
                              </p>
                              <p className="text-textGray text-xs mb-1 truncate">
                                {notification.data.idea?.name}
                              </p>
                              <p className="text-green-400 text-xs mt-1 font-medium">
                                You're now matched! 🎉
                              </p>
                              <p className="text-textGray text-xs mt-1">
                                {formatTime(notification.createdAt)}
                              </p>
                            </div>
                          </>
                        ) : (
                          <>
                            <div className="flex-shrink-0">
                              <Avatar
                                src={notification.data.sender?.avatar}
                                name={notification.data.sender?.name}
                                size="md"
                              />
                            </div>
                            <div
                              onClick={() => handleNotificationClick(notification)}
                              className="flex-1 min-w-0 cursor-pointer"
                            >
                              <p className="text-textLight text-sm font-medium mb-1">
                                {notification.data.sender?.name} sent a message
                              </p>
                              <p className="text-textGray text-xs mb-1 truncate">
                                {notification.data.match?.idea?.name}
                              </p>
                              <p className="text-textGray text-xs mt-1">
                                {formatTime(notification.createdAt)}
                              </p>
                            </div>
                          </>
                        )}
                        {/* Action button - inline on the right */}
                        <div className="flex items-center opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0">
                          <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={(e) => handleMarkAsRead(e, notification)}
                            className="text-xs text-textGray hover:text-textLight px-2 py-1 rounded border border-gray-800 hover:border-gray-700 transition-colors"
                          >
                            Mark as read
                          </motion.button>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

