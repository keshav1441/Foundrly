import express from "express";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { authenticateJWT } from "../middleware/auth.js";

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

export default router;
