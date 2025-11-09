import jwt from "jsonwebtoken";
import User from "../models/User.js";

export const authenticateJWT = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    const token = authHeader.split(" ")[1];
    const payload = jwt.verify(token, process.env.JWT_SECRET || "changeme");

    const user = await User.findById(payload.sub);
    if (!user) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    req.user = { sub: user._id.toString(), email: user.email };
    next();
  } catch (error) {
    return res.status(401).json({ error: "Unauthorized" });
  }
};

export const requireAuth = authenticateJWT;

// Optional authentication - doesn't fail if no token, but sets req.user if token is valid
export const optionalAuth = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return next();
    }

    const token = authHeader.split(" ")[1];
    const payload = jwt.verify(token, process.env.JWT_SECRET || "changeme");

    const user = await User.findById(payload.sub);
    if (user) {
      req.user = { sub: user._id.toString(), email: user.email };
    }
    next();
  } catch (error) {
    // If token is invalid, just continue without setting req.user
    next();
  }
};
