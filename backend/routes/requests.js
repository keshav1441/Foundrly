import express from "express";
import Request from "../models/Request.js";
import Match from "../models/Match.js";
import Idea from "../models/Idea.js";
import { authenticateJWT } from "../middleware/auth.js";

const router = express.Router();

// We'll pass io through a global or get it from the app
let ioInstance = null;

export function setIO(io) {
  ioInstance = io;
}

function getIO() {
  return ioInstance;
}

// Create a request (when swiping right on someone's idea)
router.post("/", authenticateJWT, async (req, res) => {
  try {
    const { ideaId, message } = req.body;
    const userId = req.user.sub;

    // Get the idea
    const idea = await Idea.findById(ideaId);
    if (!idea) {
      return res.status(404).json({ error: "Idea not found" });
    }

    if (!idea.submittedBy) {
      return res.status(400).json({ error: "Idea has no owner" });
    }

    const ideaOwner = idea.submittedBy.toString();

    // Can't request your own idea
    if (ideaOwner === userId) {
      return res.status(400).json({ error: "Cannot request your own idea" });
    }

    // Check if request already exists
    const existingRequest = await Request.findOne({
      idea: ideaId,
      requester: userId,
      status: "pending",
    });

    if (existingRequest) {
      return res.status(400).json({ error: "Request already exists" });
    }

    // Create the request
    const request = await Request.create({
      idea: ideaId,
      requester: userId,
      ideaOwner: ideaOwner,
      message: message.trim(),
    });

    // Populate request for response
    const populatedRequest = await Request.findById(request._id)
      .populate("requester", "name avatar")
      .populate("ideaOwner", "name avatar")
      .populate("idea", "name oneLiner");

    // Notify idea owner via socket
    const io = getIO();
    if (io) {
      const chatNamespace = io.of("/chat");
      chatNamespace
        .to(`user:${ideaOwner}`)
        .emit("request_notification", populatedRequest);
    }

    res.json(populatedRequest);
  } catch (error) {
    console.error("Create request error:", error);
    res.status(500).json({ error: "Failed to create request" });
  }
});

// Get requests for the current user (as idea owner)
router.get("/", authenticateJWT, async (req, res) => {
  try {
    const userId = req.user.sub;

    const requests = await Request.find({ ideaOwner: userId })
      .populate("requester", "name avatar")
      .populate("idea", "name oneLiner")
      .sort({ createdAt: -1 });

    res.json(requests);
  } catch (error) {
    console.error("Get requests error:", error);
    res.status(500).json({ error: "Failed to get requests" });
  }
});

// Accept a request
router.post("/:id/accept", authenticateJWT, async (req, res) => {
  try {
    const request = await Request.findById(req.params.id).populate(
      "idea",
      "submittedBy"
    );

    if (!request) {
      return res.status(404).json({ error: "Request not found" });
    }

    // Verify user is the idea owner
    if (request.ideaOwner.toString() !== req.user.sub) {
      return res.status(403).json({ error: "Unauthorized" });
    }

    if (request.status !== "pending") {
      return res.status(400).json({ error: "Request already processed" });
    }

    // Update request status
    request.status = "accepted";
    await request.save();

    // Create a match
    const match = await Match.create({
      user1: request.requester,
      user2: request.ideaOwner,
      idea: request.idea,
    });

    // Populate match for notifications
    const populatedMatch = await Match.findById(match._id)
      .populate("user1", "name avatar")
      .populate("user2", "name avatar")
      .populate("idea", "name oneLiner");

    // Notify both users via socket
    const io = getIO();
    if (io) {
      const chatNamespace = io.of("/chat");
      chatNamespace
        .to(`user:${request.requester.toString()}`)
        .emit("match_notification", populatedMatch);
      chatNamespace
        .to(`user:${request.ideaOwner.toString()}`)
        .emit("match_notification", populatedMatch);
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
    const request = await Request.findById(req.params.id);

    if (!request) {
      return res.status(404).json({ error: "Request not found" });
    }

    // Verify user is the idea owner
    if (request.ideaOwner.toString() !== req.user.sub) {
      return res.status(403).json({ error: "Unauthorized" });
    }

    if (request.status !== "pending") {
      return res.status(400).json({ error: "Request already processed" });
    }

    // Update request status
    request.status = "rejected";
    await request.save();

    res.json(request);
  } catch (error) {
    console.error("Reject request error:", error);
    res.status(500).json({ error: "Failed to reject request" });
  }
});

export default router;
