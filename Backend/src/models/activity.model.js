const mongoose = require('mongoose');

const activitySchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Activity title is required'],
    trim: true,
    maxlength: [200, 'Activity title cannot exceed 200 characters'],
  },
  type: {
    type: String,
    required: [true, 'Activity type is required'],
    enum: {
      values: ['sightseeing', 'transport', 'stay', 'food', 'other'],
      message: 'Activity type must be one of: sightseeing, transport, stay, food, other'
    },
  },
  cost: {
    type: Number,
    min: [0, 'Cost cannot be negative'],
    default: 0,
  },
  duration: {
    type: String,
    trim: true,
    maxlength: [50, 'Duration cannot exceed 50 characters'],
  },
  notes: {
    type: String,
    trim: true,
    maxlength: [1000, 'Notes cannot exceed 1000 characters'],
  },
  providerUrl: {
    type: String,
    trim: true,
    validate: {
      validator: function(v) {
        return !v || /^https?:\/\/.+\..+/.test(v);
      },
      message: 'Please provide a valid URL'
    }
  },
}, {
  timestamps: true,
  _id: true, // Ensure each activity gets its own _id
});

// Virtual for formatted cost
activitySchema.virtual('formattedCost').get(function() {
  return `$${this.cost.toFixed(2)}`;
});

module.exports = activitySchema;