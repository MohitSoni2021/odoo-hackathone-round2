const jwt = require('jsonwebtoken');
const User = require('../models/user.model');
const { sendErrorResponse } = require('../utils/response');
const logger = require('../config/logger');

/**
 * Middleware to authenticate user using JWT token
 */
const authenticateToken = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

    if (!token) {
      return sendErrorResponse(res, 'Access token is required', 401);
    }

    // Verify the token
    const decoded = jwt.verify(token, process.env.JWT_ACCESS_SECRET);
    
    // Find the user
    const user = await User.findById(decoded.userId).select('-passwordHash -refreshToken');
    
    if (!user) {
      return sendErrorResponse(res, 'User not found or token is invalid', 401);
    }

    // Check if user is verified
    if (!user.isVerified) {
      return sendErrorResponse(res, 'Please verify your email before accessing this resource', 401);
    }

    // Attach user to request object
    req.user = user;
    next();
  } catch (error) {
    logger.error('Authentication error:', error);
    
    if (error.name === 'JsonWebTokenError') {
      return sendErrorResponse(res, 'Invalid token', 401);
    } else if (error.name === 'TokenExpiredError') {
      return sendErrorResponse(res, 'Token expired', 401);
    }
    
    return sendErrorResponse(res, 'Authentication failed', 401);
  }
};

/**
 * Optional authentication middleware - doesn't fail if no token provided
 */
const optionalAuth = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
      return next(); // Continue without setting req.user
    }

    const decoded = jwt.verify(token, process.env.JWT_ACCESS_SECRET);
    const user = await User.findById(decoded.userId).select('-passwordHash -refreshToken');
    
    if (user && user.isVerified) {
      req.user = user;
    }
    
    next();
  } catch (error) {
    // Log error but don't fail the request
    logger.warn('Optional authentication failed:', error.message);
    next();
  }
};

/**
 * Middleware to check if user owns the resource
 */
const checkOwnership = (resourceModel, resourceParam = 'id', ownerField = 'ownerId') => {
  return async (req, res, next) => {
    try {
      const resourceId = req.params[resourceParam];
      const resource = await resourceModel.findById(resourceId);

      if (!resource) {
        return sendErrorResponse(res, 'Resource not found', 404);
      }

      // Check if user owns the resource or is admin
      if (resource[ownerField].toString() !== req.user._id.toString() && req.user.role !== 'admin') {
        return sendErrorResponse(res, 'Access denied. You can only access your own resources', 403);
      }

      // Attach resource to request for use in controller
      req.resource = resource;
      next();
    } catch (error) {
      logger.error('Ownership check error:', error);
      return sendErrorResponse(res, 'Error checking resource ownership', 500);
    }
  };
};

/**
 * Middleware to verify refresh token from cookies
 */
const verifyRefreshToken = async (req, res, next) => {
  try {
    const refreshToken = req.cookies.refreshToken;

    if (!refreshToken) {
      return sendErrorResponse(res, 'Refresh token is required', 401);
    }

    // Verify the refresh token
    const decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET);
    
    // Find user and check if refresh token matches
    const user = await User.findById(decoded.userId).select('+refreshToken');
    
    if (!user || user.refreshToken !== refreshToken) {
      return sendErrorResponse(res, 'Invalid refresh token', 401);
    }

    req.user = user;
    next();
  } catch (error) {
    logger.error('Refresh token verification error:', error);
    
    if (error.name === 'JsonWebTokenError') {
      return sendErrorResponse(res, 'Invalid refresh token', 401);
    } else if (error.name === 'TokenExpiredError') {
      return sendErrorResponse(res, 'Refresh token expired', 401);
    }
    
    return sendErrorResponse(res, 'Refresh token verification failed', 401);
  }
};

module.exports = {
  authenticateToken,
  optionalAuth,
  checkOwnership,
  verifyRefreshToken,
};