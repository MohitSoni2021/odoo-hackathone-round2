const logger = require('../config/logger');
const { sendErrorResponse } = require('../utils/response');

/**
 * Global error handling middleware
 * This should be the last middleware in the app
 */
const errorHandler = (err, req, res, next) => {
  logger.error('Error occurred:', {
    error: err.message,
    stack: err.stack,
    url: req.url,
    method: req.method,
    ip: req.ip,
    userAgent: req.get('User-Agent'),
    userId: req.user?._id,
  });

  // Default error values
  let error = { ...err };
  error.message = err.message;

  // Mongoose bad ObjectId
  if (err.name === 'CastError') {
    const message = 'Resource not found';
    return sendErrorResponse(res, message, 404);
  }

  // Mongoose duplicate key
  if (err.code === 11000) {
    const field = Object.keys(err.keyValue)[0];
    const message = `${field.charAt(0).toUpperCase() + field.slice(1)} already exists`;
    return sendErrorResponse(res, message, 400);
  }

  // Mongoose validation error
  if (err.name === 'ValidationError') {
    const message = Object.values(err.errors)
      .map(val => val.message)
      .join(', ');
    return sendErrorResponse(res, message, 400);
  }

  // JWT errors
  if (err.name === 'JsonWebTokenError') {
    return sendErrorResponse(res, 'Invalid token', 401);
  }

  if (err.name === 'TokenExpiredError') {
    return sendErrorResponse(res, 'Token expired', 401);
  }

  // Multer errors
  if (err.code === 'LIMIT_FILE_SIZE') {
    return sendErrorResponse(res, 'File too large', 400);
  }

  if (err.code === 'LIMIT_UNEXPECTED_FILE') {
    return sendErrorResponse(res, 'Unexpected file field', 400);
  }

  // Default to 500 server error
  const statusCode = error.statusCode || 500;
  const message = error.statusCode ? error.message : 'Internal server error';

  return sendErrorResponse(res, message, statusCode);
};

/**
 * 404 error handler for undefined routes
 */
const notFound = (req, res) => {
  sendErrorResponse(res, `Route ${req.originalUrl} not found`, 404);
};

/**
 * Async error wrapper to catch async errors
 */
const asyncHandler = (fn) => {
  return (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
};

module.exports = {
  errorHandler,
  notFound,
  asyncHandler,
};