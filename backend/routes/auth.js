import express from "express";
import axios from "axios";
import jwt from "jsonwebtoken";
import User from "../models/User.js";

const router = express.Router();

// Google OAuth - Initiate OAuth flow
router.get("/google", (req, res) => {
  const clientID = process.env.GOOGLE_CLIENT_ID;
  const redirectURI = `${
    process.env.BACKEND_URL || "http://localhost:4000"
  }/api/auth/google/callback`;

  if (!clientID || clientID === "mock") {
    return res
      .status(400)
      .json({
        error:
          "Google OAuth not configured. Please set GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET in .env file.",
      });
  }

  // Ensure no trailing slash
  const cleanRedirectURI = redirectURI.replace(/\/$/, "");

  const authURL =
    `https://accounts.google.com/o/oauth2/v2/auth?` +
    `client_id=${clientID}&` +
    `redirect_uri=${encodeURIComponent(cleanRedirectURI)}&` +
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
    const redirectURI = `${
      process.env.BACKEND_URL || "http://localhost:4000"
    }/api/auth/google/callback`;

    // Ensure no trailing slash
    const cleanRedirectURI = redirectURI.replace(/\/$/, "");

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
        redirect_uri: cleanRedirectURI,
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
    const frontendUrl = process.env.FRONTEND_URL || "http://localhost:3000";
    res.redirect(`${frontendUrl}?error=login_failed`);
  }
});

// GitHub OAuth
router.get("/github", (req, res) => {
  const clientID = process.env.GITHUB_CLIENT_ID;
  const redirectURI = `${
    process.env.BACKEND_URL || "http://localhost:4000"
  }/auth/github/callback`;

  if (!clientID || clientID === "mock") {
    return res.status(400).json({ error: "GitHub OAuth not configured" });
  }

  const authURL =
    `https://github.com/login/oauth/authorize?` +
    `client_id=${clientID}&` +
    `redirect_uri=${encodeURIComponent(redirectURI)}&` +
    `scope=user:email`;

  console.log("GitHub OAuth - Redirecting to:", authURL);
  res.redirect(authURL);
});

router.get("/github/callback", async (req, res) => {
  try {
    const { code } = req.query;
    if (!code) {
      return res.redirect(
        `${process.env.FRONTEND_URL || "http://localhost:3000"}?error=no_code`
      );
    }

    const clientID = process.env.GITHUB_CLIENT_ID;
    const clientSecret = process.env.GITHUB_CLIENT_SECRET;
    const redirectURI = `${
      process.env.BACKEND_URL || "http://localhost:4000"
    }/api/auth/github/callback`;

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

    // Exchange code for access token
    const tokenResponse = await axios.post(
      "https://github.com/login/oauth/access_token",
      {
        client_id: clientID,
        client_secret: clientSecret,
        code,
        redirect_uri: redirectURI,
      },
      {
        headers: {
          Accept: "application/json",
        },
      }
    );

    const { access_token } = tokenResponse.data;

    // Get user info from GitHub
    const userResponse = await axios.get("https://api.github.com/user", {
      headers: {
        Authorization: `Bearer ${access_token}`,
      },
    });

    // Get user email
    const emailResponse = await axios.get(
      "https://api.github.com/user/emails",
      {
        headers: {
          Authorization: `Bearer ${access_token}`,
        },
      }
    );

    const primaryEmail =
      emailResponse.data.find((e) => e.primary) || emailResponse.data[0];
    const email =
      primaryEmail?.email || userResponse.data.login + "@github.local";
    const { login, name, avatar_url, id } = userResponse.data;

    // Find or create user
    let user = await User.findOne({ email });
    if (!user) {
      user = await User.create({
        email,
        name: name || login,
        avatar: avatar_url || "",
        githubId: id.toString(),
      });
    } else {
      if (!user.githubId) {
        user.githubId = id.toString();
      }
      if (name || login) user.name = name || login;
      if (avatar_url) user.avatar = avatar_url;
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
    console.error("GitHub OAuth callback error:", error);
    const frontendUrl = process.env.FRONTEND_URL || "http://localhost:3000";
    res.redirect(`${frontendUrl}?error=login_failed`);
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
