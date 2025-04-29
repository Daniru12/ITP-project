import jwt from "jsonwebtoken";
import User from "../models/User.js";

const protect = async (req, res, next) => {
  let token;

  // Check if token exists in headers
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer")
  ) {
    try {
      // Get token from header
      token = req.headers.authorization.split(" ")[1];

      // Verify token
      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      // Get user from database to ensure we have the most up-to-date information
      const user = await User.findById(decoded._id).select("-password");

      if (!user) {
        res.status(401).json({ message: "User not found" });
        return;
      }

      // Add user info to request
      req.user = user;
      next();
    } catch (error) {
      console.error("Auth error:", error);
      res.status(401).json({ message: "Not authorized" });
    }
  } else if (!token) {
    res.status(401).json({ message: "No token provided" });
  }
};
export { protect };

