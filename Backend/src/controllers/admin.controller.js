const User = require('../models/user.model');
const Trip = require('../models/trip.model');
const Share = require('../models/share.model');
const { sendSuccessResponse, sendErrorResponse } = require('../utils/response');
const { asyncHandler } = require('../middlewares/error.middleware');
const { getPaginationData } = require('../utils/pagination');

/**
 * @desc    Get trips over time statistics
 * @route   GET /api/v1/admin/stats/trips-over-time
 * @access  Private (Admin only)
 */
const getTripsOverTime = asyncHandler(async (req, res) => {
  const { period = 'month', year = new Date().getFullYear() } = req.query;
  
  let groupBy;
  let dateFormat;
  
  switch (period) {
    case 'day':
      groupBy = { 
        year: { $year: '$createdAt' },
        month: { $month: '$createdAt' },
        day: { $dayOfMonth: '$createdAt' }
      };
      dateFormat = '%Y-%m-%d';
      break;
    case 'month':
      groupBy = { 
        year: { $year: '$createdAt' },
        month: { $month: '$createdAt' }
      };
      dateFormat = '%Y-%m';
      break;
    case 'year':
      groupBy = { 
        year: { $year: '$createdAt' }
      };
      dateFormat = '%Y';
      break;
    default:
      groupBy = { 
        year: { $year: '$createdAt' },
        month: { $month: '$createdAt' }
      };
      dateFormat = '%Y-%m';
  }

  const matchStage = period === 'year' ? {} : { 
    createdAt: {
      $gte: new Date(`${year}-01-01`),
      $lt: new Date(`${parseInt(year) + 1}-01-01`)
    }
  };

  const stats = await Trip.aggregate([
    { $match: matchStage },
    {
      $group: {
        _id: groupBy,
        count: { $sum: 1 },
        publicTrips: { $sum: { $cond: ['$isPublic', 1, 0] } },
        totalBudget: { $sum: '$budget.total' },
        avgBudget: { $avg: '$budget.total' },
      }
    },
    {
      $addFields: {
        period: {
          $dateFromParts: period === 'day' 
            ? { year: '$_id.year', month: '$_id.month', day: '$_id.day' }
            : period === 'month'
            ? { year: '$_id.year', month: '$_id.month' }
            : { year: '$_id.year' }
        }
      }
    },
    {
      $project: {
        _id: 0,
        period: { $dateToString: { format: dateFormat, date: '$period' } },
        count: 1,
        publicTrips: 1,
        privateTrips: { $subtract: ['$count', '$publicTrips'] },
        totalBudget: { $round: ['$totalBudget', 2] },
        avgBudget: { $round: ['$avgBudget', 2] },
      }
    },
    { $sort: { period: 1 } }
  ]);

  sendSuccessResponse(res, {
    message: 'Trips over time statistics retrieved successfully',
    stats,
    period,
    year: period === 'year' ? undefined : year,
  });
});

/**
 * @desc    Get popular cities statistics
 * @route   GET /api/v1/admin/stats/popular-cities
 * @access  Private (Admin only)
 */
const getPopularCities = asyncHandler(async (req, res) => {
  const { limit = 20 } = req.query;

  const stats = await Trip.aggregate([
    { $unwind: '$stops' },
    {
      $group: {
        _id: {
          city: '$stops.city',
          country: '$stops.country'
        },
        tripCount: { $sum: 1 },
        uniqueUsers: { $addToSet: '$ownerId' },
        avgBudgetForCity: { $avg: '$budget.total' },
        totalActivities: { $sum: { $size: '$stops.activities' } },
      }
    },
    {
      $project: {
        _id: 0,
        city: '$_id.city',
        country: '$_id.country',
        location: { $concat: ['$_id.city', ', ', '$_id.country'] },
        tripCount: 1,
        uniqueUsersCount: { $size: '$uniqueUsers' },
        avgBudget: { $round: ['$avgBudgetForCity', 2] },
        totalActivities: 1,
        avgActivitiesPerTrip: { 
          $round: [{ $divide: ['$totalActivities', '$tripCount'] }, 1] 
        },
      }
    },
    { $sort: { tripCount: -1 } },
    { $limit: parseInt(limit) }
  ]);

  sendSuccessResponse(res, {
    message: 'Popular cities statistics retrieved successfully',
    cities: stats,
  });
});

/**
 * @desc    Get all users (admin view)
 * @route   GET /api/v1/admin/users
 * @access  Private (Admin only)
 */
const getUsers = asyncHandler(async (req, res) => {
  const { page = 1, limit = 20, search, role, verified } = req.query;

  // Build filter
  const filter = {};
  
  if (search) {
    filter.$or = [
      { name: { $regex: search, $options: 'i' } },
      { email: { $regex: search, $options: 'i' } },
      { country: { $regex: search, $options: 'i' } },
      { city: { $regex: search, $options: 'i' } },
    ];
  }

  if (role) {
    filter.role = role;
  }

  if (verified !== undefined) {
    filter.isVerified = verified === 'true';
  }

  // Get paginated results
  const { data: users, pagination } = await getPaginationData(
    User,
    filter,
    {
      page: parseInt(page),
      limit: parseInt(limit),
      sort: { createdAt: -1 },
      select: '-passwordHash -refreshToken -verificationToken -passwordResetToken'
    }
  );

  // Get additional user stats
  const usersWithStats = await Promise.all(
    users.map(async (user) => {
      const tripCount = await Trip.countDocuments({ ownerId: user._id });
      const publicTripCount = await Trip.countDocuments({ ownerId: user._id, isPublic: true });
      const shareCount = await Share.countDocuments({ createdBy: user._id });
      
      return {
        ...user.toObject(),
        stats: {
          totalTrips: tripCount,
          publicTrips: publicTripCount,
          privateTrips: tripCount - publicTripCount,
          shareLinks: shareCount,
        }
      };
    })
  );

  sendSuccessResponse(res, {
    message: 'Users retrieved successfully',
    users: usersWithStats,
    pagination,
  });
});

/**
 * @desc    Update user role
 * @route   PUT /api/v1/admin/users/:id/role
 * @access  Private (Admin only)
 */
const updateUserRole = asyncHandler(async (req, res) => {
  const { id: userId } = req.params;
  const { role } = req.body;

  if (!['user', 'admin'].includes(role)) {
    return sendErrorResponse(res, 'Invalid role. Must be either "user" or "admin"', 400);
  }

  // Prevent self-demotion from admin
  if (userId === req.user._id.toString() && role === 'user') {
    return sendErrorResponse(res, 'You cannot demote yourself from admin', 400);
  }

  const user = await User.findById(userId);
  if (!user) {
    return sendErrorResponse(res, 'User not found', 404);
  }

  user.role = role;
  await user.save({ validateBeforeSave: false });

  sendSuccessResponse(res, {
    message: `User role updated to ${role} successfully`,
    user: {
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
    },
  });
});

/**
 * @desc    Get platform statistics
 * @route   GET /api/v1/admin/stats/platform
 * @access  Private (Admin only)
 */
const getPlatformStats = asyncHandler(async (req, res) => {
  const [
    totalUsers,
    verifiedUsers,
    totalTrips,
    publicTrips,
    totalShares,
    activeShares,
    avgTripsPerUser,
    topCountries,
  ] = await Promise.all([
    User.countDocuments(),
    User.countDocuments({ isVerified: true }),
    Trip.countDocuments(),
    Trip.countDocuments({ isPublic: true }),
    Share.countDocuments(),
    Share.countDocuments({ expiresAt: { $gt: new Date() } }),
    Trip.aggregate([
      { $group: { _id: null, avg: { $avg: { $sum: 1 } } } }
    ]).then(result => result[0]?.avg || 0),
    Trip.aggregate([
      { $unwind: '$stops' },
      { $group: { _id: '$stops.country', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 5 },
      { $project: { _id: 0, country: '$_id', tripCount: '$count' } }
    ]),
  ]);

  const stats = {
    users: {
      total: totalUsers,
      verified: verifiedUsers,
      unverified: totalUsers - verifiedUsers,
      verificationRate: totalUsers > 0 ? ((verifiedUsers / totalUsers) * 100).toFixed(1) : 0,
    },
    trips: {
      total: totalTrips,
      public: publicTrips,
      private: totalTrips - publicTrips,
      avgPerUser: parseFloat(avgTripsPerUser.toFixed(1)),
    },
    shares: {
      total: totalShares,
      active: activeShares,
      expired: totalShares - activeShares,
    },
    topCountries,
  };

  sendSuccessResponse(res, {
    message: 'Platform statistics retrieved successfully',
    stats,
  });
});

/**
 * @desc    Delete user account (admin)
 * @route   DELETE /api/v1/admin/users/:id
 * @access  Private (Admin only)
 */
const deleteUser = asyncHandler(async (req, res) => {
  const { id: userId } = req.params;

  // Prevent self-deletion
  if (userId === req.user._id.toString()) {
    return sendErrorResponse(res, 'You cannot delete your own account', 400);
  }

  const user = await User.findById(userId);
  if (!user) {
    return sendErrorResponse(res, 'User not found', 404);
  }

  // Delete user's trips and associated shares
  const userTrips = await Trip.find({ ownerId: userId });
  const tripIds = userTrips.map(trip => trip._id);
  
  await Promise.all([
    Trip.deleteMany({ ownerId: userId }),
    Share.deleteMany({ $or: [{ createdBy: userId }, { tripId: { $in: tripIds } }] }),
    User.findByIdAndDelete(userId),
  ]);

  sendSuccessResponse(res, {
    message: 'User account deleted successfully',
    deletedData: {
      trips: userTrips.length,
      shares: await Share.countDocuments({ $or: [{ createdBy: userId }, { tripId: { $in: tripIds } }] }),
    },
  });
});

module.exports = {
  getTripsOverTime,
  getPopularCities,
  getUsers,
  updateUserRole,
  getPlatformStats,
  deleteUser,
};