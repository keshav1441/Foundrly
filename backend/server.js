import express from "express";
import http from "http";
import { Server } from "socket.io";
import mongoose from "mongoose";
import helmet from "helmet";
import cors from "cors";
import dotenv from "dotenv";
import { fileURLToPath } from "url";
import { dirname, join } from "path";

// Get the directory of the current module
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load environment variables from backend/.env (if file exists)
// On production platforms like Render, env vars are set directly, so .env file is optional
const envPath = join(__dirname, ".env");
const result = dotenv.config({ path: envPath });

if (result.error) {
  // Only log error if it's not a "file not found" error (ENOENT)
  // This is expected on production platforms where env vars are set directly
  if (result.error.code !== "ENOENT") {
    console.error("❌ Error loading .env file:", result.error);
  } else {
    console.log(
      "ℹ️  No .env file found - using environment variables directly (expected in production)"
    );
  }
} else {
  console.log("✅ .env file loaded successfully");
}

// Debug: Check if GEMINI_API_KEY is loaded (from .env or environment)
if (process.env.GEMINI_API_KEY) {
  console.log("✅ GEMINI_API_KEY found in environment");
} else {
  console.log("ℹ️  GEMINI_API_KEY not found (optional for AI features)");
}

// Import routes
import authRoutes from "./routes/auth.js";
import userRoutes from "./routes/users.js";
import ideaRoutes from "./routes/ideas.js";
import matchRoutes from "./routes/matches.js";
import aiRoutes from "./routes/ai.js";
import chatRoutes from "./routes/chat.js";
import requestRoutes from "./routes/requests.js";
import notificationRoutes from "./routes/notifications.js";

// Import Socket.io setup
import { setupSocketIO } from "./socket/chat.js";

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: process.env.FRONTEND_URL || "http://localhost:3000",
    credentials: true,
  },
});

const PORT = process.env.PORT || 4000;
const MONGO_URI = process.env.MONGO_URI || "mongodb://localhost:27017/foundrly";

// Middleware
app.use(helmet());
app.use(
  cors({
    origin: process.env.FRONTEND_URL || "http://localhost:3000",
    credentials: true,
  })
);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Middleware to check database connection for database-dependent routes
app.use("/api", (req, res, next) => {
  // Skip database check for health check endpoints
  if (req.path === "/health" || req.path === "/status") {
    return next();
  }

  // Check if MongoDB is connected
  if (mongoose.connection.readyState !== 1) {
    console.error(
      `❌ Database not connected. ReadyState: ${mongoose.connection.readyState}`
    );
    return res.status(503).json({
      error:
        "Service temporarily unavailable. Database connection not established.",
    });
  }

  next();
});

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/ideas", ideaRoutes);
app.use("/api/match", matchRoutes);
app.use("/api/ai", aiRoutes);
app.use("/api/chat", chatRoutes);
app.use("/api/requests", requestRoutes);
app.use("/api/notifications", notificationRoutes);

// Setup Socket.io
setupSocketIO(io);

// Set io instance for routes (after io is created)
// Use dynamic import to avoid circular dependency
import("./routes/matches.js").then((module) => {
  module.setIO(io);
});
import("./routes/chat.js").then((module) => {
  module.setIO(io);
});
import("./routes/requests.js").then((module) => {
  module.setIO(io);
});

// Connect to MongoDB with better error handling
mongoose
  .connect(MONGO_URI, {
    serverSelectionTimeoutMS: 5000, // Timeout after 5s instead of 30s
    socketTimeoutMS: 45000, // Close sockets after 45s of inactivity
  })
  .then(() => {
    console.log("✅ Connected to MongoDB");
    console.log(
      `📊 MongoDB connection state: ${mongoose.connection.readyState}`
    );
  })
  .catch((error) => {
    console.error("❌ MongoDB connection error:", error);
    console.error("❌ Error details:", {
      message: error.message,
      name: error.name,
      code: error.code,
    });
  });

// Handle connection events
mongoose.connection.on("error", (error) => {
  console.error("❌ MongoDB connection error:", error);
});

mongoose.connection.on("disconnected", () => {
  console.warn("⚠️  MongoDB disconnected");
});

mongoose.connection.on("reconnected", () => {
  console.log("✅ MongoDB reconnected");
});

// Start server
server.listen(PORT, () => {
  console.log(`🚀 Foundrly backend running on http://localhost:${PORT}`);
});

export { io };
