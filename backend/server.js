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

// Load environment variables from backend/.env
const envPath = join(__dirname, ".env");
console.log("🔍 Loading .env from:", envPath);

const result = dotenv.config({ path: envPath });
if (result.error) {
  console.error("❌ Error loading .env file:", result.error);
} else {
  console.log("✅ .env file loaded successfully");
  // Debug: Check if GEMINI_API_KEY is loaded
  if (process.env.GEMINI_API_KEY) {
    console.log("✅ GEMINI_API_KEY found in environment");
  } else {
    console.log("❌ GEMINI_API_KEY NOT found in environment");
  }
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

// Connect to MongoDB
mongoose
  .connect(MONGO_URI)
  .then(() => {
    console.log("✅ Connected to MongoDB");
  })
  .catch((error) => {
    console.error("❌ MongoDB connection error:", error);
  });

// Start server
server.listen(PORT, () => {
  console.log(`🚀 Foundrly backend running on http://localhost:${PORT}`);
});

export { io };
