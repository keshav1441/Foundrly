import express from "express";
import Message from "../models/Message.js";
import Match from "../models/Match.js";
import { authenticateJWT } from "../middleware/auth.js";

const router = express.Router();
let ioInstance = null;

export function setIO(io) {
  ioInstance = io;
}

// Get messages for a match
router.get("/:matchId/messages", authenticateJWT, async (req, res) => {
  try {
    const { matchId } = req.params;
    const messages = await Message.find({ match: matchId })
      .populate("sender", "name avatar")
      .sort({ createdAt: 1 });

    res.json(messages);
  } catch (error) {
    console.error("Get messages error:", error);
    res.status(500).json({ error: "Failed to get messages" });
  }
});

// Send a message
router.post("/:matchId/messages", authenticateJWT, async (req, res) => {
  try {
    const { matchId } = req.params;
    const { content } = req.body;
    const userId = req.user.sub;

    if (!content || !content.trim()) {
      return res.status(400).json({ error: "Message content is required" });
    }

    const message = await Message.create({
      match: matchId,
      sender: userId,
      content: content.trim(),
    });

    const populatedMessage = await Message.findById(message._id).populate(
      "sender",
      "name avatar"
    );

    // Emit to Socket.io if available
    if (ioInstance) {
      try {
        const chatNamespace = ioInstance.of("/chat");
        const room = `match:${matchId}`;
        console.log(`Emitting message to room: ${room}`, populatedMessage._id);
        chatNamespace.to(room).emit("message", populatedMessage);

        // Emit notification to the recipient (if not in the room)
        const match = await Match.findById(matchId)
          .populate("user1", "name avatar")
          .populate("user2", "name avatar")
          .populate("idea", "name oneLiner");
        if (match) {
          const recipientId =
            match.user1.toString() === userId ? match.user2 : match.user1;
          const otherUser =
            match.user1.toString() === userId ? match.user2 : match.user1;

          const notification = {
            type: "message",
            id: populatedMessage._id,
            createdAt: populatedMessage.createdAt,
            data: {
              sender: populatedMessage.sender,
              match: {
                _id: match._id,
                idea: match.idea,
              },
              content: populatedMessage.content,
              otherUser: otherUser,
            },
          };

          chatNamespace
            .to(`user:${recipientId}`)
            .emit("new_notification", notification);
          // Also emit for backward compatibility
          chatNamespace
            .to(`user:${recipientId}`)
            .emit("new_message_notification", notification);
        }

        // Log room info for debugging
        const socketsInRoom = await chatNamespace.in(room).fetchSockets();
        console.log(`Sockets in room ${room}:`, socketsInRoom.length);
      } catch (error) {
        console.error("Socket.io emit error:", error);
      }
    } else {
      console.warn("ioInstance not available for emitting message");
    }

    res.status(201).json(populatedMessage);
  } catch (error) {
    console.error("Send message error:", error);
    res.status(500).json({ error: "Failed to send message" });
  }
});

// Mark messages as read
router.post("/:matchId/messages/read", authenticateJWT, async (req, res) => {
  try {
    const { matchId } = req.params;
    const userId = req.user.sub;

    // Mark all unread messages in this match as read (except ones sent by the user)
    await Message.updateMany(
      {
        match: matchId,
        sender: { $ne: userId },
        read: false,
      },
      {
        read: true,
      }
    );

    res.json({ success: true });
  } catch (error) {
    console.error("Mark messages read error:", error);
    res.status(500).json({ error: "Failed to mark messages as read" });
  }
});

export default router;
