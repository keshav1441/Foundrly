import jwt from 'jsonwebtoken';
import Message from '../models/Message.js';
import Match from '../models/Match.js';

export function setupSocketIO(io) {
  const chatNamespace = io.of('/chat');

  chatNamespace.use(async (socket, next) => {
    try {
      const token = socket.handshake.auth?.token || socket.handshake.headers?.authorization?.split(' ')[1];
      if (token) {
        const payload = jwt.verify(token, process.env.JWT_SECRET || 'changeme');
        socket.userId = payload.sub;
        socket.join(`user:${payload.sub}`);
        next();
      } else {
        next(new Error('Authentication error'));
      }
    } catch (error) {
      next(new Error('Authentication error'));
    }
  });

  chatNamespace.on('connection', (socket) => {
    console.log('User connected to chat:', socket.userId);

    socket.on('join', async (data) => {
      const { matchId } = data;
      if (!matchId) {
        console.error('Join event received without matchId');
        return;
      }
      const room = `match:${matchId}`;
      socket.join(room);
      console.log(`User ${socket.userId} joined room: ${room}`);
      
      // Confirm join
      socket.emit('joined', { matchId, room });
    });

    socket.on('message', async (data) => {
      try {
        const { matchId, content } = data;
        const userId = socket.userId;

        // Create message
        const message = await Message.create({
          match: matchId,
          sender: userId,
          content,
        });

        await message.populate('sender', 'name avatar');

        // Send to all users in the match room
        chatNamespace.to(`match:${matchId}`).emit('message', message);
      } catch (error) {
        console.error('Message error:', error);
        socket.emit('error', { message: 'Failed to send message' });
      }
    });

    socket.on('typing', (data) => {
      const { matchId, isTyping } = data;
      socket.to(`match:${matchId}`).emit('typing', {
        userId: socket.userId,
        isTyping,
      });
    });

    socket.on('disconnect', () => {
      console.log('User disconnected from chat:', socket.userId);
    });
  });

  // Helper function to notify users of matches
  chatNamespace.notifyMatch = (userId, match) => {
    chatNamespace.to(`user:${userId}`).emit('match_notification', match);
  };
}

