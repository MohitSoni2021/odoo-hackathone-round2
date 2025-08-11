const { body, query, param } = require('express-validator');

// Auth validators
const signupValidation = [
  body('name')
    .trim()
    .isLength({ min: 2, max: 100 })
    .withMessage('Name must be between 2 and 100 characters'),
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Please provide a valid email'),
  body('password')
    .isLength({ min: 8 })
    .withMessage('Password must be at least 8 characters long')
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
    .withMessage('Password must contain at least one uppercase letter, one lowercase letter, and one number'),
  body('phone')
    .optional()
    .isMobilePhone()
    .withMessage('Please provide a valid phone number'),
  body('country')
    .optional()
    .trim()
    .isLength({ max: 100 })
    .withMessage('Country name cannot exceed 100 characters'),
  body('city')
    .optional()
    .trim()
    .isLength({ max: 100 })
    .withMessage('City name cannot exceed 100 characters'),
];

const loginValidation = [
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Please provide a valid email'),
  body('password')
    .notEmpty()
    .withMessage('Password is required'),
];

const forgotPasswordValidation = [
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Please provide a valid email'),
];

const resetPasswordValidation = [
  body('token')
    .notEmpty()
    .withMessage('Reset token is required'),
  body('password')
    .isLength({ min: 8 })
    .withMessage('Password must be at least 8 characters long')
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
    .withMessage('Password must contain at least one uppercase letter, one lowercase letter, and one number'),
];

// User validators
const updateProfileValidation = [
  body('name')
    .optional()
    .trim()
    .isLength({ min: 2, max: 100 })
    .withMessage('Name must be between 2 and 100 characters'),
  body('phone')
    .optional()
    .isMobilePhone()
    .withMessage('Please provide a valid phone number'),
  body('country')
    .optional()
    .trim()
    .isLength({ max: 100 })
    .withMessage('Country name cannot exceed 100 characters'),
  body('city')
    .optional()
    .trim()
    .isLength({ max: 100 })
    .withMessage('City name cannot exceed 100 characters'),
];

const changePasswordValidation = [
  body('currentPassword')
    .notEmpty()
    .withMessage('Current password is required'),
  body('newPassword')
    .isLength({ min: 8 })
    .withMessage('New password must be at least 8 characters long')
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
    .withMessage('New password must contain at least one uppercase letter, one lowercase letter, and one number'),
];

const deleteAccountValidation = [
  body('password')
    .notEmpty()
    .withMessage('Password is required'),
];

// Trip validators
const createTripValidation = [
  body('title')
    .trim()
    .isLength({ min: 1, max: 200 })
    .withMessage('Trip title must be between 1 and 200 characters'),
  body('description')
    .optional()
    .trim()
    .isLength({ max: 2000 })
    .withMessage('Description cannot exceed 2000 characters'),
  body('startDate')
    .isISO8601()
    .toDate()
    .withMessage('Please provide a valid start date'),
  body('endDate')
    .isISO8601()
    .toDate()
    .withMessage('Please provide a valid end date')
    .custom((endDate, { req }) => {
      if (endDate <= req.body.startDate) {
        throw new Error('End date must be after start date');
      }
      return true;
    }),
  body('coverImage')
    .optional()
    .isURL()
    .withMessage('Please provide a valid image URL'),
  body('isPublic')
    .optional()
    .isBoolean()
    .withMessage('isPublic must be a boolean'),
];

const updateTripValidation = [
  body('title')
    .optional()
    .trim()
    .isLength({ min: 1, max: 200 })
    .withMessage('Trip title must be between 1 and 200 characters'),
  body('description')
    .optional()
    .trim()
    .isLength({ max: 2000 })
    .withMessage('Description cannot exceed 2000 characters'),
  body('startDate')
    .optional()
    .isISO8601()
    .toDate()
    .withMessage('Please provide a valid start date'),
  body('endDate')
    .optional()
    .isISO8601()
    .toDate()
    .withMessage('Please provide a valid end date')
    .custom((endDate, { req }) => {
      if (req.body.startDate && endDate && endDate <= req.body.startDate) {
        throw new Error('End date must be after start date');
      }
      return true;
    }),
  body('coverImage')
    .optional()
    .isURL()
    .withMessage('Please provide a valid image URL'),
  body('isPublic')
    .optional()
    .isBoolean()
    .withMessage('isPublic must be a boolean'),
];

const updateBudgetValidation = [
  body('total')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('Total budget must be a positive number'),
  body('transport')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('Transport budget must be a positive number'),
  body('stay')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('Stay budget must be a positive number'),
  body('activities')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('Activities budget must be a positive number'),
  body('meals')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('Meals budget must be a positive number'),
];

// Stop validators
const addStopValidation = [
  body('name')
    .optional()
    .trim()
    .isLength({ max: 100 })
    .withMessage('Stop name cannot exceed 100 characters'),
  body('description')
    .optional()
    .trim()
    .isLength({ max: 500 })
    .withMessage('Description cannot exceed 500 characters'),
  body('city')
    .trim()
    .isLength({ min: 1, max: 100 })
    .withMessage('City name must be between 1 and 100 characters'),
  body('country')
    .trim()
    .isLength({ min: 1, max: 100 })
    .withMessage('Country name must be between 1 and 100 characters'),
  body('startDate')
    .isISO8601()
    .toDate()
    .withMessage('Please provide a valid start date'),
  body('endDate')
    .isISO8601()
    .toDate()
    .withMessage('Please provide a valid end date')
    .custom((endDate, { req }) => {
      if (endDate <= req.body.startDate) {
        throw new Error('End date must be after start date');
      }
      return true;
    }),
  body('bannerImage')
    .optional()
    .isURL()
    .withMessage('Please provide a valid image URL'),
];

const updateStopValidation = [
  body('name')
    .optional()
    .trim()
    .isLength({ max: 100 })
    .withMessage('Stop name cannot exceed 100 characters'),
  body('description')
    .optional()
    .trim()
    .isLength({ max: 500 })
    .withMessage('Description cannot exceed 500 characters'),
  body('city')
    .optional()
    .trim()
    .isLength({ min: 1, max: 100 })
    .withMessage('City name must be between 1 and 100 characters'),
  body('country')
    .optional()
    .trim()
    .isLength({ min: 1, max: 100 })
    .withMessage('Country name must be between 1 and 100 characters'),
  body('startDate')
    .optional()
    .isISO8601()
    .toDate()
    .withMessage('Please provide a valid start date'),
  body('endDate')
    .optional()
    .isISO8601()
    .toDate()
    .withMessage('Please provide a valid end date')
    .custom((endDate, { req }) => {
      if (req.body.startDate && endDate && endDate <= req.body.startDate) {
        throw new Error('End date must be after start date');
      }
      return true;
    }),
  body('bannerImage')
    .optional()
    .isURL()
    .withMessage('Please provide a valid image URL'),
];

// Activity validators
const addActivityValidation = [
  body('title')
    .trim()
    .isLength({ min: 1, max: 200 })
    .withMessage('Activity title must be between 1 and 200 characters'),
  body('type')
    .isIn(['sightseeing', 'transport', 'stay', 'food', 'other'])
    .withMessage('Activity type must be one of: sightseeing, transport, stay, food, other'),
  body('cost')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('Cost must be a positive number'),
  body('duration')
    .optional()
    .trim()
    .isLength({ max: 50 })
    .withMessage('Duration cannot exceed 50 characters'),
  body('notes')
    .optional()
    .trim()
    .isLength({ max: 1000 })
    .withMessage('Notes cannot exceed 1000 characters'),
  body('providerUrl')
    .optional()
    .isURL()
    .withMessage('Please provide a valid URL'),
];

const updateActivityValidation = [
  body('title')
    .optional()
    .trim()
    .isLength({ min: 1, max: 200 })
    .withMessage('Activity title must be between 1 and 200 characters'),
  body('type')
    .optional()
    .isIn(['sightseeing', 'transport', 'stay', 'food', 'other'])
    .withMessage('Activity type must be one of: sightseeing, transport, stay, food, other'),
  body('cost')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('Cost must be a positive number'),
  body('duration')
    .optional()
    .trim()
    .isLength({ max: 50 })
    .withMessage('Duration cannot exceed 50 characters'),
  body('notes')
    .optional()
    .trim()
    .isLength({ max: 1000 })
    .withMessage('Notes cannot exceed 1000 characters'),
  body('providerUrl')
    .optional()
    .isURL()
    .withMessage('Please provide a valid URL'),
];

// Public/Share validators
const createShareValidation = [
  body('expirationDays')
    .optional()
    .isInt({ min: 1, max: 365 })
    .withMessage('Expiration days must be between 1 and 365'),
];

// Admin validators
const updateUserRoleValidation = [
  body('role')
    .isIn(['user', 'admin'])
    .withMessage('Role must be either "user" or "admin"'),
];

// Search validators
const searchValidation = [
  query('q')
    .optional()
    .trim()
    .isLength({ min: 1, max: 100 })
    .withMessage('Search query must be between 1 and 100 characters'),
  query('limit')
    .optional()
    .isInt({ min: 1, max: 50 })
    .withMessage('Limit must be between 1 and 50'),
];

module.exports = {
  // Auth
  signupValidation,
  loginValidation,
  forgotPasswordValidation,
  resetPasswordValidation,
  
  // User
  updateProfileValidation,
  changePasswordValidation,
  deleteAccountValidation,
  
  // Trip
  createTripValidation,
  updateTripValidation,
  updateBudgetValidation,
  
  // Stop
  addStopValidation,
  updateStopValidation,
  
  // Activity
  addActivityValidation,
  updateActivityValidation,
  
  // Public/Share
  createShareValidation,
  
  // Admin
  updateUserRoleValidation,
  
  // Search
  searchValidation,
};