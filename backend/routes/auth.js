import express from "express";
import axios from "axios";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
import User from "../models/User.js";

const router = express.Router();

// Google OAuth - Initiate OAuth flow
router.get("/google", (req, res) => {
  const clientID = process.env.GOOGLE_CLIENT_ID;

  // Construct redirect URI - ensure BACKEND_URL has no trailing slash
  const backendUrl = (
    process.env.BACKEND_URL || "http://localhost:4000"
  ).replace(/\/$/, "");
  const redirectURI = `${backendUrl}/api/auth/google/callback`;

  if (!clientID || clientID === "mock") {
    return res.status(400).json({
      error:
        "Google OAuth not configured. Please set GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET in .env file.",
    });
  }

  // Log the redirect URI for debugging
  console.log("🔐 OAuth redirect URI:", redirectURI);
  console.log("🔐 BACKEND_URL from env:", process.env.BACKEND_URL);

  const authURL =
    `https://accounts.google.com/o/oauth2/v2/auth?` +
    `client_id=${clientID}&` +
    `redirect_uri=${encodeURIComponent(redirectURI)}&` +
    `response_type=code&` +
    `scope=email profile&` +
    `access_type=offline`;

  res.redirect(authURL);
});

router.get("/google/callback", async (req, res) => {
  try {
    const { code } = req.query;
    if (!code) {
      return res.redirect(
        `${process.env.FRONTEND_URL || "http://localhost:3000"}?error=no_code`
      );
    }

    const clientID = process.env.GOOGLE_CLIENT_ID;
    const clientSecret = process.env.GOOGLE_CLIENT_SECRET;

    // Construct redirect URI - ensure BACKEND_URL has no trailing slash
    const backendUrl = (
      process.env.BACKEND_URL || "http://localhost:4000"
    ).replace(/\/$/, "");
    const redirectURI = `${backendUrl}/api/auth/google/callback`;

    // Log for debugging
    console.log("🔐 Callback redirect URI:", redirectURI);

    if (
      !clientID ||
      !clientSecret ||
      clientID === "mock" ||
      clientSecret === "mock"
    ) {
      return res.redirect(
        `${
          process.env.FRONTEND_URL || "http://localhost:3000"
        }?error=oauth_not_configured`
      );
    }

    // Exchange code for tokens
    const tokenResponse = await axios.post(
      "https://oauth2.googleapis.com/token",
      {
        code,
        client_id: clientID,
        client_secret: clientSecret,
        redirect_uri: redirectURI,
        grant_type: "authorization_code",
      }
    );

    const { access_token } = tokenResponse.data;

    // Get user info from Google
    const userResponse = await axios.get(
      "https://www.googleapis.com/oauth2/v2/userinfo",
      {
        headers: {
          Authorization: `Bearer ${access_token}`,
        },
      }
    );

    const { email, name, picture, id } = userResponse.data;

    // Find or create user
    let user = await User.findOne({ email });
    if (!user) {
      user = await User.create({
        email,
        name: name || email.split("@")[0],
        avatar: picture || "",
        googleId: id,
      });
    } else {
      if (!user.googleId) {
        user.googleId = id;
      }
      if (name) user.name = name;
      if (picture) user.avatar = picture;
      await user.save();
    }

    // Generate JWT token
    const token = jwt.sign(
      { email: user.email, sub: user._id.toString() },
      process.env.JWT_SECRET || "changeme",
      { expiresIn: "7d" }
    );

    const frontendUrl = process.env.FRONTEND_URL || "http://localhost:3000";
    const redirectUrl = `${frontendUrl}/auth/callback?token=${encodeURIComponent(
      token
    )}`;
    res.redirect(redirectUrl);
  } catch (error) {
    console.error("❌ OAuth callback error:", error);
    console.error("❌ Error details:", {
      message: error.message,
      response: error.response?.data,
      status: error.response?.status,
      code: error.code,
      stack: error.stack,
    });

    const frontendUrl = process.env.FRONTEND_URL || "http://localhost:3000";
    const errorMessage =
      error.response?.data?.error || error.message || "login_failed";
    res.redirect(`${frontendUrl}?error=${encodeURIComponent(errorMessage)}`);
  }
});

// Register/Signup endpoint
router.post("/register", async (req, res) => {
  try {
    const { email, password, name } = req.body;

    // Validation
    if (!email || !password) {
      return res.status(400).json({ error: "Email and password are required" });
    }

    if (password.length < 6) {
      return res
        .status(400)
        .json({ error: "Password must be at least 6 characters" });
    }

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res
        .status(400)
        .json({ error: "User with this email already exists" });
    }

    // Hash password
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    // Create user
    const user = await User.create({
      email,
      password: hashedPassword,
      name: name || email.split("@")[0],
      avatar: "",
    });

    // Generate JWT token
    const token = jwt.sign(
      { email: user.email, sub: user._id.toString() },
      process.env.JWT_SECRET || "changeme",
      { expiresIn: "7d" }
    );

    // Remove password from response
    const userResponse = user.toObject();
    delete userResponse.password;

    res.status(201).json({ access_token: token, user: userResponse });
  } catch (error) {
    console.error("Register error:", error);
    if (error.code === 11000) {
      return res
        .status(400)
        .json({ error: "User with this email already exists" });
    }
    res.status(500).json({ error: "Registration failed" });
  }
});

// Login endpoint (email/password)
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    // Validation
    if (!email || !password) {
      return res.status(400).json({ error: "Email and password are required" });
    }

    // Find user with password field
    const user = await User.findOne({ email }).select("+password");
    if (!user) {
      return res.status(401).json({ error: "Invalid email or password" });
    }

    // Check if user has a password (not OAuth-only user)
    if (!user.password) {
      return res.status(401).json({
        error:
          "This account was created with OAuth. Please use Google to sign in.",
      });
    }

    // Verify password
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(401).json({ error: "Invalid email or password" });
    }

    // Generate JWT token
    const token = jwt.sign(
      { email: user.email, sub: user._id.toString() },
      process.env.JWT_SECRET || "changeme",
      { expiresIn: "7d" }
    );

    // Remove password from response
    const userResponse = user.toObject();
    delete userResponse.password;

    res.json({ access_token: token, user: userResponse });
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({ error: "Login failed" });
  }
});

// Mock login for local dev
router.post("/mock", async (req, res) => {
  try {
    const { email, name } = req.body;
    const userEmail = email || "test@foundrly.com";
    const userName = name || "Test User";

    let user = await User.findOne({ email: userEmail });

    if (!user) {
      user = await User.create({
        email: userEmail,
        name: userName,
        avatar: "",
      });
    }

    const token = jwt.sign(
      { email: user.email, sub: user._id.toString() },
      process.env.JWT_SECRET || "changeme",
      { expiresIn: "7d" }
    );

    res.json({ access_token: token, user });
  } catch (error) {
    console.error("Mock login error:", error);
    res.status(500).json({ error: "Login failed" });
  }
});

// Get current user
router.get("/me", async (req, res) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    const token = authHeader.split(" ")[1];
    const payload = jwt.verify(token, process.env.JWT_SECRET || "changeme");

    const user = await User.findById(payload.sub);
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }
    res.json(user);
  } catch (error) {
    console.error("Get me error:", error);
    res.status(500).json({ error: "Failed to get user" });
  }
});

export default router;
