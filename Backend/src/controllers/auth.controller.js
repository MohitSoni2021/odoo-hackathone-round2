const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const User = require('../models/user.model');
const { sendSuccessResponse, sendErrorResponse } = require('../utils/response');
const { asyncHandler } = require('../middlewares/error.middleware');
const emailService = require('../services/email.service');
const logger = require('../config/logger');

/**
 * Generate JWT tokens
 */
const generateTokens = (userId) => {
  const accessToken = jwt.sign(
    { userId },
    process.env.JWT_ACCESS_SECRET,
    { expiresIn: process.env.JWT_ACCESS_EXPIRES || '15m' }
  );

  const refreshToken = jwt.sign(
    { userId },
    process.env.JWT_REFRESH_SECRET,
    { expiresIn: process.env.JWT_REFRESH_EXPIRES || '30d' }
  );

  return { accessToken, refreshToken };
};

/**
 * Set refresh token cookie
 */
const setRefreshTokenCookie = (res, refreshToken) => {
  const isProduction = process.env.NODE_ENV === 'production';
  
  res.cookie('refreshToken', refreshToken, {
    httpOnly: true,
    secure: isProduction, // Use secure cookies in production
    sameSite: isProduction ? 'none' : 'lax',
    maxAge: 30 * 24 * 60 * 60 * 1000, // 30 days
  });
};


const signup = asyncHandler(async (req, res) => {
  console.log("working Signup")
  const { name, email, password, phone, country, city } = req.body;

  console.log(req.body);

  // Check if user already exists
  const existingUser = await User.findByEmail(email);
  if (existingUser) {
    return sendErrorResponse(res, 'User with this email already exists', 400);
  }

  // Create verification token
  const verificationToken = crypto.randomBytes(32).toString('hex');

  // Create user
  const user = await User.create({
    name,
    email,
    passwordHash: password, // Will be hashed by pre-save middleware
    phone,
    country,
    city,
    verificationToken,
  });

  // Send verification email
  try {
    await emailService.sendVerificationEmail(user.email, user.name, verificationToken);
  } catch (error) {
    logger.error('Error sending verification email:', error);
    // Don't fail registration if email fails
  }

  // Remove sensitive data from response
  const userResponse = user.toObject();
  delete userResponse.passwordHash;
  delete userResponse.verificationToken;

  sendSuccessResponse(res, {
    message: 'Registration successful. Please check your email to verify your account',
    user: userResponse,
  }, 201);
});

/**
 * @desc    Login user
 * @route   POST /api/v1/auth/login
 * @access  Public
 */
const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  // Find user and include password for comparison
  const user = await User.findByEmail(email).select('+passwordHash');
  
  if (!user || !(await user.comparePassword(password))) {
    return sendErrorResponse(res, 'Invalid email or password', 401);
  }

  if (!user.isVerified) {
    return sendErrorResponse(res, 'Please verify your email before logging in', 401);
  }

  // Generate tokens
  const { accessToken, refreshToken } = generateTokens(user._id);

  // Save refresh token to user
  user.refreshToken = refreshToken;
  await user.updateLastLogin();
  await user.save({ validateBeforeSave: true });

  // Set refresh token cookie
  setRefreshTokenCookie(res, refreshToken);

  // Remove sensitive data
  const userResponse = user.toObject();
  delete userResponse.passwordHash;
  delete userResponse.refreshToken;

  sendSuccessResponse(res, {
    message: 'Login successful',
    user: userResponse,
    accessToken,
  });
});

/**
 * @desc    Refresh access token
 * @route   POST /api/v1/auth/refresh
 * @access  Private (requires refresh token)
 */
const refresh = asyncHandler(async (req, res) => {
  const user = req.user; // Set by verifyRefreshToken middleware

  // Generate new access token
  const { accessToken } = generateTokens(user._id);

  sendSuccessResponse(res, {
    message: 'Token refreshed successfully',
    accessToken,
  });
});

/**
 * @desc    Logout user
 * @route   POST /api/v1/auth/logout
 * @access  Private
 */
const logout = asyncHandler(async (req, res) => {
  const user = req.user;

  // Clear refresh token from database
  user.refreshToken = undefined;
  await user.save({ validateBeforeSave: false });

  // Clear refresh token cookie
  res.clearCookie('refreshToken', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
  });

  sendSuccessResponse(res, {
    message: 'Logout successful',
  });
});

/**
 * @desc    Verify email
 * @route   GET /api/v1/auth/verify-email
 * @access  Public
 */
const verifyEmail = asyncHandler(async (req, res) => {
  const { token } = req.query;

  if (!token) {
    return sendErrorResponse(res, 'Verification token is required', 400);
  }

  // Find user with verification token
  const user = await User.findOne({ verificationToken: token });

  if (!user) {
    return sendErrorResponse(res, 'Invalid or expired verification token', 400);
  }

  // Verify user
  user.isVerified = true;
  user.verificationToken = undefined;
  await user.save({ validateBeforeSave: false });

  sendSuccessResponse(res, {
    message: 'Email verified successfully. You can now log in',
  });
});

/**
 * @desc    Request password reset
 * @route   POST /api/v1/auth/forgot-password
 * @access  Public
 */
const forgotPassword = asyncHandler(async (req, res) => {
  const { email } = req.body;

  const user = await User.findByEmail(email);
  
  if (!user) {
    // Don't reveal whether email exists or not
    return sendSuccessResponse(res, {
      message: 'If an account with that email exists, a password reset email has been sent',
    });
  }

  // Generate reset token
  const resetToken = crypto.randomBytes(32).toString('hex');
  const hashedToken = crypto.createHash('sha256').update(resetToken).digest('hex');

  user.passwordResetToken = hashedToken;
  user.passwordResetExpires = Date.now() + 10 * 60 * 1000; // 10 minutes
  await user.save({ validateBeforeSave: false });

  // Send reset email
  try {
    await emailService.sendPasswordResetEmail(user.email, user.name, resetToken);
    
    sendSuccessResponse(res, {
      message: 'Password reset email sent successfully',
    });
  } catch (error) {
    logger.error('Error sending password reset email:', error);
    
    user.passwordResetToken = undefined;
    user.passwordResetExpires = undefined;
    await user.save({ validateBeforeSave: false });

    return sendErrorResponse(res, 'Error sending password reset email. Please try again', 500);
  }
});

/**
 * @desc    Reset password
 * @route   POST /api/v1/auth/reset-password
 * @access  Public
 */
const resetPassword = asyncHandler(async (req, res) => {
  const { token, password } = req.body;

  // Hash token to compare with database
  const hashedToken = crypto.createHash('sha256').update(token).digest('hex');

  // Find user with valid reset token
  const user = await User.findOne({
    passwordResetToken: hashedToken,
    passwordResetExpires: { $gt: Date.now() },
  });

  if (!user) {
    return sendErrorResponse(res, 'Invalid or expired password reset token', 400);
  }

  // Set new password
  user.passwordHash = password; // Will be hashed by pre-save middleware
  user.passwordResetToken = undefined;
  user.passwordResetExpires = undefined;
  user.refreshToken = undefined; // Invalidate all sessions
  await user.save();

  sendSuccessResponse(res, {
    message: 'Password reset successful. Please log in with your new password',
  });
});

module.exports = {
  signup,
  login,
  refresh,
  logout,
  verifyEmail,
  forgotPassword,
  resetPassword,
};