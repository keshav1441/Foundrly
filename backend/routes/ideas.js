import express from 'express';
import Idea from '../models/Idea.js';
import { authenticateJWT } from '../middleware/auth.js';

const router = express.Router();

// Get all ideas
router.get('/', async (req, res) => {
  try {
    const { trending, limit } = req.query;
    let query = Idea.find({ isActive: true });

    if (trending === 'true') {
      query = query.sort({ swipeRightCount: -1 });
    } else {
      query = query.sort({ createdAt: -1 });
    }

    if (limit) {
      query = query.limit(parseInt(limit));
    }

    const ideas = await query.populate('submittedBy', 'name avatar').exec();
    res.json(ideas);
  } catch (error) {
    console.error('Get ideas error:', error);
    res.status(500).json({ error: 'Failed to get ideas' });
  }
});

// Get ideas by user
router.get('/user/:userId', async (req, res) => {
  try {
    const ideas = await Idea.find({ 
      submittedBy: req.params.userId,
      isActive: true 
    })
      .sort({ createdAt: -1 })
      .populate('submittedBy', 'name avatar')
      .exec();
    res.json(ideas);
  } catch (error) {
    console.error('Get user ideas error:', error);
    res.status(500).json({ error: 'Failed to get user ideas' });
  }
});

// Get idea by ID
router.get('/:id', async (req, res) => {
  try {
    const idea = await Idea.findById(req.params.id).populate('submittedBy', 'name avatar');
    if (!idea) {
      return res.status(404).json({ error: 'Idea not found' });
    }
    res.json(idea);
  } catch (error) {
    console.error('Get idea error:', error);
    res.status(500).json({ error: 'Failed to get idea' });
  }
});

// Create idea
router.post('/', authenticateJWT, async (req, res) => {
  try {
    const idea = await Idea.create({
      ...req.body,
      submittedBy: req.user.sub,
    });
    await idea.populate('submittedBy', 'name avatar');
    res.json(idea);
  } catch (error) {
    console.error('Create idea error:', error);
    res.status(500).json({ error: 'Failed to create idea' });
  }
});

export default router;

