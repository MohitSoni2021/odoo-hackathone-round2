const express = require('express');
const { validate } = require('../middlewares/validate.middleware');
const { authenticateToken, verifyRefreshToken } = require('../middlewares/auth.middleware');
const { 
  signupValidation, 
  loginValidation, 
  forgotPasswordValidation, 
  resetPasswordValidation 
} = require('../utils/validators');
const {
  signup,
  login,
  refresh,
  logout,
  verifyEmail,
  forgotPassword,
  resetPassword,
} = require('../controllers/auth.controller');

const router = express.Router();

// Public routes
router.post('/signup', validate(signupValidation), signup);
router.post('/login', validate(loginValidation), login);
router.get('/verify-email', verifyEmail);
router.post('/forgot-password', validate(forgotPasswordValidation), forgotPassword);
router.post('/reset-password', validate(resetPasswordValidation), resetPassword);

// Protected routes
router.post('/refresh', verifyRefreshToken, refresh);
router.post('/logout', authenticateToken, logout);

module.exports = router;