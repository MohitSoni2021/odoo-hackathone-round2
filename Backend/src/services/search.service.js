const Trip = require('../models/trip.model');
const logger = require('../config/logger');

/**
 * Search for cities based on existing trip data
 */
const searchCities = async (query, limit = 10) => {
  try {
    const cities = await Trip.aggregate([
      // Unwind stops to work with individual stop data
      { $unwind: '$stops' },
      // Match cities that contain the search query (case insensitive)
      {
        $match: {
          $or: [
            { 'stops.city': { $regex: query, $options: 'i' } },
            { 'stops.country': { $regex: query, $options: 'i' } }
          ]
        }
      },
      // Group by city/country combination to get unique locations
      {
        $group: {
          _id: {
            city: '$stops.city',
            country: '$stops.country'
          },
          tripCount: { $sum: 1 },
          sampleImage: { $first: '$stops.bannerImage' },
          sampleTripTitle: { $first: '$title' }
        }
      },
      // Project the final structure
      {
        $project: {
          _id: 0,
          city: '$_id.city',
          country: '$_id.country',
          fullName: { $concat: ['$_id.city', ', ', '$_id.country'] },
          tripCount: 1,
          sampleImage: 1,
          sampleTripTitle: 1
        }
      },
      // Sort by trip count (popularity) and then alphabetically
      { $sort: { tripCount: -1, city: 1 } },
      // Limit results
      { $limit: limit }
    ]);

    return cities;
  } catch (error) {
    logger.error('Error searching cities:', error);
    throw error;
  }
};

/**
 * Search for activities based on existing trip data
 */
const searchActivities = async (query, options = {}) => {
  const { type, city, country, limit = 20 } = options;
  
  try {
    const pipeline = [
      // Unwind stops and activities
      { $unwind: '$stops' },
      { $unwind: '$stops.activities' },
      
      // Build match conditions
      {
        $match: {
          $and: [
            // Text search in activity title and notes
            {
              $or: [
                { 'stops.activities.title': { $regex: query, $options: 'i' } },
                { 'stops.activities.notes': { $regex: query, $options: 'i' } }
              ]
            },
            // Optional filters
            ...(type ? [{ 'stops.activities.type': type }] : []),
            ...(city ? [{ 'stops.city': { $regex: city, $options: 'i' } }] : []),
            ...(country ? [{ 'stops.country': { $regex: country, $options: 'i' } }] : [])
          ]
        }
      },
      
      // Group similar activities
      {
        $group: {
          _id: {
            title: '$stops.activities.title',
            type: '$stops.activities.type'
          },
          count: { $sum: 1 },
          avgCost: { $avg: '$stops.activities.cost' },
          locations: {
            $addToSet: {
              city: '$stops.city',
              country: '$stops.country'
            }
          },
          sampleNotes: { $first: '$stops.activities.notes' },
          sampleProviderUrl: { $first: '$stops.activities.providerUrl' },
          sampleTripTitle: { $first: '$title' }
        }
      },
      
      // Project final structure
      {
        $project: {
          _id: 0,
          title: '$_id.title',
          type: '$_id.type',
          count: 1,
          avgCost: { $round: ['$avgCost', 2] },
          locations: { $slice: ['$locations', 5] }, // Limit locations to 5
          locationCount: { $size: '$locations' },
          sampleNotes: 1,
          sampleProviderUrl: 1,
          sampleTripTitle: 1
        }
      },
      
      // Sort by popularity and then alphabetically
      { $sort: { count: -1, title: 1 } },
      
      // Limit results
      { $limit: limit }
    ];

    const activities = await Trip.aggregate(pipeline);
    return activities;
  } catch (error) {
    logger.error('Error searching activities:', error);
    throw error;
  }
};

/**
 * Get popular destinations
 */
const getPopularDestinations = async (limit = 10) => {
  try {
    const destinations = await Trip.aggregate([
      // Only include public trips for popular destinations
      { $match: { isPublic: true } },
      { $unwind: '$stops' },
      {
        $group: {
          _id: {
            city: '$stops.city',
            country: '$stops.country'
          },
          tripCount: { $sum: 1 },
          uniqueUsers: { $addToSet: '$ownerId' },
          avgBudget: { $avg: '$budget.total' },
          totalActivities: { $sum: { $size: '$stops.activities' } },
          sampleImages: { $addToSet: '$stops.bannerImage' }
        }
      },
      {
        $project: {
          _id: 0,
          city: '$_id.city',
          country: '$_id.country',
          fullName: { $concat: ['$_id.city', ', ', '$_id.country'] },
          tripCount: 1,
          userCount: { $size: '$uniqueUsers' },
          avgBudget: { $round: ['$avgBudget', 2] },
          avgActivities: { $round: [{ $divide: ['$totalActivities', '$tripCount'] }, 1] },
          sampleImage: { $arrayElemAt: [{ $filter: { input: '$sampleImages', cond: { $ne: ['$$this', null] } } }, 0] }
        }
      },
      { $sort: { tripCount: -1, userCount: -1 } },
      { $limit: limit }
    ]);

    return destinations;
  } catch (error) {
    logger.error('Error getting popular destinations:', error);
    throw error;
  }
};

/**
 * Get activity suggestions based on location
 */
const getActivitySuggestions = async (city, country, limit = 10) => {
  try {
    const suggestions = await Trip.aggregate([
      { $unwind: '$stops' },
      {
        $match: {
          'stops.city': { $regex: city, $options: 'i' },
          'stops.country': { $regex: country, $options: 'i' }
        }
      },
      { $unwind: '$stops.activities' },
      {
        $group: {
          _id: {
            title: '$stops.activities.title',
            type: '$stops.activities.type'
          },
          count: { $sum: 1 },
          avgCost: { $avg: '$stops.activities.cost' },
          avgDuration: { $avg: '$stops.activities.duration' },
          sampleNotes: { $first: '$stops.activities.notes' },
          sampleProviderUrl: { $first: '$stops.activities.providerUrl' }
        }
      },
      {
        $project: {
          _id: 0,
          title: '$_id.title',
          type: '$_id.type',
          popularity: '$count',
          avgCost: { $round: ['$avgCost', 2] },
          sampleNotes: 1,
          sampleProviderUrl: 1
        }
      },
      { $sort: { popularity: -1, title: 1 } },
      { $limit: limit }
    ]);

    return suggestions;
  } catch (error) {
    logger.error('Error getting activity suggestions:', error);
    throw error;
  }
};

module.exports = {
  searchCities,
  searchActivities,
  getPopularDestinations,
  getActivitySuggestions,
};