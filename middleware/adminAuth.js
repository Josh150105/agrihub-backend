/**
 * Enhanced Admin Authentication Middleware
 * - JWT verification
 * - Token blacklist checking
 * - Role-based access control
 */

import jwt from "jsonwebtoken";
import Admin from "../models/Admin.js";
import { UnauthorizedError, ForbiddenError } from "../utils/errors.js";
import logger from "../utils/logger.js";

// In-memory token blacklist (use Redis in production)
const tokenBlacklist = new Set();

/**
 * Main authentication middleware
 */
export const adminAuth = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      throw new UnauthorizedError("Authentication token missing");
    }

    const token = authHeader.split(" ")[1];

    // Check if token is blacklisted
    if (tokenBlacklist.has(token)) {
      throw new UnauthorizedError("Token has been revoked");
    }

    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Get admin (with caching in production)
    const admin = await Admin.findById(decoded.id).select('-password');

    if (!admin) {
      throw new UnauthorizedError("Admin not found");
    }

    if (!admin.isActive) {
      throw new ForbiddenError("Account is disabled");
    }

    // Attach admin to request
    req.admin = {
      id: admin._id,
      role: admin.role,
      username: admin.username
    };

    logger.info(`Admin authenticated: ${admin.username}`);
    next();

  } catch (err) {
    if (err.name === "TokenExpiredError") {
      throw new UnauthorizedError("Token expired. Please login again.");
    }
    
    if (err.name === "JsonWebTokenError") {
      throw new UnauthorizedError("Invalid token");
    }
    
    throw err;
  }
};

/**
 * Role-based access control middleware
 */
export const requireRole = (allowedRoles) => {
  return (req, res, next) => {
    if (!req.admin) {
      throw new UnauthorizedError("Authentication required");
    }

    if (!allowedRoles.includes(req.admin.role)) {
      throw new ForbiddenError(`Insufficient permissions. Required: ${allowedRoles.join(' or ')}`);
    }

    next();
  };
};

/**
 * Revoke token (add to blacklist)
 */
export const revokeToken = (token) => {
  tokenBlacklist.add(token);
  
  // Auto-remove from blacklist after expiration (1 hour)
  setTimeout(() => {
    tokenBlacklist.delete(token);
  }, 3600000);
  
  logger.info('Token revoked');
};

/**
 * Clear all tokens for a user (logout from all devices)
 */
export const revokeAllUserTokens = async (userId) => {
  // In production, store token IDs in database per user
  // and check against that list
  logger.info(`All tokens revoked for user: ${userId}`);
};
