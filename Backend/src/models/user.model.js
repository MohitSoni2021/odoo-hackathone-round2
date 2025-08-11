const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const validator = require('validator');

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Name is required'],
    trim: true,
    minlength: [2, 'Name must be at least 2 characters long'],
    maxlength: [100, 'Name cannot exceed 100 characters'],
  },
  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true,
    lowercase: true,
    trim: true,
    validate: [validator.isEmail, 'Please provide a valid email'],
    index: true, // Index for faster login queries
  },
  passwordHash: {
    type: String,
    required: [true, 'Password is required'],
    minlength: [8, 'Password must be at least 8 characters long'],
    select: false, // Don't include password in queries by default
  },
  phone: {
    type: String,
    trim: true,
    validate: {
      validator: function(v) {
        return !v || validator.isMobilePhone(v);
      },
      message: 'Please provide a valid phone number'
    }
  },
  country: {
    type: String,
    trim: true,
    maxlength: [100, 'Country name cannot exceed 100 characters'],
  },
  city: {
    type: String,
    trim: true,
    maxlength: [100, 'City name cannot exceed 100 characters'],
  },
  avatarUrl: {
    type: String,
    validate: [validator.isURL, 'Please provide a valid URL'],
  },
  role: {
    type: String,
    enum: {
      values: ['user', 'admin'],
      message: 'Role must be either user or admin'
    },
    default: 'user',
  },
  isVerified: {
    type: Boolean,
    default: false,
  },
  verificationToken: {
    type: String,
    select: false,
  },
  passwordResetToken: {
    type: String,
    select: false,
  },
  passwordResetExpires: {
    type: Date,
    select: false,
  },
  lastLoginAt: {
    type: Date,
  },
  refreshToken: {
    type: String,
    select: false,
  },
}, {
  timestamps: true,
  toJSON: { 
    virtuals: true,
    transform: function(doc, ret) {
      delete ret.passwordHash;
      delete ret.refreshToken;
      delete ret.verificationToken;
      delete ret.passwordResetToken;
      delete ret.passwordResetExpires;
      delete ret.__v;
      return ret;
    }
  },
  toObject: { virtuals: true }
});

// Virtual for user's full location
userSchema.virtual('fullLocation').get(function() {
  if (this.city && this.country) {
    return `${this.city}, ${this.country}`;
  }
  return this.country || this.city || '';
});

// Index for email searches
userSchema.index({ email: 1 });

// Pre-save middleware to hash password
userSchema.pre('save', async function(next) {
  // Only hash the password if it has been modified (or is new)
  if (!this.isModified('passwordHash')) return next();

  try {
    // Hash the password with cost of 12
    const saltRounds = parseInt(process.env.BCRYPT_SALT_ROUNDS) || 12;
    this.passwordHash = await bcrypt.hash(this.passwordHash, saltRounds);
    next();
  } catch (error) {
    next(error);
  }
});

// Instance method to check password
userSchema.methods.comparePassword = async function(candidatePassword) {
  return bcrypt.compare(candidatePassword, this.passwordHash);
};

// Instance method to update last login
userSchema.methods.updateLastLogin = function() {
  this.lastLoginAt = new Date();
  return this.save({ validateBeforeSave: false });
};

// Static method to find user by email
userSchema.statics.findByEmail = function(email) {
  return this.findOne({ email: email.toLowerCase() });
};

const User = mongoose.model('User', userSchema);

module.exports = User;