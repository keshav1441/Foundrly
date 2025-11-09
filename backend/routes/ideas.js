import express from "express";
import Idea from "../models/Idea.js";
import Swipe from "../models/Swipe.js";
import { authenticateJWT, optionalAuth } from "../middleware/auth.js";

const router = express.Router();

// Get all ideas (excluding user's own ideas and already-swiped ideas if authenticated)
router.get("/", optionalAuth, async (req, res) => {
  try {
    const { trending, limit } = req.query;
    const userId = req.user?.sub;

    // Build query conditions
    const conditions = { isActive: true };

    // Exclude user's own ideas if authenticated
    if (userId) {
      conditions.submittedBy = { $ne: userId };

      // Get list of idea IDs the user has already swiped on
      const userSwipes = await Swipe.find({ user: userId }).select("idea");
      const swipedIdeaIds = userSwipes.map((swipe) => swipe.idea);

      // Exclude already-swiped ideas
      if (swipedIdeaIds.length > 0) {
        conditions._id = { $nin: swipedIdeaIds };
      }
    }

    let query = Idea.find(conditions);

    if (trending === "true") {
      query = query.sort({ swipeRightCount: -1 });
    } else {
      query = query.sort({ createdAt: -1 });
    }

    if (limit) {
      query = query.limit(parseInt(limit));
    }

    const ideas = await query.populate("submittedBy", "name avatar").exec();
    res.json(ideas);
  } catch (error) {
    console.error("Get ideas error:", error);
    res.status(500).json({ error: "Failed to get ideas" });
  }
});

// Get ideas by user
router.get("/user/:userId", async (req, res) => {
  try {
    const ideas = await Idea.find({
      submittedBy: req.params.userId,
      isActive: true,
    })
      .sort({ createdAt: -1 })
      .populate("submittedBy", "name avatar")
      .exec();
    res.json(ideas);
  } catch (error) {
    console.error("Get user ideas error:", error);
    res.status(500).json({ error: "Failed to get user ideas" });
  }
});

// Get idea by ID
router.get("/:id", async (req, res) => {
  try {
    const idea = await Idea.findById(req.params.id).populate(
      "submittedBy",
      "name avatar"
    );
    if (!idea) {
      return res.status(404).json({ error: "Idea not found" });
    }
    res.json(idea);
  } catch (error) {
    console.error("Get idea error:", error);
    res.status(500).json({ error: "Failed to get idea" });
  }
});

// Create idea
router.post("/", authenticateJWT, async (req, res) => {
  try {
    const idea = await Idea.create({
      ...req.body,
      submittedBy: req.user.sub,
    });
    await idea.populate("submittedBy", "name avatar");
    res.json(idea);
  } catch (error) {
    console.error("Create idea error:", error);
    res.status(500).json({ error: "Failed to create idea" });
  }
});

// Update idea
router.put("/:id", authenticateJWT, async (req, res) => {
  try {
    const idea = await Idea.findById(req.params.id);
    if (!idea) {
      return res.status(404).json({ error: "Idea not found" });
    }

    // Check if user owns the idea
    if (idea.submittedBy.toString() !== req.user.sub) {
      return res.status(403).json({ error: "Unauthorized" });
    }

    const updatedIdea = await Idea.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
    }).populate("submittedBy", "name avatar");

    res.json(updatedIdea);
  } catch (error) {
    console.error("Update idea error:", error);
    res.status(500).json({ error: "Failed to update idea" });
  }
});

// Delete idea (soft delete by setting isActive to false)
router.delete("/:id", authenticateJWT, async (req, res) => {
  try {
    const idea = await Idea.findById(req.params.id);
    if (!idea) {
      return res.status(404).json({ error: "Idea not found" });
    }

    // Check if user owns the idea
    if (idea.submittedBy.toString() !== req.user.sub) {
      return res.status(403).json({ error: "Unauthorized" });
    }

    const deletedIdea = await Idea.findByIdAndUpdate(
      req.params.id,
      { isActive: false },
      { new: true }
    ).populate("submittedBy", "name avatar");

    res.json(deletedIdea);
  } catch (error) {
    console.error("Delete idea error:", error);
    res.status(500).json({ error: "Failed to delete idea" });
  }
});

export default router;
