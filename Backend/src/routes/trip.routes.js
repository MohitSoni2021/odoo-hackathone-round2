const express = require('express');
const { validate } = require('../middlewares/validate.middleware');
const { authenticateToken, checkOwnership } = require('../middlewares/auth.middleware');
const Trip = require('../models/trip.model');
const { 
  createTripValidation, 
  updateTripValidation, 
  updateBudgetValidation,
  addStopValidation,
  updateStopValidation,
  addActivityValidation,
  updateActivityValidation,
} = require('../utils/validators');
const {
  getTrips,
  createTrip,
  getTripById,
  updateTrip,
  deleteTrip,
  updateTripBudget,
  getTripSummary,
  addStop,
  updateStop,
  deleteStop,
  addActivity,
  updateActivity,
  deleteActivity,
} = require('../controllers/trip.controller');

const router = express.Router();

// All routes require authentication
router.use(authenticateToken);

// Trip routes
router.route('/')
  .get(getTrips)
  .post(validate(createTripValidation), createTrip);

router.route('/:id')
  .get(checkOwnership(Trip), getTripById)
  .put(checkOwnership(Trip), validate(updateTripValidation), updateTrip)
  .delete(checkOwnership(Trip), deleteTrip);

router.put('/:id/budget', checkOwnership(Trip), validate(updateBudgetValidation), updateTripBudget);
router.get('/:id/summary', checkOwnership(Trip), getTripSummary);

// Stop routes
router.post('/:tripId/stops', checkOwnership(Trip, 'tripId'), validate(addStopValidation), addStop);
router.put('/:tripId/stops/:stopId', checkOwnership(Trip, 'tripId'), validate(updateStopValidation), updateStop);
router.delete('/:tripId/stops/:stopId', checkOwnership(Trip, 'tripId'), deleteStop);

// Activity routes  
router.post('/:tripId/stops/:stopId/activities', checkOwnership(Trip, 'tripId'), validate(addActivityValidation), addActivity);
router.put('/:tripId/stops/:stopId/activities/:activityId', checkOwnership(Trip, 'tripId'), validate(updateActivityValidation), updateActivity);
router.delete('/:tripId/stops/:stopId/activities/:activityId', checkOwnership(Trip, 'tripId'), deleteActivity);

module.exports = router;