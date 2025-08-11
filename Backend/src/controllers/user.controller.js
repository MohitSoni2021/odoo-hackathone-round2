const User = require('../models/user.model');
const { sendSuccessResponse, sendErrorResponse } = require('../utils/response');
const { asyncHandler } = require('../middlewares/error.middleware');
const { deleteImage } = require('../config/cloudinary');
const logger = require('../config/logger');

/**
 * @desc    Get current user profile
 * @route   GET /api/v1/users/me
 * @access  Private
 */
const getProfile = asyncHandler(async (req, res) => {
  const user = req.user;
  
  sendSuccessResponse(res, {
    message: 'Profile retrieved successfully',
    user,
  });
});

/**
 * @desc    Update current user profile
 * @route   PUT /api/v1/users/me
 * @access  Private
 */
const updateProfile = asyncHandler(async (req, res) => {
  const { name, phone, country, city } = req.body;
  const user = req.user;

  // Update allowed fields
  if (name !== undefined) user.name = name;
  if (phone !== undefined) user.phone = phone;
  if (country !== undefined) user.country = country;
  if (city !== undefined) user.city = city;

  await user.save();

  sendSuccessResponse(res, {
    message: 'Profile updated successfully',
    user,
  });
});

/**
 * @desc    Upload user avatar
 * @route   POST /api/v1/users/me/avatar
 * @access  Private
 */
const uploadAvatar = asyncHandler(async (req, res) => {
  if (!req.file) {
    return sendErrorResponse(res, 'Please upload an image file', 400);
  }

  const user = req.user;
  const oldAvatarUrl = user.avatarUrl;

  // Update user with new avatar URL
  user.avatarUrl = req.file.path; // Cloudinary URL
  await user.save({ validateBeforeSave: false });

  // Delete old avatar from Cloudinary if it exists
  if (oldAvatarUrl) {
    try {
      // Extract public_id from Cloudinary URL
      const publicId = oldAvatarUrl.split('/').slice(-2).join('/').split('.')[0];
      await deleteImage(publicId);
    } catch (error) {
      logger.warn('Error deleting old avatar:', error.message);
    }
  }

  sendSuccessResponse(res, {
    message: 'Avatar uploaded successfully',
    avatarUrl: user.avatarUrl,
  });
});

/**
 * @desc    Change user password
 * @route   PUT /api/v1/users/me/password
 * @access  Private
 */
const changePassword = asyncHandler(async (req, res) => {
  const { currentPassword, newPassword } = req.body;
  
  // Get user with password field
  const user = await User.findById(req.user._id).select('+passwordHash');
  
  if (!user) {
    return sendErrorResponse(res, 'User not found', 404);
  }

  // Verify current password
  const isCurrentPasswordValid = await user.comparePassword(currentPassword);
  if (!isCurrentPasswordValid) {
    return sendErrorResponse(res, 'Current password is incorrect', 400);
  }

  // Update password
  user.passwordHash = newPassword; // Will be hashed by pre-save middleware
  user.refreshToken = undefined; // Invalidate all sessions
  await user.save();

  sendSuccessResponse(res, {
    message: 'Password changed successfully. Please log in again',
  });
});

/**
 * @desc    Delete user account
 * @route   DELETE /api/v1/users/me
 * @access  Private
 */
const deleteAccount = asyncHandler(async (req, res) => {
  const { password } = req.body;
  
  // Get user with password field
  const user = await User.findById(req.user._id).select('+passwordHash');
  
  if (!user) {
    return sendErrorResponse(res, 'User not found', 404);
  }

  // Verify password
  const isPasswordValid = await user.comparePassword(password);
  if (!isPasswordValid) {
    return sendErrorResponse(res, 'Password is incorrect', 400);
  }

  // Delete avatar from Cloudinary if it exists
  if (user.avatarUrl) {
    try {
      const publicId = user.avatarUrl.split('/').slice(-2).join('/').split('.')[0];
      await deleteImage(publicId);
    } catch (error) {
      logger.warn('Error deleting avatar during account deletion:', error.message);
    }
  }

  // Note: In production, you might want to:
  // 1. Anonymize user data instead of deleting
  // 2. Handle related data (trips, shares, etc.)
  // 3. Send confirmation email
  
  await User.findByIdAndDelete(user._id);

  sendSuccessResponse(res, {
    message: 'Account deleted successfully',
  });
});

/**
 * @desc    Get user statistics
 * @route   GET /api/v1/users/me/stats
 * @access  Private
 */
const getUserStats = asyncHandler(async (req, res) => {
  const Trip = require('../models/trip.model');
  const mongoose = require('mongoose');
  const userId = req.user._id;

  try {
    // Ensure userId is a valid ObjectId
    const objectId = mongoose.Types.ObjectId.isValid(userId) 
      ? new mongoose.Types.ObjectId(userId) 
      : userId;
      
    // First, get all trips for the user
    const trips = await Trip.find({ ownerId: objectId });
    
    // Calculate statistics manually to avoid complex aggregation issues
    let totalTrips = trips.length;
    let totalStops = 0;
    let countries = new Set();
    let cities = new Set();
    let totalBudget = 0;
    let totalDuration = 0;
    
    trips.forEach(trip => {
      // Count stops
      totalStops += trip.stops ? trip.stops.length : 0;
      
      // Collect unique countries and cities
      if (trip.stops && trip.stops.length > 0) {
        trip.stops.forEach(stop => {
          if (stop.country) countries.add(stop.country);
          if (stop.city && stop.country) cities.add(`${stop.city}, ${stop.country}`);
        });
      }
      
      // Sum budget
      if (trip.budget && trip.budget.total) {
        totalBudget += trip.budget.total;
      }
      
      // Calculate duration
      if (trip.startDate && trip.endDate) {
        const durationMs = new Date(trip.endDate) - new Date(trip.startDate);
        const durationDays = durationMs / (1000 * 60 * 60 * 24);
        totalDuration += durationDays;
      }
    });
    
    // Calculate average duration
    const avgTripDuration = totalTrips > 0 ? (totalDuration / totalTrips).toFixed(1) : 0;
    
    const userStats = {
      totalTrips,
      totalStops,
      totalCountries: countries.size,
      totalCities: cities.size,
      totalBudget: Math.round(totalBudget * 100) / 100, // Round to 2 decimal places
      avgTripDuration: parseFloat(avgTripDuration),
    };

    sendSuccessResponse(res, {
      message: 'User statistics retrieved successfully',
      stats: userStats,
    });
  } catch (error) {
    logger.error('Error calculating user stats:', error);
    sendErrorResponse(res, 'Failed to calculate user statistics', 500);
  }
});

module.exports = {
  getProfile,
  updateProfile,
  uploadAvatar,
  changePassword,
  deleteAccount,
  getUserStats,
};