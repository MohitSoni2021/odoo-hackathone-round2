const mongoose = require('mongoose');

const shareSchema = new mongoose.Schema({
  tripId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Trip',
    required: [true, 'Trip ID is required'],
  },
  publicId: {
    type: String,
    required: [true, 'Public ID is required'],
    unique: true,
    index: true,
  },
  expiresAt: {
    type: Date,
    required: [true, 'Expiration date is required'],
    index: { expires: 0 }, // TTL index - MongoDB will auto-delete expired documents
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Creator ID is required'],
  },
  viewCount: {
    type: Number,
    default: 0,
    min: [0, 'View count cannot be negative'],
  },
  lastViewedAt: {
    type: Date,
  },
}, {
  timestamps: true,
});

// Index for efficient queries
shareSchema.index({ tripId: 1 });
shareSchema.index({ createdBy: 1 });
shareSchema.index({ publicId: 1, expiresAt: 1 });

// Virtual to check if share is expired
shareSchema.virtual('isExpired').get(function() {
  return this.expiresAt < new Date();
});

// Virtual to get remaining days until expiration
shareSchema.virtual('daysUntilExpired').get(function() {
  const now = new Date();
  const diffTime = this.expiresAt - now;
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return Math.max(0, diffDays);
});

// Static method to create new share
shareSchema.statics.createShare = function(tripId, createdBy, expirationDays = 30) {
  const { nanoid } = require('nanoid');
  const publicId = nanoid(12);
  const expiresAt = new Date();
  expiresAt.setDate(expiresAt.getDate() + expirationDays);

  return this.create({
    tripId,
    publicId,
    expiresAt,
    createdBy,
  });
};

// Instance method to increment view count
shareSchema.methods.incrementView = function() {
  this.viewCount += 1;
  this.lastViewedAt = new Date();
  return this.save({ validateBeforeSave: false });
};

// Static method to find active shares
shareSchema.statics.findActive = function(conditions = {}) {
  return this.find({
    ...conditions,
    expiresAt: { $gt: new Date() }
  });
};

// Static method to cleanup expired shares (manual cleanup if needed)
shareSchema.statics.cleanupExpired = function() {
  return this.deleteMany({
    expiresAt: { $lt: new Date() }
  });
};

const Share = mongoose.model('Share', shareSchema);

module.exports = Share;