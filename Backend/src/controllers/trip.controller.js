const Trip = require('../models/trip.model');
const Share = require('../models/share.model');
const { sendSuccessResponse, sendErrorResponse } = require('../utils/response');
const { asyncHandler } = require('../middlewares/error.middleware');
const { getPaginationData } = require('../utils/pagination');
const { nanoid } = require('nanoid');
const logger = require('../config/logger');

/**
 * @desc    Get all trips for the current user
 * @route   GET /api/v1/trips
 * @access  Private
 */
const getTrips = asyncHandler(async (req, res) => {
  const { page = 1, limit = 10, sortBy = 'createdAt', sortOrder = 'desc', search } = req.query;
  
  // Build filter
  const filter = { ownerId: req.user._id };
  
  if (search) {
    filter.$or = [
      { title: { $regex: search, $options: 'i' } },
      { description: { $regex: search, $options: 'i' } },
      { 'stops.city': { $regex: search, $options: 'i' } },
      { 'stops.country': { $regex: search, $options: 'i' } },
    ];
  }

  // Build sort object
  const sort = {};
  sort[sortBy] = sortOrder === 'desc' ? -1 : 1;

  // Get paginated results
  const { data: trips, pagination } = await getPaginationData(
    Trip,
    filter,
    { page: parseInt(page), limit: parseInt(limit), sort }
  );

  sendSuccessResponse(res, {
    message: 'Trips retrieved successfully',
    trips,
    pagination,
  });
});

/**
 * @desc    Create a new trip
 * @route   POST /api/v1/trips
 * @access  Private
 */
const createTrip = asyncHandler(async (req, res) => {
  const { title, description, startDate, endDate, coverImage, isPublic } = req.body;

  const trip = await Trip.create({
    ownerId: req.user._id,
    title,
    description,
    startDate,
    endDate,
    coverImage,
    isPublic: isPublic || false,
  });

  await trip.populate('ownerId', 'name email avatarUrl');

  sendSuccessResponse(res, {
    message: 'Trip created successfully',
    trip,
  }, 201);
});

/**
 * @desc    Get single trip by ID
 * @route   GET /api/v1/trips/:id
 * @access  Private
 */
const getTripById = asyncHandler(async (req, res) => {
  const trip = req.resource; // Set by checkOwnership middleware

  await trip.populate('ownerId', 'name email avatarUrl');

  sendSuccessResponse(res, {
    message: 'Trip retrieved successfully',
    trip,
  });
});

/**
 * @desc    Update trip
 * @route   PUT /api/v1/trips/:id
 * @access  Private
 */
const updateTrip = asyncHandler(async (req, res) => {
  const trip = req.resource; // Set by checkOwnership middleware
  const { title, description, startDate, endDate, coverImage, isPublic } = req.body;

  // Update fields
  if (title !== undefined) trip.title = title;
  if (description !== undefined) trip.description = description;
  if (startDate !== undefined) trip.startDate = startDate;
  if (endDate !== undefined) trip.endDate = endDate;
  if (coverImage !== undefined) trip.coverImage = coverImage;
  if (isPublic !== undefined) trip.isPublic = isPublic;

  await trip.save();
  await trip.populate('ownerId', 'name email avatarUrl');

  sendSuccessResponse(res, {
    message: 'Trip updated successfully',
    trip,
  });
});

/**
 * @desc    Delete trip
 * @route   DELETE /api/v1/trips/:id
 * @access  Private
 */
const deleteTrip = asyncHandler(async (req, res) => {
  const trip = req.resource; // Set by checkOwnership middleware

  // Delete associated shares
  await Share.deleteMany({ tripId: trip._id });

  // Delete trip
  await Trip.findByIdAndDelete(trip._id);

  sendSuccessResponse(res, {
    message: 'Trip deleted successfully',
  });
});

/**
 * @desc    Update trip budget
 * @route   PUT /api/v1/trips/:id/budget
 * @access  Private
 */
const updateTripBudget = asyncHandler(async (req, res) => {
  const trip = req.resource; // Set by checkOwnership middleware
  const { total, transport, stay, activities, meals } = req.body;

  // Update budget fields
  if (total !== undefined) trip.budget.total = total;
  if (transport !== undefined) trip.budget.transport = transport;
  if (stay !== undefined) trip.budget.stay = stay;
  if (activities !== undefined) trip.budget.activities = activities;
  if (meals !== undefined) trip.budget.meals = meals;

  await trip.save();

  sendSuccessResponse(res, {
    message: 'Trip budget updated successfully',
    budget: trip.budget,
  });
});

/**
 * @desc    Get trip summary
 * @route   GET /api/v1/trips/:id/summary
 * @access  Private
 */
const getTripSummary = asyncHandler(async (req, res) => {
  const trip = req.resource; // Set by checkOwnership middleware

  const summary = trip.getSummary();

  sendSuccessResponse(res, {
    message: 'Trip summary retrieved successfully',
    summary,
  });
});

/**
 * @desc    Add stop to trip
 * @route   POST /api/v1/trips/:tripId/stops
 * @access  Private
 */
const addStop = asyncHandler(async (req, res) => {
  const trip = req.resource; // Set by checkOwnership middleware
  const { city, country, startDate, endDate, bannerImage } = req.body;

  const stopData = {
    city,
    country,
    startDate,
    endDate,
    bannerImage,
    activities: [],
  };

  trip.stops.push(stopData);
  await trip.save();

  const newStop = trip.stops[trip.stops.length - 1];

  sendSuccessResponse(res, {
    message: 'Stop added successfully',
    stop: newStop,
  }, 201);
});

/**
 * @desc    Update stop
 * @route   PUT /api/v1/trips/:tripId/stops/:stopId
 * @access  Private
 */
const updateStop = asyncHandler(async (req, res) => {
  const trip = req.resource; // Set by checkOwnership middleware
  const { stopId } = req.params;
  const { city, country, startDate, endDate, bannerImage } = req.body;

  const stop = trip.stops.id(stopId);
  if (!stop) {
    return sendErrorResponse(res, 'Stop not found', 404);
  }

  // Update stop fields
  if (city !== undefined) stop.city = city;
  if (country !== undefined) stop.country = country;
  if (startDate !== undefined) stop.startDate = startDate;
  if (endDate !== undefined) stop.endDate = endDate;
  if (bannerImage !== undefined) stop.bannerImage = bannerImage;

  await trip.save();

  sendSuccessResponse(res, {
    message: 'Stop updated successfully',
    stop,
  });
});

/**
 * @desc    Delete stop
 * @route   DELETE /api/v1/trips/:tripId/stops/:stopId
 * @access  Private
 */
const deleteStop = asyncHandler(async (req, res) => {
  const trip = req.resource; // Set by checkOwnership middleware
  const { stopId } = req.params;

  const stop = trip.stops.id(stopId);
  if (!stop) {
    return sendErrorResponse(res, 'Stop not found', 404);
  }

  stop.remove();
  await trip.save();

  sendSuccessResponse(res, {
    message: 'Stop deleted successfully',
  });
});

/**
 * @desc    Add activity to stop
 * @route   POST /api/v1/trips/:tripId/stops/:stopId/activities
 * @access  Private
 */
const addActivity = asyncHandler(async (req, res) => {
  const trip = req.resource; // Set by checkOwnership middleware
  const { stopId } = req.params;
  const { title, type, cost, duration, notes, providerUrl } = req.body;

  const stop = trip.stops.id(stopId);
  if (!stop) {
    return sendErrorResponse(res, 'Stop not found', 404);
  }

  const activityData = {
    title,
    type,
    cost: cost || 0,
    duration,
    notes,
    providerUrl,
  };

  stop.activities.push(activityData);
  await trip.save();

  const newActivity = stop.activities[stop.activities.length - 1];

  sendSuccessResponse(res, {
    message: 'Activity added successfully',
    activity: newActivity,
  }, 201);
});

/**
 * @desc    Update activity
 * @route   PUT /api/v1/trips/:tripId/stops/:stopId/activities/:activityId
 * @access  Private
 */
const updateActivity = asyncHandler(async (req, res) => {
  const trip = req.resource; // Set by checkOwnership middleware
  const { stopId, activityId } = req.params;
  const { title, type, cost, duration, notes, providerUrl } = req.body;

  const stop = trip.stops.id(stopId);
  if (!stop) {
    return sendErrorResponse(res, 'Stop not found', 404);
  }

  const activity = stop.activities.id(activityId);
  if (!activity) {
    return sendErrorResponse(res, 'Activity not found', 404);
  }

  // Update activity fields
  if (title !== undefined) activity.title = title;
  if (type !== undefined) activity.type = type;
  if (cost !== undefined) activity.cost = cost;
  if (duration !== undefined) activity.duration = duration;
  if (notes !== undefined) activity.notes = notes;
  if (providerUrl !== undefined) activity.providerUrl = providerUrl;

  await trip.save();

  sendSuccessResponse(res, {
    message: 'Activity updated successfully',
    activity,
  });
});

/**
 * @desc    Delete activity
 * @route   DELETE /api/v1/trips/:tripId/stops/:stopId/activities/:activityId
 * @access  Private
 */
const deleteActivity = asyncHandler(async (req, res) => {
  const trip = req.resource; // Set by checkOwnership middleware
  const { stopId, activityId } = req.params;

  const stop = trip.stops.id(stopId);
  if (!stop) {
    return sendErrorResponse(res, 'Stop not found', 404);
  }

  const activity = stop.activities.id(activityId);
  if (!activity) {
    return sendErrorResponse(res, 'Activity not found', 404);
  }

  activity.remove();
  await trip.save();

  sendSuccessResponse(res, {
    message: 'Activity deleted successfully',
  });
});

module.exports = {
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
};