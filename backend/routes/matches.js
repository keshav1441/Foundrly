import express from 'express';
import Match from '../models/Match.js';
import Swipe from '../models/Swipe.js';
import Idea from '../models/Idea.js';
import Message from '../models/Message.js';
import { authenticateJWT } from '../middleware/auth.js';

const router = express.Router();

// We'll pass io through a global or get it from the app
let ioInstance = null;

export function setIO(io) {
  ioInstance = io;
}

function getIO() {
  return ioInstance;
}

// Swipe on an idea
router.post('/swipe', authenticateJWT, async (req, res) => {
  try {
    const { ideaId, direction } = req.body;
    const userId = req.user.sub;

    // Check if user already swiped on this idea
    const existingSwipe = await Swipe.findOne({ user: userId, idea: ideaId });
    if (existingSwipe) {
      return res.json({});
    }

    // Record the swipe
    await Swipe.create({
      user: userId,
      idea: ideaId,
      direction,
    });

    // Update idea swipe counts
    if (direction === 'right') {
      await Idea.findByIdAndUpdate(ideaId, { $inc: { swipeRightCount: 1 } });
    } else {
      await Idea.findByIdAndUpdate(ideaId, { $inc: { swipeLeftCount: 1 } });
    }

    if (direction === 'right') {
      // Check if another user already swiped right on this idea
      const otherRightSwipe = await Swipe.findOne({
        idea: ideaId,
        user: { $ne: userId },
        direction: 'right',
      });

      if (otherRightSwipe) {
        // Create a match
        const match = await Match.create({
          user1: userId,
          user2: otherRightSwipe.user,
          idea: ideaId,
        });

        // Populate match for notifications
        const populatedMatch = await Match.findById(match._id)
          .populate('user1', 'name avatar')
          .populate('user2', 'name avatar')
          .populate('idea', 'name oneLiner');

        // Notify both users via socket
        const io = getIO();
        if (io) {
          const chatNamespace = io.of('/chat');
          chatNamespace.to(`user:${userId}`).emit('match_notification', populatedMatch);
          chatNamespace.to(`user:${otherRightSwipe.user.toString()}`).emit('match_notification', populatedMatch);
        }

        return res.json({ match: populatedMatch });
      }
    }

    res.json({});
  } catch (error) {
    console.error('Swipe error:', error);
    res.status(500).json({ error: 'Failed to swipe' });
  }
});

// Get user matches
router.get('/matches', authenticateJWT, async (req, res) => {
  try {
    const userId = req.user.sub;
    const matches = await Match.find({
      $or: [{ user1: userId }, { user2: userId }],
    })
      .populate('user1', 'name avatar role')
      .populate('user2', 'name avatar role')
      .populate('idea', 'name oneLiner')
      .sort({ createdAt: -1 });

    // Get last message for each match
    const matchesWithLastMessage = await Promise.all(
      matches.map(async (match) => {
        const lastMessage = await Message.findOne({ match: match._id })
          .populate('sender', 'name avatar')
          .sort({ createdAt: -1 })
          .limit(1)
          .lean();
        
        const matchObj = match.toObject();
        matchObj.lastMessage = lastMessage || null;
        // Add a sort timestamp for ordering (use last message time or match creation time)
        matchObj.sortTimestamp = lastMessage?.createdAt || match.createdAt;
        return matchObj;
      })
    );

    // Sort by last message time (most recent first), then by match creation time for matches without messages
    matchesWithLastMessage.sort((a, b) => {
      const timeA = new Date(a.sortTimestamp).getTime();
      const timeB = new Date(b.sortTimestamp).getTime();
      return timeB - timeA; // Most recent first
    });

    res.json(matchesWithLastMessage);
  } catch (error) {
    console.error('Get matches error:', error);
    res.status(500).json({ error: 'Failed to get matches' });
  }
});

// Get match by ID
router.get('/matches/:id', authenticateJWT, async (req, res) => {
  try {
    const userId = req.user.sub;
    const match = await Match.findById(req.params.id)
      .populate('user1', 'name avatar role')
      .populate('user2', 'name avatar role')
      .populate('idea', 'name oneLiner');

    if (!match) {
      return res.status(404).json({ error: 'Match not found' });
    }

    // Verify user is part of this match
    if (match.user1._id.toString() !== userId && match.user2._id.toString() !== userId) {
      return res.status(403).json({ error: 'Unauthorized' });
    }

    res.json(match);
  } catch (error) {
    console.error('Get match error:', error);
    res.status(500).json({ error: 'Failed to get match' });
  }
});

export default router;

