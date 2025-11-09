import express from 'express';
import Meme from '../models/Meme.js';
import { authenticateJWT } from '../middleware/auth.js';

const router = express.Router();

// Get all memes
router.get('/', async (req, res) => {
  try {
    const { limit } = req.query;
    let query = Meme.find().populate('submittedBy', 'name avatar').sort({ upvotes: -1, createdAt: -1 });

    if (limit) {
      query = query.limit(parseInt(limit));
    }

    const memes = await query.exec();
    res.json(memes);
  } catch (error) {
    console.error('Get memes error:', error);
    res.status(500).json({ error: 'Failed to get memes' });
  }
});

// Get meme by ID
router.get('/:id', async (req, res) => {
  try {
    const meme = await Meme.findById(req.params.id).populate('submittedBy', 'name avatar');
    if (!meme) {
      return res.status(404).json({ error: 'Meme not found' });
    }
    res.json(meme);
  } catch (error) {
    console.error('Get meme error:', error);
    res.status(500).json({ error: 'Failed to get meme' });
  }
});

// Create meme
router.post('/', authenticateJWT, async (req, res) => {
  try {
    const { title, description, imageUrl } = req.body;

    if (!title || !title.trim()) {
      return res.status(400).json({ error: 'Title is required' });
    }

    if (!description || !description.trim()) {
      return res.status(400).json({ error: 'Description is required' });
    }

    const meme = await Meme.create({
      title: title.trim(),
      description: description.trim(),
      imageUrl: imageUrl?.trim() || undefined,
      submittedBy: req.user.sub,
    });
    await meme.populate('submittedBy', 'name avatar');
    res.json(meme);
  } catch (error) {
    console.error('Create meme error:', error);
    res.status(500).json({ error: 'Failed to create meme' });
  }
});

// Upvote meme
router.post('/:id/upvote', authenticateJWT, async (req, res) => {
  try {
    const meme = await Meme.findById(req.params.id);
    if (!meme) {
      return res.status(404).json({ error: 'Meme not found' });
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
    await meme.populate('submittedBy', 'name avatar');
    res.json(meme);
  } catch (error) {
    console.error('Upvote meme error:', error);
    res.status(500).json({ error: 'Failed to upvote meme' });
  }
});

export default router;

