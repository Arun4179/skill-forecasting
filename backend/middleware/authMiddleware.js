import jwt from "jsonwebtoken";
import User from "../models/User.js";

/**
 * Protect middleware
 * Verifies JWT token and attaches user to request
 */
export const protect = async (req, res, next) => {
  let token;

  try {
    // 1️⃣ Check Authorization header
    if (
      req.headers.authorization &&
      req.headers.authorization.startsWith("Bearer")
    ) {
      token = req.headers.authorization.split(" ")[1];
    }

    // 2️⃣ If no token
    if (!token) {
      return res.status(401).json({ error: "Not authorized, no token" });
    }

    // 3️⃣ Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // 4️⃣ Get user from DB (exclude password)
    const user = await User.findById(decoded.id).select("-password");

    if (!user) {
      return res.status(401).json({ error: "User not found" });
    }

    // 5️⃣ Attach user to request
    req.user = user;

    next();

  } catch (error) {
    console.error("Auth Middleware Error:", error);
    return res.status(401).json({ error: "Not authorized, invalid token" });
  }
};
