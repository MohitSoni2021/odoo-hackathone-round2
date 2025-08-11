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
  const userId = req.user._id;

  // Aggregate user statistics
  const stats = await Trip.aggregate([
    { $match: { ownerId: userId } },
    {
      $group: {
        _id: null,
        totalTrips: { $sum: 1 },
        totalStops: { $sum: { $size: '$stops' } },
        totalCountries: { $addToSet: '$stops.country' },
        totalCities: { $addToSet: { $concat: ['$stops.city', ', ', '$stops.country'] } },
        totalBudget: { $sum: '$budget.total' },
        avgTripDuration: {
          $avg: {
            $divide: [
              { $subtract: ['$endDate', '$startDate'] },
              1000 * 60 * 60 * 24 // Convert to days
            ]
          }
        }
      }
    },
    {
      $project: {
        _id: 0,
        totalTrips: 1,
        totalStops: 1,
        totalCountries: { $size: '$totalCountries' },
        totalCities: { $size: '$totalCities' },
        totalBudget: { $round: ['$totalBudget', 2] },
        avgTripDuration: { $round: ['$avgTripDuration', 1] },
      }
    }
  ]);

  const userStats = stats[0] || {
    totalTrips: 0,
    totalStops: 0,
    totalCountries: 0,
    totalCities: 0,
    totalBudget: 0,
    avgTripDuration: 0,
  };

  sendSuccessResponse(res, {
    message: 'User statistics retrieved successfully',
    stats: userStats,
  });
});

module.exports = {
  getProfile,
  updateProfile,
  uploadAvatar,
  changePassword,
  deleteAccount,
  getUserStats,
};