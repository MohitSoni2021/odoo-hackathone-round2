const express = require('express');
const { validate } = require('../middlewares/validate.middleware');
const { authenticateToken, checkOwnership, optionalAuth } = require('../middlewares/auth.middleware');
const Trip = require('../models/trip.model');
const { createShareValidation } = require('../utils/validators');
const {
  createShareLink,
  getSharedTrip,
  getPublicTrips,
  getUserShares,
  deleteShareLink,
} = require('../controllers/public.controller');

const router = express.Router();

// Public routes (no authentication required)
router.get('/trips', getPublicTrips);
router.get('/:publicId', getSharedTrip);

// Protected routes for managing shares
router.post('/trips/:id/share', authenticateToken, checkOwnership(Trip), validate(createShareValidation), createShareLink);
router.get('/users/me/shares', authenticateToken, getUserShares);
router.delete('/shares/:shareId', authenticateToken, deleteShareLink);

module.exports = router;