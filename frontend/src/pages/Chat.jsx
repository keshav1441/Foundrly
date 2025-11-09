import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../contexts/AuthContext';
import { api } from '../api/api';
import { io } from 'socket.io-client';

export default function Chat() {
  const { matchId } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [match, setMatch] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [socket, setSocket] = useState(null);
  const [otherUser, setOtherUser] = useState(null);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    loadMatchData();

    // Connect to Socket.io
    const API_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:4000';
    const socketInstance = io(API_URL.replace('/api', ''), {
      auth: {
        token: localStorage.getItem('token'),
      },
    });

    socketInstance.on('connect', () => {
      console.log('Socket connected');
      socketInstance.emit('join_match', matchId);
    });

    socketInstance.on('new_message', (message) => {
      setMessages((prev) => [...prev, message]);
    });

    setSocket(socketInstance);

    return () => {
      socketInstance.disconnect();
    };
  }, [matchId]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const loadMatchData = async () => {
    try {
      const matchResponse = await api.getMatch(matchId);
      setMatch(matchResponse.data);

      const other = matchResponse.data.user1._id === user._id
        ? matchResponse.data.user2
        : matchResponse.data.user1;
      setOtherUser(other);

      const messagesResponse = await api.getMessages(matchId);
      setMessages(messagesResponse.data);
    } catch (error) {
      console.error('Failed to load chat:', error);
    }
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!newMessage.trim()) return;

    try {
      const message = await api.sendMessage(matchId, newMessage);
      setNewMessage('');
      socket?.emit('send_message', { matchId, message: message.data });
    } catch (error) {
      console.error('Failed to send message:', error);
    }
  };

  if (!match || !otherUser) {
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
    <div className="min-h-screen bg-gradient-dark pt-20 pb-4 px-4">
      <div className="container mx-auto max-w-4xl h-[calc(100vh-7rem)] flex flex-col">
        {/* Chat Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-cardBg/80 backdrop-blur-xl rounded-t-2xl p-4 border border-gray-800 border-b-0"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={() => navigate('/matches')}
                className="text-textGray hover:text-netflixRed transition"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
              </motion.button>

              <div className="w-12 h-12 rounded-full overflow-hidden border-2 border-netflixRed">
                <img
                  src={otherUser.avatar || `https://ui-avatars.com/api/?name=${otherUser.name}`}
                  alt={otherUser.name}
                  className="w-full h-full object-cover"
                />
              </div>

              <div>
                <h2 className="text-xl font-bold text-textLight">{otherUser.name}</h2>
                <p className="text-sm text-textGray">
                  Matched on: <span className="text-netflixRed font-semibold">{match.idea?.name}</span>
                </p>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Messages Container */}
        <div className="flex-1 bg-darkBg/50 backdrop-blur-sm border-x border-gray-800 overflow-y-auto p-4 space-y-4">
          <AnimatePresence>
            {messages.map((message, index) => {
              const isOwnMessage = message.sender._id === user._id;

              return (
                <motion.div
                  key={message._id || index}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className={`flex ${isOwnMessage ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-xs lg:max-w-md px-4 py-3 rounded-2xl ${
                      isOwnMessage
                        ? 'bg-netflixRed text-white rounded-br-none shadow-glowSm'
                        : 'bg-cardBg text-textLight rounded-bl-none border border-gray-700'
                    }`}
                  >
                    <p className="break-words">{message.content}</p>
                    <p className={`text-xs mt-1 ${isOwnMessage ? 'text-white/70' : 'text-textGray'}`}>
                      {new Date(message.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </p>
                  </div>
                </motion.div>
              );
            })}
          </AnimatePresence>
          <div ref={messagesEndRef} />
        </div>

        {/* Message Input */}
        <motion.form
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          onSubmit={handleSendMessage}
          className="bg-cardBg/80 backdrop-blur-xl rounded-b-2xl p-4 border border-gray-800 border-t-0"
        >
          <div className="flex items-center gap-3">
            <input
              type="text"
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              placeholder="Type your message..."
              className="flex-1 bg-darkBg border border-gray-700 rounded-full px-6 py-3 text-textLight placeholder-textGray focus:outline-none focus:border-netflixRed transition"
            />
            <motion.button
              whileHover={{ scale: 1.05, boxShadow: '0 0 20px rgba(229, 9, 20, 0.5)' }}
              whileTap={{ scale: 0.95 }}
              type="submit"
              disabled={!newMessage.trim()}
              className="bg-netflixRed text-white p-3 rounded-full disabled:opacity-50 disabled:cursor-not-allowed transition"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
              </svg>
            </motion.button>
          </div>
        </motion.form>
      </div>
    </div>
  );
}
