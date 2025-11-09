import express from "express";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { authenticateJWT } from "../middleware/auth.js";
import Idea from "../models/Idea.js";

const router = express.Router();

let gemini = null;

// Initialize AI services (lazy initialization)
function initializeAIServices() {
  // Skip if already initialized
  if (gemini) {
    return;
  }

  // Debug: Check if env vars are loaded
  const hasGemini = !!process.env.GEMINI_API_KEY;

  if (hasGemini) {
    gemini = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    console.log("✅ Gemini initialized");
  } else {
    console.log("⚠️  GEMINI_API_KEY not found in environment");
    console.log("   Current working directory:", process.cwd());
    console.log(
      "   GEMINI_API_KEY value:",
      process.env.GEMINI_API_KEY ? "Found" : "Not found"
    );
  }
}

// Generate ideas as editable templates (returns ideas for user to edit before saving)
router.post("/generate-and-save", authenticateJWT, async (req, res) => {
  try {
    const { count = 1 } = req.body;
    const generatedIdeas = [];

    // Generate ideas one at a time
    for (let i = 0; i < count; i++) {
      try {
        const ideaData = await generateCompleteIdea();
        generatedIdeas.push(ideaData);
      } catch (ideaError) {
        console.error(`Error generating idea ${i + 1}:`, ideaError);
        // Continue with next idea instead of failing completely
      }
    }

    if (generatedIdeas.length === 0) {
      return res.status(500).json({
        error:
          "Failed to generate any ideas. Please check your GEMINI_API_KEY configuration.",
      });
    }

    res.json({ ideas: generatedIdeas });
  } catch (error) {
    console.error("Generate ideas error:", error);
    res.status(500).json({
      error:
        error.message ||
        "Failed to generate ideas. Please check your GEMINI_API_KEY configuration.",
    });
  }
});

async function generateCompleteIdea() {
  // Initialize if not already done (lazy initialization)
  initializeAIServices();

  if (gemini) {
    try {
      const model = gemini.getGenerativeModel({
        model: "gemini-2.5-flash",
      });
      const prompt = `You are a startup idea generator that creates hilariously bad startup ideas. Generate 1 hilariously bad startup idea with the following format:

Title: [Idea Name]
Description: [One-liner description]
Tags: [tag1, tag2, tag3, tag4]

Make the idea absurd, funny, and clearly a terrible business idea. Generate 2-4 relevant tags that are short, descriptive keywords. Return only the formatted response with Title, Description, and Tags sections.`;

      const result = await model.generateContent(prompt);
      const response = await result.response;
      const text = response.text().trim();

      // Parse the structured response
      const titleMatch = text.match(/Title:\s*(.+?)(?:\n|$)/i);
      const descriptionMatch = text.match(
        /Description:\s*(.+?)(?:\n|Tags:|$)/is
      );
      const tagsMatch = text.match(/Tags:\s*(.+?)(?:\n|$)/i);

      const name = titleMatch ? titleMatch[1].trim() : "Untitled Idea";
      const oneLiner = descriptionMatch ? descriptionMatch[1].trim() : "";

      // Parse tags
      let tags = [];
      if (tagsMatch) {
        tags = tagsMatch[1]
          .split(",")
          .map((tag) => tag.trim())
          .filter((tag) => tag.length > 0)
          .slice(0, 4);
      }

      // Fallback: if parsing fails, try to extract from the original format
      if (!name || !oneLiner) {
        const fallbackMatch = text.match(/^(.+?):\s*(.+?)(?:\n|Tags:|$)/s);
        if (fallbackMatch) {
          return {
            name: fallbackMatch[1].trim() || "Untitled Idea",
            oneLiner: fallbackMatch[2].trim(),
            tags: tags.length > 0 ? tags : [],
          };
        }
      }

      return {
        name: name || "Untitled Idea",
        oneLiner: oneLiner || "",
        tags: tags,
      };
    } catch (error) {
      console.error("Gemini error:", error);
      throw error;
    }
  }

  // If Gemini is not available, throw an error
  throw new Error(
    "No AI service available. Please configure GEMINI_API_KEY in your .env file."
  );
}

// Roast an idea - brutally insult it with stand-up comedian energy
router.post("/roast", authenticateJWT, async (req, res) => {
  try {
    const { ideaId } = req.body;

    if (!ideaId) {
      return res.status(400).json({ error: "Idea ID is required" });
    }

    // Get the idea
    const idea = await Idea.findById(ideaId);
    if (!idea) {
      return res.status(404).json({ error: "Idea not found" });
    }

    initializeAIServices();

    if (!gemini) {
      return res.status(500).json({
        error:
          "AI service not available. Please check your GEMINI_API_KEY configuration.",
      });
    }

    const model = gemini.getGenerativeModel({
      model: "gemini-2.5-flash",
    });

    const prompt = `You are a sarcastic investor and stand-up comedian. Brutally roast this startup idea with maximum ego damage and comedic value. Be savage, witty, and hilarious. Keep it under 150 words.

Idea Name: ${idea.name}
Description: ${idea.oneLiner}
Tags: ${idea.tags?.join(", ") || "None"}

Roast this idea mercilessly. Think of the funniest, most brutal takedown possible. Use stand-up comedian energy. Be creative and savage.`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const roast = response.text().trim();

    res.json({ roast });
  } catch (error) {
    console.error("Roast idea error:", error);
    res.status(500).json({
      error: error.message || "Failed to roast idea. Please try again.",
    });
  }
});

// Pitch an idea badly - rewrite it in cursed styles
router.post("/pitch-badly", authenticateJWT, async (req, res) => {
  try {
    const { ideaId, mode, ideaData } = req.body;

    if (!mode) {
      return res.status(400).json({ error: "Mode is required" });
    }

    const validModes = ["investor", "techbro", "doomer"];
    if (!validModes.includes(mode)) {
      return res.status(400).json({
        error: `Invalid mode. Must be one of: ${validModes.join(", ")}`,
      });
    }

    // Get the idea - either from database or from request body
    let idea;
    if (ideaId) {
      idea = await Idea.findById(ideaId);
      if (!idea) {
        return res.status(404).json({ error: "Idea not found" });
      }
    } else if (ideaData) {
      // Use idea data directly from request (for unsaved ideas)
      idea = {
        name: ideaData.name || "",
        oneLiner: ideaData.oneLiner || "",
        tags: ideaData.tags || [],
      };
    } else {
      return res
        .status(400)
        .json({ error: "Either ideaId or ideaData is required" });
    }

    initializeAIServices();

    if (!gemini) {
      return res.status(500).json({
        error:
          "AI service not available. Please check your GEMINI_API_KEY configuration.",
      });
    }

    const model = gemini.getGenerativeModel({
      model: "gemini-2.5-flash",
    });

    let modePrompt = "";
    if (mode === "investor") {
      modePrompt = `Rewrite this startup idea pitch in "Investor Edition" style. Make it sound like a pitch that's trying way too hard to sound impressive while actually being terrible. Use phrases like "revolutionizing", "disrupting", "burning VC money", "we're the Uber of X", "we're going to change the world", etc. Make it gloriously cursed and over-the-top.`;
    } else if (mode === "techbro") {
      modePrompt = `Rewrite this startup idea pitch in "TechBro Edition" style. Make it sound like it was written by someone who just discovered blockchain, AI, and buzzwords. Use phrases like "we're disrupting human interaction using blockchain and vibes", "leveraging AI to optimize", "it's like Uber but for X", "we're building the future", etc. Make it absurdly techbro-y and cursed.`;
    } else if (mode === "doomer") {
      modePrompt = `Rewrite this startup idea pitch in "Doomer Edition" style. Make it sound completely nihilistic and pessimistic. Use phrases like "it doesn't matter; the robots win anyway", "we're all going to die", "nothing matters", "the apocalypse is coming", etc. Make it hilariously depressing and cursed.`;
    }

    const prompt = `${modePrompt}

Original Idea:
Name: ${idea.name}
Description: ${idea.oneLiner}
Tags: ${idea.tags?.join(", ") || "None"}

Rewrite this pitch in the requested style. Make it funny, cursed, and perfect for meme fuel. Keep it under 200 words.`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const badPitch = response.text().trim();

    res.json({ pitch: badPitch, mode });
  } catch (error) {
    console.error("Pitch badly error:", error);
    res.status(500).json({
      error: error.message || "Failed to generate bad pitch. Please try again.",
    });
  }
});

export default router;
