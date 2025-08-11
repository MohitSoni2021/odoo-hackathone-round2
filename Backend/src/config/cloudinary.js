const cloudinary = require('cloudinary').v2;
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const multer = require('multer');

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Configure storage for avatars
const avatarStorage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: 'globetrotter/avatars',
    allowed_formats: ['jpg', 'jpeg', 'png'],
    transformation: [
      { width: 400, height: 400, crop: 'fill' },
      { quality: 'auto' }
    ],
  },
});

// Configure storage for trip images
const tripImageStorage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: 'globetrotter/trips',
    allowed_formats: ['jpg', 'jpeg', 'png'],
    transformation: [
      { width: 1200, height: 800, crop: 'fill' },
      { quality: 'auto' }
    ],
  },
});

// Create multer instances
const avatarUpload = multer({ 
  storage: avatarStorage,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit
  },
});

const tripImageUpload = multer({ 
  storage: tripImageStorage,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit
  },
});

// Helper function to delete image from Cloudinary
const deleteImage = async (publicId) => {
  try {
    await cloudinary.uploader.destroy(publicId);
  } catch (error) {
    console.error('Error deleting image from Cloudinary:', error);
  }
};

module.exports = {
  cloudinary,
  avatarUpload,
  tripImageUpload,
  deleteImage,
};