const express = require('express');
const { validate } = require('../middlewares/validate.middleware');
const { authenticateToken } = require('../middlewares/auth.middleware');
const { requireAdmin } = require('../middlewares/role.middleware');
const { updateUserRoleValidation } = require('../utils/validators');
const {
  getTripsOverTime,
  getPopularCities,
  getUsers,
  updateUserRole,
  getPlatformStats,
  deleteUser,
} = require('../controllers/admin.controller');

const router = express.Router();

// All routes require authentication and admin role
router.use(authenticateToken);
router.use(requireAdmin);

// Statistics routes
router.get('/stats/trips-over-time', getTripsOverTime);
router.get('/stats/popular-cities', getPopularCities);
router.get('/stats/platform', getPlatformStats);

// User management routes
router.get('/users', getUsers);
router.put('/users/:id/role', validate(updateUserRoleValidation), updateUserRole);
router.delete('/users/:id', deleteUser);

module.exports = router;