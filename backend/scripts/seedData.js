import mongoose from "mongoose";
import dotenv from "dotenv";
import { fileURLToPath } from "url";
import { dirname, join } from "path";
import { GoogleGenerativeAI } from "@google/generative-ai";

// Get the directory of the current module
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load environment variables
const envPath = join(__dirname, "..", ".env");
dotenv.config({ path: envPath });

// Import models
import User from "../models/User.js";
import Idea from "../models/Idea.js";

const MONGO_URI = process.env.MONGO_URI || "mongodb://localhost:27017/foundrly";

let gemini = null;

// Initialize AI services
function initializeAIServices() {
  const hasGemini = !!process.env.GEMINI_API_KEY;
  if (hasGemini) {
    gemini = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    console.log("✅ Gemini initialized");
  } else {
    console.log("⚠️  GEMINI_API_KEY not found, using fallback ideas");
  }
}

async function generateCompleteIdea() {
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

  // Always return fallback ideas (used when AI fails or is unavailable)
  const fallbackIdeas = [
    {
      name: "Uber for Pigeons",
      oneLiner:
        "A delivery service where pigeons carry your packages. Because why not?",
      tags: ["delivery", "birds", "absurd", "logistics"],
    },
    {
      name: "Netflix for Netflix",
      oneLiner:
        "A streaming service that only streams Netflix shows. Revolutionary.",
      tags: ["streaming", "meta", "redundant", "entertainment"],
    },
    {
      name: "Airbnb for Air",
      oneLiner:
        "Rent out the air in your room. Premium oxygen subscription included.",
      tags: ["hospitality", "absurd", "subscription", "wellness"],
    },
    {
      name: "Tinder for Plants",
      oneLiner:
        "Swipe right to match your houseplants with compatible partners.",
      tags: ["dating", "plants", "absurd", "lifestyle"],
    },
    {
      name: "Blockchain for Blockchains",
      oneLiner:
        "A blockchain that tracks other blockchains. Maximum decentralization.",
      tags: ["blockchain", "crypto", "meta", "tech"],
    },
  ];

  return fallbackIdeas[Math.floor(Math.random() * fallbackIdeas.length)];
}

async function seedData() {
  try {
    // Connect to MongoDB
    await mongoose.connect(MONGO_URI);
    console.log("✅ Connected to MongoDB");

    // Initialize AI services
    initializeAIServices();

    // Get all users
    const users = await User.find({});
    console.log(`\n👥 Found ${users.length} users\n`);

    if (users.length === 0) {
      console.log("⚠️  No users found. Please create users first.");
      await mongoose.connection.close();
      process.exit(0);
    }

    let totalIdeasCreated = 0;

    // Create 5 ideas for each user
    for (const user of users) {
      console.log(`📝 Creating 5 ideas for ${user.name || user.email}...`);

      const ideasToCreate = [];
      for (let i = 0; i < 5; i++) {
        let ideaData = await generateCompleteIdea();

        // If AI generation failed or returned null, use fallback
        if (!ideaData) {
          ideaData = await generateCompleteIdea(); // This will return fallback
        }

        ideasToCreate.push({
          ...ideaData,
          submittedBy: user._id,
          isActive: true,
          swipeRightCount: 0,
          swipeLeftCount: 0,
        });

        // Add small delay to avoid rate limits
        if (gemini && i < 4) {
          await new Promise((resolve) => setTimeout(resolve, 2000)); // 2 second delay
        }
      }

      // Insert ideas
      const createdIdeas = await Idea.insertMany(ideasToCreate);
      totalIdeasCreated += createdIdeas.length;
      console.log(`  ✅ Created ${createdIdeas.length} ideas\n`);
    }

    console.log(
      `\n✨ Seeding complete! Created ${totalIdeasCreated} ideas for ${users.length} users.`
    );

    // Close connection
    await mongoose.connection.close();
    console.log("✅ Database connection closed");
    process.exit(0);
  } catch (error) {
    console.error("❌ Error seeding data:", error);
    await mongoose.connection.close();
    process.exit(1);
  }
}

seedData();
