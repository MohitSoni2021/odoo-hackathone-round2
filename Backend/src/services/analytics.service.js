const Trip = require('../models/trip.model');
const User = require('../models/user.model');
const Share = require('../models/share.model');
const logger = require('../config/logger');

/**
 * Get user analytics for dashboard
 */
const getUserAnalytics = async (userId) => {
  try {
    const [
      tripsOverTime,
      budgetAnalysis,
      topDestinations,
      activityBreakdown
    ] = await Promise.all([
      getUserTripsOverTime(userId),
      getUserBudgetAnalysis(userId),
      getUserTopDestinations(userId),
      getUserActivityBreakdown(userId)
    ]);

    return {
      tripsOverTime,
      budgetAnalysis,
      topDestinations,
      activityBreakdown
    };
  } catch (error) {
    logger.error('Error getting user analytics:', error);
    throw error;
  }
};

/**
 * Get user's trips created over time
 */
const getUserTripsOverTime = async (userId) => {
  try {
    const result = await Trip.aggregate([
      { $match: { ownerId: userId } },
      {
        $group: {
          _id: {
            year: { $year: '$createdAt' },
            month: { $month: '$createdAt' }
          },
          count: { $sum: 1 },
          totalBudget: { $sum: '$budget.total' }
        }
      },
      {
        $project: {
          _id: 0,
          period: {
            $dateFromParts: {
              year: '$_id.year',
              month: '$_id.month'
            }
          },
          tripCount: '$count',
          totalBudget: { $round: ['$totalBudget', 2] }
        }
      },
      { $sort: { period: 1 } }
    ]);

    return result;
  } catch (error) {
    logger.error('Error getting user trips over time:', error);
    throw error;
  }
};

/**
 * Get user's budget analysis
 */
const getUserBudgetAnalysis = async (userId) => {
  try {
    const result = await Trip.aggregate([
      { $match: { ownerId: userId } },
      {
        $group: {
          _id: null,
          totalBudget: { $sum: '$budget.total' },
          totalTransport: { $sum: '$budget.transport' },
          totalStay: { $sum: '$budget.stay' },
          totalActivities: { $sum: '$budget.activities' },
          totalMeals: { $sum: '$budget.meals' },
          avgTripBudget: { $avg: '$budget.total' },
          tripCount: { $sum: 1 }
        }
      },
      {
        $project: {
          _id: 0,
          totalBudget: { $round: ['$totalBudget', 2] },
          breakdown: {
            transport: { $round: ['$totalTransport', 2] },
            stay: { $round: ['$totalStay', 2] },
            activities: { $round: ['$totalActivities', 2] },
            meals: { $round: ['$totalMeals', 2] }
          },
          avgTripBudget: { $round: ['$avgTripBudget', 2] },
          tripCount: 1
        }
      }
    ]);

    return result[0] || {
      totalBudget: 0,
      breakdown: { transport: 0, stay: 0, activities: 0, meals: 0 },
      avgTripBudget: 0,
      tripCount: 0
    };
  } catch (error) {
    logger.error('Error getting user budget analysis:', error);
    throw error;
  }
};

/**
 * Get user's top destinations
 */
const getUserTopDestinations = async (userId) => {
  try {
    const result = await Trip.aggregate([
      { $match: { ownerId: userId } },
      { $unwind: '$stops' },
      {
        $group: {
          _id: {
            city: '$stops.city',
            country: '$stops.country'
          },
          visitCount: { $sum: 1 },
          totalDays: {
            $sum: {
              $divide: [
                { $subtract: ['$stops.endDate', '$stops.startDate'] },
                1000 * 60 * 60 * 24
              ]
            }
          },
          totalActivities: { $sum: { $size: '$stops.activities' } },
          sampleImage: { $first: '$stops.bannerImage' }
        }
      },
      {
        $project: {
          _id: 0,
          city: '$_id.city',
          country: '$_id.country',
          fullName: { $concat: ['$_id.city', ', ', '$_id.country'] },
          visitCount: 1,
          totalDays: { $round: ['$totalDays', 1] },
          totalActivities: 1,
          sampleImage: 1
        }
      },
      { $sort: { visitCount: -1, totalDays: -1 } },
      { $limit: 10 }
    ]);

    return result;
  } catch (error) {
    logger.error('Error getting user top destinations:', error);
    throw error;
  }
};

/**
 * Get user's activity breakdown
 */
const getUserActivityBreakdown = async (userId) => {
  try {
    const result = await Trip.aggregate([
      { $match: { ownerId: userId } },
      { $unwind: '$stops' },
      { $unwind: '$stops.activities' },
      {
        $group: {
          _id: '$stops.activities.type',
          count: { $sum: 1 },
          totalCost: { $sum: '$stops.activities.cost' },
          avgCost: { $avg: '$stops.activities.cost' }
        }
      },
      {
        $project: {
          _id: 0,
          type: '$_id',
          count: 1,
          totalCost: { $round: ['$totalCost', 2] },
          avgCost: { $round: ['$avgCost', 2] }
        }
      },
      { $sort: { count: -1 } }
    ]);

    return result;
  } catch (error) {
    logger.error('Error getting user activity breakdown:', error);
    throw error;
  }
};

/**
 * Get platform-wide analytics for admin
 */
const getPlatformAnalytics = async (timeframe = 'month') => {
  try {
    const [
      userGrowth,
      tripCreationTrends,
      popularDestinations,
      budgetTrends,
      activityPopularity
    ] = await Promise.all([
      getUserGrowth(timeframe),
      getTripCreationTrends(timeframe),
      getGlobalPopularDestinations(),
      getBudgetTrends(timeframe),
      getActivityPopularity()
    ]);

    return {
      userGrowth,
      tripCreationTrends,
      popularDestinations,
      budgetTrends,
      activityPopularity
    };
  } catch (error) {
    logger.error('Error getting platform analytics:', error);
    throw error;
  }
};

/**
 * Get user growth over time
 */
const getUserGrowth = async (timeframe) => {
  try {
    let groupBy;
    switch (timeframe) {
      case 'day':
        groupBy = {
          year: { $year: '$createdAt' },
          month: { $month: '$createdAt' },
          day: { $dayOfMonth: '$createdAt' }
        };
        break;
      case 'year':
        groupBy = { year: { $year: '$createdAt' } };
        break;
      default: // month
        groupBy = {
          year: { $year: '$createdAt' },
          month: { $month: '$createdAt' }
        };
    }

    const result = await User.aggregate([
      {
        $group: {
          _id: groupBy,
          newUsers: { $sum: 1 },
          verifiedUsers: { $sum: { $cond: ['$isVerified', 1, 0] } }
        }
      },
      {
        $project: {
          _id: 0,
          period: '$_id',
          newUsers: 1,
          verifiedUsers: 1,
          unverifiedUsers: { $subtract: ['$newUsers', '$verifiedUsers'] }
        }
      },
      { $sort: { period: 1 } }
    ]);

    return result;
  } catch (error) {
    logger.error('Error getting user growth:', error);
    throw error;
  }
};

/**
 * Get trip creation trends
 */
const getTripCreationTrends = async (timeframe) => {
  try {
    let groupBy;
    switch (timeframe) {
      case 'day':
        groupBy = {
          year: { $year: '$createdAt' },
          month: { $month: '$createdAt' },
          day: { $dayOfMonth: '$createdAt' }
        };
        break;
      case 'year':
        groupBy = { year: { $year: '$createdAt' } };
        break;
      default: // month
        groupBy = {
          year: { $year: '$createdAt' },
          month: { $month: '$createdAt' }
        };
    }

    const result = await Trip.aggregate([
      {
        $group: {
          _id: groupBy,
          totalTrips: { $sum: 1 },
          publicTrips: { $sum: { $cond: ['$isPublic', 1, 0] } },
          avgBudget: { $avg: '$budget.total' },
          totalBudget: { $sum: '$budget.total' }
        }
      },
      {
        $project: {
          _id: 0,
          period: '$_id',
          totalTrips: 1,
          publicTrips: 1,
          privateTrips: { $subtract: ['$totalTrips', '$publicTrips'] },
          avgBudget: { $round: ['$avgBudget', 2] },
          totalBudget: { $round: ['$totalBudget', 2] }
        }
      },
      { $sort: { period: 1 } }
    ]);

    return result;
  } catch (error) {
    logger.error('Error getting trip creation trends:', error);
    throw error;
  }
};

/**
 * Get global popular destinations
 */
const getGlobalPopularDestinations = async (limit = 20) => {
  try {
    const result = await Trip.aggregate([
      { $unwind: '$stops' },
      {
        $group: {
          _id: {
            city: '$stops.city',
            country: '$stops.country'
          },
          tripCount: { $sum: 1 },
          uniqueUsers: { $addToSet: '$ownerId' },
          avgStayDuration: {
            $avg: {
              $divide: [
                { $subtract: ['$stops.endDate', '$stops.startDate'] },
                1000 * 60 * 60 * 24
              ]
            }
          },
          totalActivities: { $sum: { $size: '$stops.activities' } },
          avgBudgetForLocation: { $avg: '$budget.total' }
        }
      },
      {
        $project: {
          _id: 0,
          city: '$_id.city',
          country: '$_id.country',
          fullName: { $concat: ['$_id.city', ', ', '$_id.country'] },
          tripCount: 1,
          uniqueUsers: { $size: '$uniqueUsers' },
          avgStayDuration: { $round: ['$avgStayDuration', 1] },
          totalActivities: 1,
          avgActivitiesPerTrip: { 
            $round: [{ $divide: ['$totalActivities', '$tripCount'] }, 1] 
          },
          avgBudget: { $round: ['$avgBudgetForLocation', 2] }
        }
      },
      { $sort: { tripCount: -1, uniqueUsers: -1 } },
      { $limit: limit }
    ]);

    return result;
  } catch (error) {
    logger.error('Error getting global popular destinations:', error);
    throw error;
  }
};

/**
 * Get budget trends over time
 */
const getBudgetTrends = async (timeframe) => {
  try {
    let groupBy;
    switch (timeframe) {
      case 'day':
        groupBy = {
          year: { $year: '$createdAt' },
          month: { $month: '$createdAt' },
          day: { $dayOfMonth: '$createdAt' }
        };
        break;
      case 'year':
        groupBy = { year: { $year: '$createdAt' } };
        break;
      default: // month
        groupBy = {
          year: { $year: '$createdAt' },
          month: { $month: '$createdAt' }
        };
    }

    const result = await Trip.aggregate([
      {
        $group: {
          _id: groupBy,
          avgTotalBudget: { $avg: '$budget.total' },
          avgTransportBudget: { $avg: '$budget.transport' },
          avgStayBudget: { $avg: '$budget.stay' },
          avgActivitiesBudget: { $avg: '$budget.activities' },
          avgMealsBudget: { $avg: '$budget.meals' },
          tripCount: { $sum: 1 }
        }
      },
      {
        $project: {
          _id: 0,
          period: '$_id',
          avgBudgets: {
            total: { $round: ['$avgTotalBudget', 2] },
            transport: { $round: ['$avgTransportBudget', 2] },
            stay: { $round: ['$avgStayBudget', 2] },
            activities: { $round: ['$avgActivitiesBudget', 2] },
            meals: { $round: ['$avgMealsBudget', 2] }
          },
          tripCount: 1
        }
      },
      { $sort: { period: 1 } }
    ]);

    return result;
  } catch (error) {
    logger.error('Error getting budget trends:', error);
    throw error;
  }
};

/**
 * Get activity popularity across platform
 */
const getActivityPopularity = async () => {
  try {
    const result = await Trip.aggregate([
      { $unwind: '$stops' },
      { $unwind: '$stops.activities' },
      {
        $group: {
          _id: '$stops.activities.type',
          count: { $sum: 1 },
          avgCost: { $avg: '$stops.activities.cost' },
          totalCost: { $sum: '$stops.activities.cost' },
          uniqueTrips: { $addToSet: '$_id' },
          popularActivities: {
            $push: {
              title: '$stops.activities.title',
              cost: '$stops.activities.cost'
            }
          }
        }
      },
      {
        $project: {
          _id: 0,
          type: '$_id',
          count: 1,
          uniqueTrips: { $size: '$uniqueTrips' },
          avgCost: { $round: ['$avgCost', 2] },
          totalCost: { $round: ['$totalCost', 2] },
          // Get top 3 most common activity titles for this type
          topActivities: { $slice: ['$popularActivities', 3] }
        }
      },
      { $sort: { count: -1 } }
    ]);

    return result;
  } catch (error) {
    logger.error('Error getting activity popularity:', error);
    throw error;
  }
};

module.exports = {
  getUserAnalytics,
  getUserTripsOverTime,
  getUserBudgetAnalysis,
  getUserTopDestinations,
  getUserActivityBreakdown,
  getPlatformAnalytics,
  getUserGrowth,
  getTripCreationTrends,
  getGlobalPopularDestinations,
  getBudgetTrends,
  getActivityPopularity,
};