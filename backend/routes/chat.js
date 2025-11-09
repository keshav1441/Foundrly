import express from 'express';
import Message from '../models/Message.js';
import { authenticateJWT } from '../middleware/auth.js';

const router = express.Router();

// Get messages for a match
router.get('/:matchId/messages', authenticateJWT, async (req, res) => {
  try {
    const { matchId } = req.params;
    const messages = await Message.find({ match: matchId })
      .populate('sender', 'name avatar')
      .sort({ createdAt: 1 });

    res.json(messages);
  } catch (error) {
    console.error('Get messages error:', error);
    res.status(500).json({ error: 'Failed to get messages' });
  }
});

export default router;

