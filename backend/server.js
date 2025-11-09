import express from 'express';
import http from 'http';
import { Server } from 'socket.io';
import mongoose from 'mongoose';
import helmet from 'helmet';
import cors from 'cors';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

// Import routes
import authRoutes from './routes/auth.js';
import userRoutes from './routes/users.js';
import ideaRoutes from './routes/ideas.js';
import matchRoutes from './routes/matches.js';
import memeRoutes from './routes/memes.js';
import aiRoutes from './routes/ai.js';
import chatRoutes from './routes/chat.js';

// Import Socket.io setup
import { setupSocketIO } from './socket/chat.js';

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: process.env.FRONTEND_URL || 'http://localhost:3000',
    credentials: true,
  },
});

const PORT = process.env.PORT || 4000;
const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/foundrly';

// Middleware
app.use(helmet());
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true,
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/ideas', ideaRoutes);
app.use('/api/match', matchRoutes);
app.use('/api/memes', memeRoutes);
app.use('/api/ai', aiRoutes);
app.use('/api/chat', chatRoutes);

// Setup Socket.io
setupSocketIO(io);

// Set io instance for routes (after io is created)
// Use dynamic import to avoid circular dependency
import('./routes/matches.js').then((module) => {
  module.setIO(io);
});
import('./routes/chat.js').then((module) => {
  module.setIO(io);
});

// Connect to MongoDB
mongoose
  .connect(MONGO_URI)
  .then(() => {
    console.log('✅ Connected to MongoDB');
  })
  .catch((error) => {
    console.error('❌ MongoDB connection error:', error);
  });

// Start server
server.listen(PORT, () => {
  console.log(`🚀 Foundrly backend running on http://localhost:${PORT}`);
});

export { io };

