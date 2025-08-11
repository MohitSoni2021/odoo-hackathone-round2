const express = require('express');
const { validate } = require('../middlewares/validate.middleware');
const { authenticateToken } = require('../middlewares/auth.middleware');
const { avatarUpload } = require('../config/cloudinary');
const { 
  updateProfileValidation, 
  changePasswordValidation, 
  deleteAccountValidation 
} = require('../utils/validators');
const {
  getProfile,
  updateProfile,
  uploadAvatar,
  changePassword,
  deleteAccount,
  getUserStats,
} = require('../controllers/user.controller');

const router = express.Router();

// All routes require authentication
router.use(authenticateToken);

router.get('/me', getProfile);
router.put('/me', validate(updateProfileValidation), updateProfile);
router.post('/me/avatar', avatarUpload.single('avatar'), uploadAvatar);
router.put('/me/password', validate(changePasswordValidation), changePassword);
router.delete('/me', validate(deleteAccountValidation), deleteAccount);
router.get('/me/stats', getUserStats);

module.exports = router;