import express from 'express';
import Request from '../models/Request.js';
import Message from '../models/Message.js';
import Match from '../models/Match.js';
import { authenticateJWT } from '../middleware/auth.js';

const router = express.Router();

// Get all notifications (requests + unread messages)
router.get('/', authenticateJWT, async (req, res) => {
  try {
    const userId = req.user.sub;

    // Get pending requests (received) that haven't been viewed
    const pendingRequests = await Request.find({
      ideaOwner: userId,
      status: 'pending',
      viewed: false,
    })
      .populate('requester', 'name avatar')
      .populate('idea', 'name oneLiner')
      .sort({ createdAt: -1 })
      .lean();

    // Get all user's matches
    const matches = await Match.find({
      $or: [{ user1: userId }, { user2: userId }],
    })
      .populate('user1', 'name avatar')
      .populate('user2', 'name avatar')
      .populate('idea', 'name oneLiner')
      .lean();

    // Get unread messages for each match
    const matchIds = matches.map(m => m._id);
    const unreadMessages = await Message.find({
      match: { $in: matchIds },
      sender: { $ne: userId },
      read: false,
    })
      .populate('sender', 'name avatar')
      .populate('match', 'idea')
      .sort({ createdAt: -1 })
      .lean();

    // Group messages by match and get the latest unread message per match
    const unreadMessagesByMatch = {};
    unreadMessages.forEach(msg => {
      const matchId = msg.match._id.toString();
      if (!unreadMessagesByMatch[matchId] || new Date(msg.createdAt) > new Date(unreadMessagesByMatch[matchId].createdAt)) {
        unreadMessagesByMatch[matchId] = msg;
      }
    });

    // Format notifications
    const notifications = [];

    // Add request notifications
    pendingRequests.forEach(request => {
      notifications.push({
        type: 'request',
        id: request._id,
        createdAt: request.createdAt,
        data: {
          requester: request.requester,
          idea: request.idea,
          message: request.message,
        },
      });
    });

    // Add message notifications
    Object.values(unreadMessagesByMatch).forEach(message => {
      const match = matches.find(m => m._id.toString() === message.match._id.toString());
      if (match) {
        const otherUser = match.user1._id.toString() === userId ? match.user2 : match.user1;
        notifications.push({
          type: 'message',
          id: message._id,
          createdAt: message.createdAt,
          data: {
            sender: message.sender,
            match: {
              _id: match._id,
              idea: match.idea,
            },
            content: message.content,
            otherUser: otherUser,
          },
        });
      }
    });

    // Sort by creation time (most recent first)
    notifications.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

    // Count unread
    const unreadCount = notifications.length;

    res.json({
      notifications,
      unreadCount,
    });
  } catch (error) {
    console.error('Get notifications error:', error);
    res.status(500).json({ error: 'Failed to get notifications' });
  }
});

// Mark notification as read
router.post('/:id/read', authenticateJWT, async (req, res) => {
  try {
    const userId = req.user.sub;
    const { type } = req.body; // 'request' or 'message'

    if (type === 'message') {
      // Mark message as read
      await Message.findByIdAndUpdate(req.params.id, { read: true });
    } else if (type === 'request') {
      // Mark request as viewed
      await Request.findByIdAndUpdate(req.params.id, { viewed: true });
    }

    res.json({ success: true });
  } catch (error) {
    console.error('Mark notification read error:', error);
    res.status(500).json({ error: 'Failed to mark notification as read' });
  }
});

// Delete notification
router.delete('/:id', authenticateJWT, async (req, res) => {
  try {
    const userId = req.user.sub;
    const { type } = req.body; // 'request' or 'message'

    if (type === 'message') {
      // Mark all unread messages in the match as read (effectively "deleting" the notification)
      const message = await Message.findById(req.params.id);
      if (message) {
        await Message.updateMany(
          {
            match: message.match,
            sender: { $ne: userId },
            read: false,
          },
          { read: true }
        );
      }
    } else if (type === 'request') {
      // Reject the request (effectively "deleting" the notification)
      const request = await Request.findById(req.params.id);
      if (request && request.ideaOwner.toString() === userId) {
        request.status = 'rejected';
        await request.save();
      }
    }

    res.json({ success: true });
  } catch (error) {
    console.error('Delete notification error:', error);
    res.status(500).json({ error: 'Failed to delete notification' });
  }
});

// Mark all notifications as read
router.post('/read-all', authenticateJWT, async (req, res) => {
  try {
    const userId = req.user.sub;
    console.log('Marking all notifications as read for user:', userId);

    // Get all user's matches
    const matches = await Match.find({
      $or: [{ user1: userId }, { user2: userId }],
    }).lean();

    const matchIds = matches.map(m => m._id);
    console.log('User matches:', matchIds.length);

    // Mark all unread messages as read
    const messagesResult = await Message.updateMany(
      {
        match: { $in: matchIds },
        sender: { $ne: userId },
        read: false,
      },
      { read: true }
    );
    console.log('Messages marked as read:', messagesResult.modifiedCount);

    // Mark all pending requests as viewed
    const requestsResult = await Request.updateMany(
      {
        ideaOwner: userId,
        status: 'pending',
        viewed: false,
      },
      { viewed: true }
    );
    console.log('Requests marked as viewed:', requestsResult.modifiedCount);

    res.json({ success: true, messagesMarked: messagesResult.modifiedCount, requestsMarked: requestsResult.modifiedCount });
  } catch (error) {
    console.error('Mark all notifications read error:', error);
    res.status(500).json({ error: 'Failed to mark all notifications as read' });
  }
});

// Delete all notifications
router.delete('/all', authenticateJWT, async (req, res) => {
  try {
    const userId = req.user.sub;

    // Get all user's matches
    const matches = await Match.find({
      $or: [{ user1: userId }, { user2: userId }],
    }).lean();

    const matchIds = matches.map(m => m._id);

    // Mark all unread messages as read
    await Message.updateMany(
      {
        match: { $in: matchIds },
        sender: { $ne: userId },
        read: false,
      },
      { read: true }
    );

    // Reject all pending requests
    await Request.updateMany(
      {
        ideaOwner: userId,
        status: 'pending',
      },
      { status: 'rejected' }
    );

    res.json({ success: true });
  } catch (error) {
    console.error('Delete all notifications error:', error);
    res.status(500).json({ error: 'Failed to delete all notifications' });
  }
});

export default router;

