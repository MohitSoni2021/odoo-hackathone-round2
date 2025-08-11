const { sendErrorResponse } = require('../utils/response');

/**
 * Middleware to check if user has required role
 * @param {string|Array} allowedRoles - Single role or array of allowed roles
 */
const requireRole = (allowedRoles) => {
  return (req, res, next) => {
    if (!req.user) {
      return sendErrorResponse(res, 'Authentication required', 401);
    }

    const roles = Array.isArray(allowedRoles) ? allowedRoles : [allowedRoles];
    
    if (!roles.includes(req.user.role)) {
      return sendErrorResponse(res, 'Access denied. Insufficient permissions', 403);
    }

    next();
  };
};

/**
 * Middleware to check if user is admin
 */
const requireAdmin = requireRole('admin');

/**
 * Middleware to check if user is admin or owns the resource
 */
const requireAdminOrOwner = (ownerIdField = 'ownerId') => {
  return (req, res, next) => {
    if (!req.user) {
      return sendErrorResponse(res, 'Authentication required', 401);
    }

    // If user is admin, allow access
    if (req.user.role === 'admin') {
      return next();
    }

    // Check if user owns the resource
    const resourceOwnerId = req.resource?.[ownerIdField] || req.params.userId;
    
    if (!resourceOwnerId) {
      return sendErrorResponse(res, 'Unable to verify resource ownership', 400);
    }

    if (resourceOwnerId.toString() !== req.user._id.toString()) {
      return sendErrorResponse(res, 'Access denied. You can only access your own resources', 403);
    }

    next();
  };
};

/**
 * Middleware to check if user can modify their own profile or admin can modify any profile
 */
const requireSelfOrAdmin = (req, res, next) => {
  if (!req.user) {
    return sendErrorResponse(res, 'Authentication required', 401);
  }

  const targetUserId = req.params.id || req.params.userId;

  // Admin can modify any user
  if (req.user.role === 'admin') {
    return next();
  }

  // User can only modify their own profile
  if (targetUserId && targetUserId !== req.user._id.toString()) {
    return sendErrorResponse(res, 'Access denied. You can only modify your own profile', 403);
  }

  next();
};

module.exports = {
  requireRole,
  requireAdmin,
  requireAdminOrOwner,
  requireSelfOrAdmin,
};