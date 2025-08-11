/**
 * Send standardized success response
 * @param {Response} res - Express response object
 * @param {Object} data - Response data
 * @param {number} statusCode - HTTP status code
 */
const sendSuccessResponse = (res, data = {}, statusCode = 200) => {
  const response = {
    success: true,
    timestamp: new Date().toISOString(),
    ...data
  };

  return res.status(statusCode).json(response);
};

/**
 * Send standardized error response
 * @param {Response} res - Express response object
 * @param {string} message - Error message
 * @param {number} statusCode - HTTP status code
 * @param {Object} details - Additional error details
 */
const sendErrorResponse = (res, message, statusCode = 500, details = {}) => {
  const response = {
    success: false,
    error: {
      message,
      statusCode,
      timestamp: new Date().toISOString(),
      ...details
    }
  };

  return res.status(statusCode).json(response);
};

/**
 * Send paginated response with metadata
 * @param {Response} res - Express response object
 * @param {Object} data - Response data including items and pagination
 * @param {string} message - Success message
 * @param {number} statusCode - HTTP status code
 */
const sendPaginatedResponse = (res, data, message = 'Data retrieved successfully', statusCode = 200) => {
  const response = {
    success: true,
    message,
    timestamp: new Date().toISOString(),
    ...data // Should include 'data' array and 'pagination' object
  };

  return res.status(statusCode).json(response);
};

/**
 * Send created resource response
 * @param {Response} res - Express response object
 * @param {Object} resource - Created resource data
 * @param {string} message - Success message
 */
const sendCreatedResponse = (res, resource, message = 'Resource created successfully') => {
  return sendSuccessResponse(res, {
    message,
    data: resource
  }, 201);
};

/**
 * Send no content response
 * @param {Response} res - Express response object
 */
const sendNoContentResponse = (res) => {
  return res.status(204).send();
};

/**
 * Send validation error response
 * @param {Response} res - Express response object
 * @param {Array} errors - Validation errors array
 */
const sendValidationErrorResponse = (res, errors) => {
  return sendErrorResponse(res, 'Validation failed', 400, {
    errors: errors.map(error => ({
      field: error.path || error.param,
      message: error.msg,
      value: error.value
    }))
  });
};

/**
 * Send not found response
 * @param {Response} res - Express response object
 * @param {string} resource - Name of the resource that wasn't found
 */
const sendNotFoundResponse = (res, resource = 'Resource') => {
  return sendErrorResponse(res, `${resource} not found`, 404);
};

/**
 * Send unauthorized response
 * @param {Response} res - Express response object
 * @param {string} message - Custom unauthorized message
 */
const sendUnauthorizedResponse = (res, message = 'Unauthorized access') => {
  return sendErrorResponse(res, message, 401);
};

/**
 * Send forbidden response
 * @param {Response} res - Express response object
 * @param {string} message - Custom forbidden message
 */
const sendForbiddenResponse = (res, message = 'Access forbidden') => {
  return sendErrorResponse(res, message, 403);
};

/**
 * Send conflict response
 * @param {Response} res - Express response object
 * @param {string} message - Conflict message
 */
const sendConflictResponse = (res, message = 'Resource conflict') => {
  return sendErrorResponse(res, message, 409);
};

/**
 * Send rate limit exceeded response
 * @param {Response} res - Express response object
 * @param {Object} rateLimitInfo - Rate limit information
 */
const sendRateLimitResponse = (res, rateLimitInfo = {}) => {
  const message = 'Too many requests. Please try again later.';
  const details = {
    retryAfter: rateLimitInfo.retryAfter || null,
    limit: rateLimitInfo.limit || null,
    remaining: rateLimitInfo.remaining || 0,
    resetTime: rateLimitInfo.resetTime || null
  };

  return sendErrorResponse(res, message, 429, details);
};

/**
 * Format API response with consistent structure
 * @param {boolean} success - Whether the operation was successful
 * @param {string} message - Response message
 * @param {Object} data - Response data
 * @param {Object} meta - Additional metadata
 */
const formatApiResponse = (success, message, data = null, meta = {}) => {
  const response = {
    success,
    message,
    timestamp: new Date().toISOString(),
    ...meta
  };

  if (data !== null) {
    response.data = data;
  }

  return response;
};

/**
 * Extract error details from different error types
 * @param {Error} error - Error object
 */
const extractErrorDetails = (error) => {
  const details = {
    name: error.name,
    stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
  };

  // MongoDB/Mongoose specific errors
  if (error.name === 'ValidationError') {
    details.validationErrors = Object.values(error.errors).map(err => ({
      field: err.path,
      message: err.message,
      value: err.value
    }));
  }

  if (error.code === 11000) {
    details.duplicateField = Object.keys(error.keyPattern)[0];
    details.duplicateValue = error.keyValue;
  }

  return details;
};

module.exports = {
  sendSuccessResponse,
  sendErrorResponse,
  sendPaginatedResponse,
  sendCreatedResponse,
  sendNoContentResponse,
  sendValidationErrorResponse,
  sendNotFoundResponse,
  sendUnauthorizedResponse,
  sendForbiddenResponse,
  sendConflictResponse,
  sendRateLimitResponse,
  formatApiResponse,
  extractErrorDetails,
};