import express from "express";
import Request from "../models/Request.js";
import Match from "../models/Match.js";
import Idea from "../models/Idea.js";
import { authenticateJWT } from "../middleware/auth.js";

const router = express.Router();
let ioInstance = null;

export function setIO(io) {
  ioInstance = io;
}

// Create a request
router.post("/", authenticateJWT, async (req, res) => {
  try {
    const { ideaId, message } = req.body;
    const userId = req.user.sub;

    if (!ideaId || !message || !message.trim()) {
      return res
        .status(400)
        .json({ error: "Idea ID and message are required" });
    }

    // Get the idea to find the owner
    const idea = await Idea.findById(ideaId).populate("submittedBy");
    if (!idea) {
      return res.status(404).json({ error: "Idea not found" });
    }

    const ideaOwnerId = idea.submittedBy._id.toString();

    // Can't request your own idea
    if (ideaOwnerId === userId) {
      return res
        .status(400)
        .json({ error: "You cannot request your own idea" });
    }

    // Check if request already exists
    const existingRequest = await Request.findOne({
      requester: userId,
      idea: ideaId,
    });

    if (existingRequest) {
      return res
        .status(400)
        .json({ error: "You have already sent a request for this idea" });
    }

    // Create the request
    const request = await Request.create({
      requester: userId,
      ideaOwner: ideaOwnerId,
      idea: ideaId,
      message: message.trim(),
      status: "pending",
    });

    const populatedRequest = await Request.findById(request._id)
      .populate("requester", "name avatar")
      .populate("ideaOwner", "name avatar")
      .populate("idea", "name oneLiner");

    // Emit notification to idea owner via Socket.io
    if (ioInstance) {
      try {
        const chatNamespace = ioInstance.of("/chat");
        chatNamespace
          .to(`user:${ideaOwnerId}`)
          .emit("new_request_notification", {
            type: "request",
            request: populatedRequest,
          });
      } catch (error) {
        console.error("Socket.io emit error:", error);
      }
    }

    res.status(201).json(populatedRequest);
  } catch (error) {
    console.error("Create request error:", error);
    if (error.code === 11000) {
      return res
        .status(400)
        .json({ error: "You have already sent a request for this idea" });
    }
    res.status(500).json({ error: "Failed to create request" });
  }
});

// Get requests (received requests for idea owner, sent requests for requester)
router.get("/", authenticateJWT, async (req, res) => {
  try {
    const userId = req.user.sub;

    // Get requests where user is the idea owner (received requests)
    const receivedRequests = await Request.find({
      ideaOwner: userId,
      status: "pending",
    })
      .populate("requester", "name avatar role")
      .populate("idea", "name oneLiner")
      .sort({ createdAt: -1 });

    // Get requests where user is the requester (sent requests)
    const sentRequests = await Request.find({
      requester: userId,
    })
      .populate("ideaOwner", "name avatar role")
      .populate("idea", "name oneLiner")
      .sort({ createdAt: -1 });

    res.json({
      received: receivedRequests,
      sent: sentRequests,
    });
  } catch (error) {
    console.error("Get requests error:", error);
    res.status(500).json({ error: "Failed to get requests" });
  }
});

// Accept a request
router.post("/:id/accept", authenticateJWT, async (req, res) => {
  try {
    const userId = req.user.sub;
    const request = await Request.findById(req.params.id)
      .populate("requester", "name avatar")
      .populate("ideaOwner", "name avatar")
      .populate("idea", "name oneLiner");

    if (!request) {
      return res.status(404).json({ error: "Request not found" });
    }

    // Only the idea owner can accept
    if (request.ideaOwner._id.toString() !== userId) {
      return res
        .status(403)
        .json({ error: "Only the idea owner can accept requests" });
    }

    if (request.status !== "pending") {
      return res
        .status(400)
        .json({ error: "Request has already been processed" });
    }

    // Update request status
    request.status = "accepted";
    await request.save();

    // Create a match
    const match = await Match.create({
      user1: request.requester._id,
      user2: request.ideaOwner._id,
      idea: request.idea._id,
    });

    const populatedMatch = await Match.findById(match._id)
      .populate("user1", "name avatar role")
      .populate("user2", "name avatar role")
      .populate("idea", "name oneLiner");

    // Notify both users via socket if available
    if (ioInstance) {
      try {
        const chatNamespace = ioInstance.of("/chat");
        // Notify requester that their request was accepted
        chatNamespace
          .to(`user:${request.requester._id}`)
          .emit("request_accepted_notification", {
            type: "request_accepted",
            request: request,
            match: populatedMatch,
          });
        // Notify both users about the new match
        chatNamespace
          .to(`user:${request.requester._id}`)
          .emit("match_notification", populatedMatch);
        chatNamespace
          .to(`user:${request.ideaOwner._id}`)
          .emit("match_notification", populatedMatch);
      } catch (error) {
        console.error("Socket.io emit error:", error);
      }
    }

    res.json({ match: populatedMatch, request });
  } catch (error) {
    console.error("Accept request error:", error);
    res.status(500).json({ error: "Failed to accept request" });
  }
});

// Reject a request
router.post("/:id/reject", authenticateJWT, async (req, res) => {
  try {
    const userId = req.user.sub;
    const request = await Request.findById(req.params.id);

    if (!request) {
      return res.status(404).json({ error: "Request not found" });
    }

    // Only the idea owner can reject
    if (request.ideaOwner.toString() !== userId) {
      return res
        .status(403)
        .json({ error: "Only the idea owner can reject requests" });
    }

    if (request.status !== "pending") {
      return res
        .status(400)
        .json({ error: "Request has already been processed" });
    }

    request.status = "rejected";
    await request.save();

    res.json({ message: "Request rejected", request });
  } catch (error) {
    console.error("Reject request error:", error);
    res.status(500).json({ error: "Failed to reject request" });
  }
});

export default router;
