const jwt = require("jsonwebtoken");
const logger = require("../config/logger");

const isAuthenticated = (req, res, next) => {
  const authHeader = req.headers["authorization"];

  const token = authHeader && authHeader.split(" ")[1];

  if (!token) {
    logger.warn("Unauthorized access attempt: No token provided", {
      context: "AuthMiddleware",
      ip: req.ip,
      method: req.method,
    });
    return res.status(401).json({ error: "Unauthorized" });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch (error) {
    logger.error("Invalid token", {
      context: "AuthMiddleware",
      ip: req.ip,
      method: req.method,
      error: error.message,
    });
    return res.status(401).json({ error: "Invalid token" });
  }
};

const isAdmin = (req, res, next) => {
  if (!req.user || req.user.role !== "admin") {
    logger.warn("Forbidden access attempt: Not an admin", {
      context: "AuthMiddleware",
      ip: req.ip,
      method: req.method,
      user: req.user,
    });
    return res
      .status(403)
      .json({ error: "Access denied: Admin privileges required" });
  }
  next();
};

module.exports = { isAuthenticated, isAdmin };
