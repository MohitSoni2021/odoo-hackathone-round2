const Trip = require('../models/trip.model');
const Share = require('../models/share.model');
const { sendSuccessResponse, sendErrorResponse } = require('../utils/response');
const { asyncHandler } = require('../middlewares/error.middleware');
const { getPaginationData } = require('../utils/pagination');

/**
 * @desc    Create share link for trip
 * @route   POST /api/v1/trips/:id/share
 * @access  Private
 */
const createShareLink = asyncHandler(async (req, res) => {
  const trip = req.resource; // Set by checkOwnership middleware
  const { expirationDays = 30 } = req.body;

  // Check if share already exists
  let share = await Share.findOne({ tripId: trip._id, createdBy: req.user._id });

  if (share && !share.isExpired) {
    // Return existing share
    return sendSuccessResponse(res, {
      message: 'Share link already exists',
      shareLink: `${process.env.APP_URL}/public/${share.publicId}`,
      publicId: share.publicId,
      expiresAt: share.expiresAt,
      viewCount: share.viewCount,
    });
  }

  // Create new share or update expired one
  if (share && share.isExpired) {
    // Update expired share
    const { nanoid } = require('nanoid');
    share.publicId = nanoid(12);
    share.expiresAt = new Date(Date.now() + expirationDays * 24 * 60 * 60 * 1000);
    share.viewCount = 0;
    share.lastViewedAt = undefined;
    await share.save();
  } else {
    // Create new share
    share = await Share.createShare(trip._id, req.user._id, expirationDays);
  }

  sendSuccessResponse(res, {
    message: 'Share link created successfully',
    shareLink: `${process.env.APP_URL}/public/${share.publicId}`,
    publicId: share.publicId,
    expiresAt: share.expiresAt,
    viewCount: share.viewCount,
  }, 201);
});

/**
 * @desc    Get shared trip by public ID
 * @route   GET /public/:publicId
 * @access  Public
 */
const getSharedTrip = asyncHandler(async (req, res) => {
  const { publicId } = req.params;

  // Find active share
  const share = await Share.findOne({
    publicId,
    expiresAt: { $gt: new Date() }
  }).populate({
    path: 'tripId',
    populate: {
      path: 'ownerId',
      select: 'name avatarUrl'
    }
  });

  if (!share) {
    return sendErrorResponse(res, 'Share link not found or expired', 404);
  }

  const trip = share.tripId;

  if (!trip) {
    return sendErrorResponse(res, 'Associated trip not found', 404);
  }

  // Increment view count
  await share.incrementView();

  // Create public trip data (remove sensitive information)
  const publicTrip = {
    id: trip._id,
    title: trip.title,
    description: trip.description,
    startDate: trip.startDate,
    endDate: trip.endDate,
    coverImage: trip.coverImage,
    stops: trip.stops,
    budget: trip.budget,
    durationDays: trip.durationDays,
    countriesCount: trip.countriesCount,
    citiesCount: trip.citiesCount,
    owner: {
      name: trip.ownerId.name,
      avatarUrl: trip.ownerId.avatarUrl,
    },
    sharedAt: share.createdAt,
    viewCount: share.viewCount,
  };

  sendSuccessResponse(res, {
    message: 'Shared trip retrieved successfully',
    trip: publicTrip,
  });
});

/**
 * @desc    Get all public trips
 * @route   GET /api/v1/public/trips
 * @access  Public
 */
const getPublicTrips = asyncHandler(async (req, res) => {
  const { page = 1, limit = 12, search, country, sortBy = 'createdAt', sortOrder = 'desc' } = req.query;

  // Build filter
  const filter = { isPublic: true };

  if (search) {
    filter.$or = [
      { title: { $regex: search, $options: 'i' } },
      { description: { $regex: search, $options: 'i' } },
      { 'stops.city': { $regex: search, $options: 'i' } },
      { 'stops.country': { $regex: search, $options: 'i' } },
    ];
  }

  if (country) {
    filter['stops.country'] = { $regex: country, $options: 'i' };
  }

  // Build sort object
  const sort = {};
  sort[sortBy] = sortOrder === 'desc' ? -1 : 1;

  // Get paginated results with owner information
  const { data: trips, pagination } = await getPaginationData(
    Trip,
    filter,
    {
      page: parseInt(page),
      limit: parseInt(limit),
      sort,
      populate: {
        path: 'ownerId',
        select: 'name avatarUrl country city'
      }
    }
  );

  // Transform data for public consumption
  const publicTrips = trips.map(trip => ({
    id: trip._id,
    title: trip.title,
    description: trip.description,
    startDate: trip.startDate,
    endDate: trip.endDate,
    coverImage: trip.coverImage,
    durationDays: trip.durationDays,
    countriesCount: trip.countriesCount,
    citiesCount: trip.citiesCount,
    stopsCount: trip.stops.length,
    // Sample stops for preview (first 3)
    sampleStops: trip.stops.slice(0, 3).map(stop => ({
      city: stop.city,
      country: stop.country,
      bannerImage: stop.bannerImage,
    })),
    owner: {
      name: trip.ownerId.name,
      avatarUrl: trip.ownerId.avatarUrl,
      location: trip.ownerId.fullLocation,
    },
    createdAt: trip.createdAt,
  }));

  sendSuccessResponse(res, {
    message: 'Public trips retrieved successfully',
    trips: publicTrips,
    pagination,
  });
});

/**
 * @desc    Get share statistics for user's trips
 * @route   GET /api/v1/users/me/shares
 * @access  Private
 */
const getUserShares = asyncHandler(async (req, res) => {
  const shares = await Share.find({ createdBy: req.user._id })
    .populate('tripId', 'title coverImage')
    .sort({ createdAt: -1 });

  const shareData = shares.map(share => ({
    id: share._id,
    publicId: share.publicId,
    shareLink: `${process.env.APP_URL}/public/${share.publicId}`,
    trip: {
      id: share.tripId._id,
      title: share.tripId.title,
      coverImage: share.tripId.coverImage,
    },
    viewCount: share.viewCount,
    lastViewedAt: share.lastViewedAt,
    createdAt: share.createdAt,
    expiresAt: share.expiresAt,
    isExpired: share.isExpired,
    daysUntilExpired: share.daysUntilExpired,
  }));

  sendSuccessResponse(res, {
    message: 'Share statistics retrieved successfully',
    shares: shareData,
  });
});

/**
 * @desc    Delete share link
 * @route   DELETE /api/v1/shares/:shareId
 * @access  Private
 */
const deleteShareLink = asyncHandler(async (req, res) => {
  const { shareId } = req.params;

  const share = await Share.findOne({ 
    _id: shareId, 
    createdBy: req.user._id 
  });

  if (!share) {
    return sendErrorResponse(res, 'Share link not found', 404);
  }

  await Share.findByIdAndDelete(shareId);

  sendSuccessResponse(res, {
    message: 'Share link deleted successfully',
  });
});

module.exports = {
  createShareLink,
  getSharedTrip,
  getPublicTrips,
  getUserShares,
  deleteShareLink,
};