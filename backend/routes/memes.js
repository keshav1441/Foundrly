import express from "express";
import Meme from "../models/Meme.js";
import Comment from "../models/Comment.js";
import { authenticateJWT } from "../middleware/auth.js";

const router = express.Router();

// Get all memes
router.get("/", async (req, res) => {
  try {
    const { limit } = req.query;
    let query = Meme.find()
      .populate("submittedBy", "name avatar")
      .sort({ upvotes: -1, createdAt: -1 });

    if (limit) {
      query = query.limit(parseInt(limit));
    }

    const memes = await query.exec();

    // Get comment counts for all memes
    const memeIds = memes.map((meme) => meme._id);
    const commentCounts = await Comment.aggregate([
      { $match: { meme: { $in: memeIds } } },
      { $group: { _id: "$meme", count: { $sum: 1 } } },
    ]);

    // Create a map of meme ID to comment count
    const countMap = {};
    commentCounts.forEach((item) => {
      countMap[item._id.toString()] = item.count;
    });

    // Add comment count to each meme
    const memesWithCounts = memes.map((meme) => {
      const memeObj = meme.toObject();
      memeObj.commentCount = countMap[meme._id.toString()] || 0;
      return memeObj;
    });

    res.json(memesWithCounts);
  } catch (error) {
    console.error("Get memes error:", error);
    res.status(500).json({ error: "Failed to get memes" });
  }
});

// Get meme by ID
router.get("/:id", async (req, res) => {
  try {
    const meme = await Meme.findById(req.params.id).populate(
      "submittedBy",
      "name avatar"
    );
    if (!meme) {
      return res.status(404).json({ error: "Meme not found" });
    }

    // Get comment count
    const commentCount = await Comment.countDocuments({ meme: req.params.id });
    const memeObj = meme.toObject();
    memeObj.commentCount = commentCount;

    res.json(memeObj);
  } catch (error) {
    console.error("Get meme error:", error);
    res.status(500).json({ error: "Failed to get meme" });
  }
});

// Create meme
router.post("/", authenticateJWT, async (req, res) => {
  try {
    const { title, description, imageUrl } = req.body;

    if (!title || !title.trim()) {
      return res.status(400).json({ error: "Title is required" });
    }

    if (!description || !description.trim()) {
      return res.status(400).json({ error: "Description is required" });
    }

    const meme = await Meme.create({
      title: title.trim(),
      description: description.trim(),
      imageUrl: imageUrl?.trim() || undefined,
      submittedBy: req.user.sub,
    });
    await meme.populate("submittedBy", "name avatar");
    res.json(meme);
  } catch (error) {
    console.error("Create meme error:", error);
    res.status(500).json({ error: "Failed to create meme" });
  }
});

// Upvote meme
router.post("/:id/upvote", authenticateJWT, async (req, res) => {
  try {
    const meme = await Meme.findById(req.params.id);
    if (!meme) {
      return res.status(404).json({ error: "Meme not found" });
    }

    const userId = req.user.sub;
    const hasUpvoted = meme.upvotedBy.some((id) => id.toString() === userId);

    if (hasUpvoted) {
      // Remove upvote
      meme.upvotes = Math.max(0, meme.upvotes - 1);
      meme.upvotedBy = meme.upvotedBy.filter((id) => id.toString() !== userId);
    } else {
      // Add upvote
      meme.upvotes += 1;
      meme.upvotedBy.push(userId);
    }

    await meme.save();
    await meme.populate("submittedBy", "name avatar");
    res.json(meme);
  } catch (error) {
    console.error("Upvote meme error:", error);
    res.status(500).json({ error: "Failed to upvote meme" });
  }
});

// Get comments for a meme
router.get("/:id/comments", async (req, res) => {
  try {
    const meme = await Meme.findById(req.params.id);
    if (!meme) {
      return res.status(404).json({ error: "Meme not found" });
    }

    const comments = await Comment.find({ meme: req.params.id })
      .populate("author", "name avatar")
      .sort({ createdAt: 1 });

    res.json(comments);
  } catch (error) {
    console.error("Get comments error:", error);
    res.status(500).json({ error: "Failed to get comments" });
  }
});

// Create a comment on a meme
router.post("/:id/comments", authenticateJWT, async (req, res) => {
  try {
    const meme = await Meme.findById(req.params.id);
    if (!meme) {
      return res.status(404).json({ error: "Meme not found" });
    }

    const { content } = req.body;
    if (!content || !content.trim()) {
      return res.status(400).json({ error: "Comment content is required" });
    }

    const comment = await Comment.create({
      meme: req.params.id,
      author: req.user.sub,
      content: content.trim(),
    });

    await comment.populate("author", "name avatar");
    res.json(comment);
  } catch (error) {
    console.error("Create comment error:", error);
    res.status(500).json({ error: "Failed to create comment" });
  }
});

export default router;
