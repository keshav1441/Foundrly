import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../contexts/AuthContext';
import { useToast } from '../contexts/ToastContext';
import { api } from '../api/api';
import { io } from 'socket.io-client';

export default function Chat() {
  const { matchId: urlMatchId } = useParams();
  const { user } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();
  const [matches, setMatches] = useState([]);
  const [selectedMatchId, setSelectedMatchId] = useState(urlMatchId || null);
  const [match, setMatch] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [socket, setSocket] = useState(null);
  const [otherUser, setOtherUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const messagesEndRef = useRef(null);
  const processedMessageIds = useRef(new Set());
  const socketRef = useRef(null);

  // Load matches list
  useEffect(() => {
    if (!user?._id) return;
    loadMatches();
  }, [user?._id]);

  // Update selected match when URL changes
  useEffect(() => {
    if (urlMatchId) {
      setSelectedMatchId(urlMatchId);
    }
  }, [urlMatchId]);

  // Load match data and messages when selected match changes
  useEffect(() => {
    if (!user?._id || !selectedMatchId) return;

    loadMatchData();

    // Disconnect existing socket if any
    if (socketRef.current) {
      socketRef.current.off('message');
      socketRef.current.off('error');
      socketRef.current.off('connect');
      socketRef.current.disconnect();
      socketRef.current = null;
    }

    // Connect to Socket.io
    const API_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:4000';
    const baseURL = API_URL.replace('/api', '');
    const token = localStorage.getItem('token');
    
    if (!token) {
      console.error('No token found for Socket.io connection');
      return;
    }

    const socketInstance = io(`${baseURL}/chat`, {
      auth: {
        token: token,
      },
      transports: ['websocket', 'polling'],
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionAttempts: 5,
    });

    socketRef.current = socketInstance;

    socketInstance.on('connect', () => {
      console.log('Socket connected, joining match:', selectedMatchId);
      socketInstance.emit('join', { matchId: selectedMatchId });
    });

    socketInstance.on('joined', (data) => {
      console.log('Successfully joined room:', data);
    });

    socketInstance.on('disconnect', (reason) => {
      console.log('Socket disconnected:', reason);
    });

    socketInstance.on('connect_error', (error) => {
      console.error('Socket connection error:', error);
    });

    socketInstance.on('reconnect', (attemptNumber) => {
      console.log('Socket reconnected after', attemptNumber, 'attempts');
      socketInstance.emit('join', { matchId: selectedMatchId });
    });
    
    const handleMessage = (message) => {
      console.log('Received message via Socket.io:', message);
      const messageId = message._id?.toString();
      if (!messageId) {
        console.warn('Message received without _id:', message);
        return;
      }
      
      // Check if message was already processed
      if (processedMessageIds.current.has(messageId)) {
        console.log('Duplicate message detected, ignoring:', messageId);
        return;
      }
      
      setMessages((prev) => {
        // Double-check in state array as well
        if (prev.some(m => m._id?.toString() === messageId)) {
          return prev;
        }
        // Mark as processed and add to state
        processedMessageIds.current.add(messageId);
        return [...prev, message];
      });

      // Update matches list with new last message and re-sort
      setMatches((prev) => {
        const updated = prev.map((m) => {
          if (m._id === selectedMatchId) {
            return { ...m, lastMessage: message, sortTimestamp: message.createdAt };
          }
          return m;
        });
        
        // Re-sort by last message time (most recent first)
        return updated.sort((a, b) => {
          const timeA = new Date(a.sortTimestamp || a.lastMessage?.createdAt || a.createdAt).getTime();
          const timeB = new Date(b.sortTimestamp || b.lastMessage?.createdAt || b.createdAt).getTime();
          return timeB - timeA; // Most recent first
        });
      });
    };

    socketInstance.on('message', handleMessage);

    socketInstance.on('error', (error) => {
      console.error('Socket error:', error);
    });

    setSocket(socketInstance);

    return () => {
      if (socketInstance) {
        socketInstance.off('message', handleMessage);
        socketInstance.off('joined');
        socketInstance.off('error');
        socketInstance.off('connect');
        socketInstance.off('disconnect');
        socketInstance.off('connect_error');
        socketInstance.off('reconnect');
        socketInstance.disconnect();
      }
      socketRef.current = null;
      // Clear processed IDs when changing matches
      processedMessageIds.current.clear();
    };
  }, [selectedMatchId, user?._id]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const loadMatches = async () => {
    try {
      const response = await api.getMatches();
      // Backend already sorts, but ensure frontend maintains order
      const sortedMatches = response.data.sort((a, b) => {
        const timeA = new Date(a.sortTimestamp || a.lastMessage?.createdAt || a.createdAt).getTime();
        const timeB = new Date(b.sortTimestamp || b.lastMessage?.createdAt || b.createdAt).getTime();
        return timeB - timeA; // Most recent first
      });
      setMatches(sortedMatches);
      setLoading(false);
      
      // If no match is selected but we have matches, select the first one
      if (!selectedMatchId && sortedMatches.length > 0) {
        setSelectedMatchId(sortedMatches[0]._id);
        navigate(`/chat/${sortedMatches[0]._id}`, { replace: true });
      }
    } catch (error) {
      console.error('Failed to load matches:', error);
      setLoading(false);
    }
  };

  const loadMatchData = async () => {
    try {
      if (!user?._id) {
        console.error('User not loaded yet');
        return;
      }
      
      const matchResponse = await api.getMatch(selectedMatchId);
      setMatch(matchResponse.data);

      const other = matchResponse.data.user1?._id === user._id || matchResponse.data.user1?._id?.toString() === user._id?.toString()
        ? matchResponse.data.user2
        : matchResponse.data.user1;
      setOtherUser(other);

      const messagesResponse = await api.getMessages(selectedMatchId);
      const loadedMessages = messagesResponse.data;
      setMessages(loadedMessages);
      
      // Initialize processed message IDs with loaded messages
      processedMessageIds.current.clear();
      loadedMessages.forEach(msg => {
        if (msg._id) {
          processedMessageIds.current.add(msg._id.toString());
        }
      });
    } catch (error) {
      console.error('Failed to load chat:', error);
    }
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!newMessage.trim() || !selectedMatchId) return;

    const messageContent = newMessage.trim();
    setNewMessage(''); // Clear input immediately for better UX

    try {
      await api.sendMessage(selectedMatchId, messageContent);
      // Don't add message here - let Socket.io handle it to avoid duplicates
    } catch (error) {
      console.error('Failed to send message:', error);
      // Restore message on error
      setNewMessage(messageContent);
      showToast(error.response?.data?.error || 'Failed to send message. Please try again.', 'error');
    }
  };

  const handleSelectMatch = (matchId) => {
    setSelectedMatchId(matchId);
    navigate(`/chat/${matchId}`, { replace: true });
  };

  const formatTime = (date) => {
    if (!date) return '';
    const messageDate = new Date(date);
    const now = new Date();
    const diffMs = now - messageDate;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m`;
    if (diffHours < 24) return `${diffHours}h`;
    if (diffDays < 7) return `${diffDays}d`;
    return messageDate.toLocaleDateString();
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
    <div className="h-screen bg-black pt-20 flex overflow-hidden">
      {/* Left Sidebar - Matches List (22% width) */}
      <div className="w-[22%] min-w-[280px] border-r border-gray-900 flex flex-col bg-darkBg/30 h-full overflow-hidden">
        {/* Header */}
        <div className="p-4 border-b border-gray-900 bg-darkBg/50 backdrop-blur-xl flex-shrink-0">
          <h2 className="text-xl font-light text-textLight mb-1">Messages</h2>
          <p className="text-sm text-textGray font-light">{matches.length} conversations</p>
        </div>

        {/* Matches List */}
        <div className="flex-1 overflow-y-auto overflow-x-hidden">
          {matches.length === 0 ? (
            <div className="p-8 text-center">
              <p className="text-textGray font-light mb-4">No matches yet</p>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => navigate('/swipe')}
                className="bg-netflixRed text-white px-6 py-2 rounded-md font-light text-sm"
              >
                Start Swiping
              </motion.button>
            </div>
          ) : (
            <div>
              {matches.map((matchItem) => {
                const other = matchItem.user1?._id === user._id || matchItem.user1?._id?.toString() === user._id?.toString()
                  ? matchItem.user2
                  : matchItem.user1;
                const isSelected = selectedMatchId === matchItem._id;

                return (
                  <motion.div
                    key={matchItem._id}
                    whileHover={{ backgroundColor: 'rgba(229, 9, 20, 0.1)' }}
                    onClick={() => handleSelectMatch(matchItem._id)}
                    className={`p-4 border-b border-gray-900 cursor-pointer transition-all ${
                      isSelected ? 'bg-netflixRed/20 border-l-4 border-netflixRed' : 'hover:bg-darkBg/50'
                    }`}
                  >
                     <div className="flex items-start gap-3">
                       {/* Avatar - Show idea emoji or first letter */}
                       <div className="w-12 h-12 rounded-full overflow-hidden border border-netflixRed/30 flex-shrink-0 bg-gradient-to-br from-netflixRed/20 to-purple-600/20 flex items-center justify-center">
                         {matchItem.idea?.name ? (
                           <span className="text-xl font-bold text-textLight">
                             {matchItem.idea.name.charAt(0)}
                           </span>
                         ) : (
                           <img
                             src={other?.avatar || `https://ui-avatars.com/api/?name=${other?.name}`}
                             alt={other?.name}
                             className="w-full h-full object-cover"
                           />
                         )}
                       </div>

                       {/* Content */}
                       <div className="flex-1 min-w-0">
                         <div className="flex items-center justify-between mb-1">
                           <h3 className="text-sm font-medium text-textLight truncate">
                             {matchItem.idea?.name || 'Untitled Idea'}
                           </h3>
                           {matchItem.lastMessage && (
                             <span className="text-xs text-textGray/60 ml-2 flex-shrink-0">
                               {formatTime(matchItem.lastMessage.createdAt)}
                             </span>
                           )}
                         </div>
                         
                         {other && (
                           <p className="text-xs text-textGray/60 mb-1 truncate">
                             with {other.name}
                           </p>
                         )}

                         {matchItem.lastMessage ? (
                           <p className="text-sm text-textGray truncate">
                             {matchItem.lastMessage.sender?._id === user._id ? 'You: ' : `${other?.name}: `}
                             {matchItem.lastMessage.content}
                           </p>
                         ) : (
                           <p className="text-sm text-textGray/60 italic">No messages yet</p>
                         )}
                       </div>
                     </div>
                  </motion.div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Right Side - Chat Window (78% width) */}
      <div className="flex-1 flex flex-col bg-black h-full overflow-hidden">
        {selectedMatchId && match && otherUser ? (
          <>
             {/* Chat Header */}
             <motion.div
               initial={{ opacity: 0, y: -20 }}
               animate={{ opacity: 1, y: 0 }}
               className="bg-darkBg/50 backdrop-blur-xl p-4 border-b border-gray-900 flex-shrink-0"
             >
               <div className="flex items-center gap-4">
                 <div className="w-10 h-10 rounded-full overflow-hidden border border-netflixRed/30 bg-gradient-to-br from-netflixRed/20 to-purple-600/20 flex items-center justify-center">
                   {match.idea?.name ? (
                     <span className="text-lg font-bold text-textLight">
                       {match.idea.name.charAt(0)}
                     </span>
                   ) : (
                     <img
                       src={otherUser.avatar || `https://ui-avatars.com/api/?name=${otherUser.name}`}
                       alt={otherUser.name}
                       className="w-full h-full object-cover"
                     />
                   )}
                 </div>

                 <div className="flex-1">
                   <h2 className="text-lg font-light text-textLight">{match.idea?.name || 'Untitled Idea'}</h2>
                   <p className="text-xs text-textGray font-light">
                     with {otherUser.name}
                   </p>
                 </div>
               </div>
             </motion.div>

            {/* Messages Container */}
            <div className="flex-1 bg-darkBg/20 overflow-y-auto overflow-x-hidden p-6 space-y-4">
              <AnimatePresence>
                {messages.length === 0 ? (
                  <div className="flex items-center justify-center h-full">
                    <div className="text-center">
                      <p className="text-textGray font-light mb-2">No messages yet</p>
                      <p className="text-sm text-textGray/60 font-light">
                        Start the conversation with {otherUser.name}
                      </p>
                    </div>
                  </div>
                ) : (
                  messages.map((message, index) => {
                    const isOwnMessage = message.sender?._id === user._id || message.sender?._id?.toString() === user._id?.toString();

                    return (
                      <motion.div
                        key={message._id || index}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.02 }}
                        className={`flex ${isOwnMessage ? 'justify-end' : 'justify-start'}`}
                      >
                        <div
                          className={`max-w-xs lg:max-w-md px-4 py-3 rounded-lg font-light ${
                            isOwnMessage
                              ? 'bg-netflixRed/90 text-white rounded-br-sm'
                              : 'bg-darkBg/80 text-textLight rounded-bl-sm border border-gray-800'
                          }`}
                        >
                          <p className="break-words">{message.content}</p>
                          <p className={`text-xs mt-1 ${isOwnMessage ? 'text-white/60' : 'text-textGray/60'}`}>
                            {new Date(message.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </p>
                        </div>
                      </motion.div>
                    );
                  })
                )}
              </AnimatePresence>
              <div ref={messagesEndRef} />
            </div>

            {/* Message Input */}
            <motion.form
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              onSubmit={handleSendMessage}
              className="bg-darkBg/50 backdrop-blur-xl p-4 border-t border-gray-900 flex-shrink-0"
            >
              <div className="flex items-center gap-3">
                <input
                  type="text"
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  placeholder="Type a message..."
                  className="flex-1 bg-black border border-gray-800 rounded-md px-4 py-3 text-textLight placeholder-textGray/50 focus:outline-none focus:border-netflixRed/50 transition font-light"
                />
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  type="submit"
                  disabled={!newMessage.trim()}
                  className="bg-netflixRed text-white p-3 rounded-md disabled:opacity-50 disabled:cursor-not-allowed transition"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                  </svg>
                </motion.button>
              </div>
            </motion.form>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center">
              <p className="text-textGray font-light text-lg mb-2">Select a conversation</p>
              <p className="text-sm text-textGray/60 font-light">
                Choose a match from the left to start chatting
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
