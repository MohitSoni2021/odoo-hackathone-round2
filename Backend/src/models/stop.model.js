const mongoose = require('mongoose');
const activitySchema = require('./activity.model');

const stopSchema = new mongoose.Schema({
  name: {
    type: String,
    trim: true,
    maxlength: [100, 'Stop name cannot exceed 100 characters'],
  },
  description: {
    type: String,
    trim: true,
    maxlength: [500, 'Description cannot exceed 500 characters'],
  },
  city: {
    type: String,
    required: [true, 'City is required'],
    trim: true,
    maxlength: [100, 'City name cannot exceed 100 characters'],
  },
  country: {
    type: String,
    required: [true, 'Country is required'],
    trim: true,
    maxlength: [100, 'Country name cannot exceed 100 characters'],
  },
  startDate: {
    type: Date,
    required: [true, 'Start date is required'],
  },
  endDate: {
    type: Date,
    required: [true, 'End date is required'],
    validate: {
      validator: function(value) {
        return value > this.startDate;
      },
      message: 'End date must be after start date'
    }
  },
  bannerImage: {
    type: String,
    validate: {
      validator: function(v) {
        return !v || /^https?:\/\/.+\..+/.test(v);
      },
      message: 'Please provide a valid URL'
    }
  },
  activities: [activitySchema],
}, {
  timestamps: true,
  _id: true,
});

// Virtual for location string
stopSchema.virtual('location').get(function() {
  return `${this.city}, ${this.country}`;
});

// Virtual for duration in days
stopSchema.virtual('durationDays').get(function() {
  if (this.startDate && this.endDate) {
    const diffTime = Math.abs(this.endDate - this.startDate);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  }
  return 0;
});

// Virtual for total cost of activities in this stop
stopSchema.virtual('totalCost').get(function() {
  return this.activities.reduce((sum, activity) => sum + (activity.cost || 0), 0);
});

// Instance method to add activity
stopSchema.methods.addActivity = function(activityData) {
  this.activities.push(activityData);
  return this.parent().save();
};

// Instance method to remove activity
stopSchema.methods.removeActivity = function(activityId) {
  this.activities.id(activityId).remove();
  return this.parent().save();
};

module.exports = stopSchema;