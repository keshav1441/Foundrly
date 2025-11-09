import mongoose from "mongoose";
import dotenv from "dotenv";
import { fileURLToPath } from "url";
import { dirname, join } from "path";

// Get the directory of the current module
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load environment variables
const envPath = join(__dirname, "..", ".env");
dotenv.config({ path: envPath });

// Import models
import Idea from "../models/Idea.js";
import Match from "../models/Match.js";
import Swipe from "../models/Swipe.js";
import Message from "../models/Message.js";
import Request from "../models/Request.js";

const MONGO_URI = process.env.MONGO_URI || "mongodb://localhost:27017/foundrly";

async function clearData() {
  try {
    // Connect to MongoDB
    await mongoose.connect(MONGO_URI);
    console.log("✅ Connected to MongoDB");

    // Delete all documents
    console.log("\n🗑️  Clearing data...\n");

    // Delete messages first (they reference matches)
    const messagesDeleted = await Message.deleteMany({});
    console.log(`✅ Deleted ${messagesDeleted.deletedCount} messages`);

    // Delete requests (they reference ideas and users)
    const requestsDeleted = await Request.deleteMany({});
    console.log(`✅ Deleted ${requestsDeleted.deletedCount} requests`);

    // Delete matches (they reference users and ideas)
    const matchesDeleted = await Match.deleteMany({});
    console.log(`✅ Deleted ${matchesDeleted.deletedCount} matches`);

    // Delete swipes (they reference users and ideas)
    const swipesDeleted = await Swipe.deleteMany({});
    console.log(`✅ Deleted ${swipesDeleted.deletedCount} swipes`);

    // Delete ideas (they reference users)
    const ideasDeleted = await Idea.deleteMany({});
    console.log(`✅ Deleted ${ideasDeleted.deletedCount} ideas`);

    // Note: Notifications are derived from requests and messages,
    // so clearing those will effectively clear all notifications

    console.log("\n✨ All data cleared successfully!");

    // Close connection
    await mongoose.connection.close();
    console.log("✅ Database connection closed");
    process.exit(0);
  } catch (error) {
    console.error("❌ Error clearing data:", error);
    process.exit(1);
  }
}

clearData();
