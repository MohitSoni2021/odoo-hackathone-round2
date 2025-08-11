const mongoose = require('mongoose');
const stopSchema = require('./stop.model');

const budgetSchema = new mongoose.Schema({
  total: {
    type: Number,
    min: [0, 'Total budget cannot be negative'],
    default: 0,
  },
  transport: {
    type: Number,
    min: [0, 'Transport budget cannot be negative'],
    default: 0,
  },
  stay: {
    type: Number,
    min: [0, 'Stay budget cannot be negative'],
    default: 0,
  },
  activities: {
    type: Number,
    min: [0, 'Activities budget cannot be negative'],
    default: 0,
  },
  meals: {
    type: Number,
    min: [0, 'Meals budget cannot be negative'],
    default: 0,
  },
}, { _id: false });

const tripSchema = new mongoose.Schema({
  ownerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Owner ID is required'],
    index: true,
  },
  ownerEmail: {
    type: String,
    required: [true, 'Owner email is required'],
    index: true,
  },
  title: {
    type: String,
    required: [true, 'Trip title is required'],
    trim: true,
    maxlength: [200, 'Trip title cannot exceed 200 characters'],
  },
  description: {
    type: String,
    trim: true,
    maxlength: [2000, 'Trip description cannot exceed 2000 characters'],
  },
  startDate: {
    type: Date,
    required: [true, 'Start date is required'],
    validate: {
      validator: function(value) {
        return value >= new Date().setHours(0, 0, 0, 0);
      },
      message: 'Start date cannot be before today'
    }
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
  coverImage: {
    type: String,
    validate: {
      validator: function(v) {
        return !v || /^https?:\/\/.+\..+/.test(v);
      },
      message: 'Please provide a valid URL'
    }
  },
  isPublic: {
    type: Boolean,
    default: false,
  },
  shareId: {
    type: String,
    unique: true,
    sparse: true, // Allow multiple null values
    index: true,
  },
  stops: [stopSchema],
  budget: {
    type: budgetSchema,
    default: () => ({}),
  },
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Virtual for trip duration in days
tripSchema.virtual('durationDays').get(function() {
  if (this.startDate && this.endDate) {
    const diffTime = Math.abs(this.endDate - this.startDate);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  }
  return 0;
});

// Virtual for total actual cost based on activities
tripSchema.virtual('actualCost').get(function() {
  return this.stops.reduce((total, stop) => {
    return total + stop.activities.reduce((stopTotal, activity) => {
      return stopTotal + (activity.cost || 0);
    }, 0);
  }, 0);
});

// Virtual for number of countries
tripSchema.virtual('countriesCount').get(function() {
  const countries = new Set(this.stops.map(stop => stop.country));
  return countries.size;
});

// Virtual for number of cities
tripSchema.virtual('citiesCount').get(function() {
  const cities = new Set(this.stops.map(stop => `${stop.city}, ${stop.country}`));
  return cities.size;
});

// Index for owner queries
tripSchema.index({ ownerId: 1, createdAt: -1 });

// Index for public trips
tripSchema.index({ isPublic: 1, createdAt: -1 });

// Index for date range queries
tripSchema.index({ startDate: 1, endDate: 1 });

// Pre-save middleware to calculate budget totals
tripSchema.pre('save', function(next) {
  // Calculate actual costs from activities
  let totalTransport = 0;
  let totalStay = 0;
  let totalActivities = 0;
  let totalMeals = 0;

  this.stops.forEach(stop => {
    stop.activities.forEach(activity => {
      const cost = activity.cost || 0;
      switch (activity.type) {
        case 'transport':
          totalTransport += cost;
          break;
        case 'stay':
          totalStay += cost;
          break;
        case 'food':
          totalMeals += cost;
          break;
        default:
          totalActivities += cost;
          break;
      }
    });
  });

  // Update budget with calculated values or keep user-defined values
  this.budget.transport = this.budget.transport || totalTransport;
  this.budget.stay = this.budget.stay || totalStay;
  this.budget.activities = this.budget.activities || totalActivities;
  this.budget.meals = this.budget.meals || totalMeals;
  this.budget.total = this.budget.total || (totalTransport + totalStay + totalActivities + totalMeals);

  next();
});

// Static method to find trips by owner
tripSchema.statics.findByOwner = function(ownerId, options = {}) {
  const query = this.find({ ownerId });
  
  if (options.populate) {
    query.populate('ownerId', 'name email avatarUrl');
  }
  
  if (options.sort) {
    query.sort(options.sort);
  } else {
    query.sort({ createdAt: -1 });
  }
  
  return query;
};

// Static method to find public trips
tripSchema.statics.findPublic = function(options = {}) {
  const query = this.find({ isPublic: true });
  
  if (options.populate) {
    query.populate('ownerId', 'name avatarUrl');
  }
  
  query.sort({ createdAt: -1 });
  return query;
};

// Instance method to generate share link
tripSchema.methods.generateShareId = function() {
  const { nanoid } = require('nanoid');
  this.shareId = nanoid(10);
  return this.save();
};

// Instance method to add stop
tripSchema.methods.addStop = function(stopData) {
  this.stops.push(stopData);
  return this.save();
};

// Instance method to get summary
tripSchema.methods.getSummary = function() {
  return {
    id: this._id,
    title: this.title,
    description: this.description,
    startDate: this.startDate,
    endDate: this.endDate,
    durationDays: this.durationDays,
    stopsCount: this.stops.length,
    countriesCount: this.countriesCount,
    citiesCount: this.citiesCount,
    totalActivities: this.stops.reduce((total, stop) => total + stop.activities.length, 0),
    budget: this.budget,
    actualCost: this.actualCost,
    coverImage: this.coverImage,
    isPublic: this.isPublic,
    createdAt: this.createdAt,
    updatedAt: this.updatedAt
  };
};

const Trip = mongoose.model('Trip', tripSchema);

module.exports = Trip;