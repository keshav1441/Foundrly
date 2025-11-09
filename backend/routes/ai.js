import express from 'express';
import OpenAI from 'openai';
import { GoogleGenerativeAI } from '@google/generative-ai';
import Idea from '../models/Idea.js';
import { authenticateJWT } from '../middleware/auth.js';

const router = express.Router();

let openai = null;
let gemini = null;

if (process.env.OPENAI_API_KEY) {
  openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
}

if (process.env.GEMINI_API_KEY) {
  gemini = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
}

// Generate ideas
router.post('/generate', authenticateJWT, async (req, res) => {
  try {
    const { count = 5 } = req.body;
    const ideas = await generateIdeas(count);
    res.json({ ideas });
  } catch (error) {
    console.error('Generate ideas error:', error);
    res.status(500).json({ error: 'Failed to generate ideas' });
  }
});

// Generate and save ideas
router.post('/generate-and-save', authenticateJWT, async (req, res) => {
  try {
    const { count = 5, userId } = req.body;
    const ideas = await generateIdeas(count);
    const savedIdeas = [];

    for (const ideaText of ideas) {
      const [name, ...oneLinerParts] = ideaText.split(':');
      const oneLiner = oneLinerParts.join(':').trim() || ideaText;

      const idea = await Idea.create({
        name: name.trim(),
        oneLiner,
        tags: ['ai-generated'],
        submittedBy: userId || req.user.sub,
      });

      await idea.populate('submittedBy', 'name avatar');
      savedIdeas.push(idea);
    }

    res.json({ ideas: savedIdeas });
  } catch (error) {
    console.error('Generate and save ideas error:', error);
    res.status(500).json({ error: 'Failed to generate and save ideas' });
  }
});

// Polish pitch
router.post('/pitchpolish', authenticateJWT, async (req, res) => {
  try {
    const { idea } = req.body;
    const polished = await pitchPolish(idea);
    res.json({ polished });
  } catch (error) {
    console.error('Pitch polish error:', error);
    res.status(500).json({ error: 'Failed to polish pitch' });
  }
});

async function generateIdeas(count = 5) {
  if (openai) {
    try {
      const response = await openai.chat.completions.create({
        model: 'gpt-3.5-turbo',
        messages: [
          {
            role: 'system',
            content:
              'You are a startup idea generator that creates hilariously bad startup ideas. Generate ideas in the format: "Idea Name: One-liner description". Return each idea on a new line.',
          },
          {
            role: 'user',
            content: `Generate ${count} hilariously bad startup ideas. Make them absurd, funny, and clearly terrible business ideas.`,
          },
        ],
        temperature: 1.2,
      });

      const ideas = response.choices[0].message.content
        .split('\n')
        .filter((line) => line.trim())
        .map((line) => line.replace(/^\d+\.\s*/, '').trim())
        .slice(0, count);

      return ideas;
    } catch (error) {
      console.error('OpenAI error:', error);
    }
  }

  if (gemini) {
    try {
      const model = gemini.getGenerativeModel({ model: 'gemini-pro' });
      const prompt = `Generate ${count} hilariously bad startup ideas. Format: "Idea Name: One-liner description". One per line.`;

      const result = await model.generateContent(prompt);
      const response = await result.response;
      const text = response.text();

      const ideas = text
        .split('\n')
        .filter((line) => line.trim())
        .map((line) => line.replace(/^\d+\.\s*/, '').trim())
        .slice(0, count);

      return ideas;
    } catch (error) {
      console.error('Gemini error:', error);
    }
  }

  // Fallback to mock ideas
  const mockIdeas = [
    'CryptoChores: Blockchain-based chore tracking for kids',
    'Rent-a-Plant: Subscription service for fake plants',
    'DogTweet: Social network exclusively for dogs',
    'UberForPotholes: Crowdsourced pothole filling service',
    'NFT-Toaster: Non-fungible toast art marketplace',
    'Coffee-as-a-Service: Monthly subscription for instant coffee',
    'Rent-a-Friend-for-Meetings: Hire actors to attend your Zoom calls',
    'SmartSocks: IoT socks that tweet your step count',
    'MemeStockAdvisor: AI that picks stocks based on memes',
    'GhostChef: Meal delivery from restaurants that closed',
  ];

  return mockIdeas.slice(0, count);
}

async function pitchPolish(idea) {
  if (openai) {
    try {
      const response = await openai.chat.completions.create({
        model: 'gpt-3.5-turbo',
        messages: [
          {
            role: 'system',
            content:
              'You are a fake VC pitch writer. Take a bad startup idea and rewrite it as a serious-sounding pitch deck summary. Make it sound professional but keep the absurdity. Format as a 2-3 sentence pitch.',
          },
          {
            role: 'user',
            content: `Rewrite this startup idea as a fake VC pitch: ${idea}`,
          },
        ],
        temperature: 0.8,
      });

      return response.choices[0].message.content;
    } catch (error) {
      console.error('OpenAI error:', error);
    }
  }

  if (gemini) {
    try {
      const model = gemini.getGenerativeModel({ model: 'gemini-pro' });
      const prompt = `Rewrite this bad startup idea as a fake VC pitch (2-3 sentences, professional but absurd): ${idea}`;

      const result = await model.generateContent(prompt);
      const response = await result.response;
      return response.text();
    } catch (error) {
      console.error('Gemini error:', error);
    }
  }

  // Fallback mock pitch
  return `We're revolutionizing the ${idea} space with cutting-edge technology and a scalable business model. Our platform leverages AI and blockchain to create unprecedented value for stakeholders. Join us in disrupting this $10B market.`;
}

export default router;

