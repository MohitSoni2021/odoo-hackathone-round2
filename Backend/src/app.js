const express = require('express');
const cookieParser = require('cookie-parser');
const cors = require('cors');
const helmet = require('helmet');
const compression = require('compression');
const morgan = require('morgan');
const { RateLimiterMemory } = require('rate-limiter-flexible');

// Import middlewares
const { errorHandler, notFound } = require('./middlewares/error.middleware');

// Import routes
const authRoutes = require('./routes/auth.routes');
const userRoutes = require('./routes/user.routes');
const tripRoutes = require('./routes/trip.routes');
const publicRoutes = require('./routes/public.routes');
const adminRoutes = require('./routes/admin.routes');

// Import config
const logger = require('./config/logger');

const app = express();

// Trust proxy if behind reverse proxy (for production)
if (process.env.NODE_ENV === 'production') {
  app.set('trust proxy', 1);
}

// Rate limiting
const authLimiter = new RateLimiterMemory({
  keyGenerator: (req) => req.ip,
  points: 5, // Number of attempts
  duration: 60, // Per 1 minute
});

const generalLimiter = new RateLimiterMemory({
  keyGenerator: (req) => req.ip,
  points: 100, // Number of requests
  duration: 900, // Per 15 minutes
});

// Rate limiting middleware for auth routes
const authRateLimitMiddleware = async (req, res, next) => {
  try {
    await authLimiter.consume(req.ip);
    next();
  } catch (rejRes) {
    const secs = Math.round(rejRes.msBeforeNext / 1000) || 1;
    res.set('Retry-After', String(secs));
    res.status(429).json({
      success: false,
      error: {
        message: 'Too many authentication attempts. Please try again later.',
        retryAfter: secs,
        timestamp: new Date().toISOString(),
      }
    });
  }
};

// General rate limiting middleware
const generalRateLimitMiddleware = async (req, res, next) => {
  try {
    await generalLimiter.consume(req.ip);
    next();
  } catch (rejRes) {
    const secs = Math.round(rejRes.msBeforeNext / 1000) || 1;
    res.set('Retry-After', String(secs));
    res.status(429).json({
      success: false,
      error: {
        message: 'Too many requests. Please try again later.',
        retryAfter: secs,
        timestamp: new Date().toISOString(),
      }
    });
  }
};

// Security middleware
app.use(helmet({
  crossOriginEmbedderPolicy: false,
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      scriptSrc: ["'self'"],
      imgSrc: ["'self'", "data:", "https:", "http:"],
    },
  },
}));

// CORS configuration
const corsOptions = {
  origin: function (origin, callback) {
    // Allow requests with no origin (mobile apps, Postman, etc.)
    if (!origin) return callback(null, true);
    
    const allowedOrigins = [
      'http://localhost:3000',
      'http://localhost:3001',
      'http://localhost:5173',
      'http://localhost:5174',
      process.env.FRONTEND_URL,
    ].filter(Boolean);

    if (allowedOrigins.includes(origin) || process.env.NODE_ENV === 'development') {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
};

app.use(cors(corsOptions));

// Compression middleware
app.use(compression());

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Cookie parser
app.use(cookieParser());

// Request logging
if (process.env.NODE_ENV === 'production') {
  app.use(morgan('combined', {
    stream: {
      write: (message) => logger.info(message.trim())
    }
  }));
} else {
  app.use(morgan('dev'));
}

// Apply general rate limiting to all routes
app.use(generalRateLimitMiddleware);

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Server is healthy',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: process.env.NODE_ENV,
  });
});

// API routes
app.use('/api/v1/auth', authRateLimitMiddleware, authRoutes);
app.use('/api/v1/users', userRoutes);
app.use('/api/v1/trips', tripRoutes);
app.use('/api/v1/public', publicRoutes);
app.use('/public', publicRoutes); // Direct public access without /api/v1 prefix
app.use('/api/v1/admin', adminRoutes);

// Search routes (can be added as a separate router later if needed)
app.get('/api/v1/search/cities', async (req, res) => {
  try {
    const { searchCities } = require('./services/search.service');
    const { q: query, limit = 10 } = req.query;
    
    if (!query || query.trim().length < 2) {
      return res.status(400).json({
        success: false,
        error: {
          message: 'Search query must be at least 2 characters long',
          timestamp: new Date().toISOString(),
        }
      });
    }

    const cities = await searchCities(query.trim(), parseInt(limit));
    
    res.json({
      success: true,
      message: 'Cities retrieved successfully',
      cities,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    logger.error('Error in city search:', error);
    res.status(500).json({
      success: false,
      error: {
        message: 'Error searching cities',
        timestamp: new Date().toISOString(),
      }
    });
  }
});

app.get('/api/v1/search/activities', async (req, res) => {
  try {
    const { searchActivities } = require('./services/search.service');
    const { q: query, type, city, country, limit = 20 } = req.query;
    
    if (!query || query.trim().length < 2) {
      return res.status(400).json({
        success: false,
        error: {
          message: 'Search query must be at least 2 characters long',
          timestamp: new Date().toISOString(),
        }
      });
    }

    const activities = await searchActivities(query.trim(), {
      type,
      city,
      country,
      limit: parseInt(limit)
    });
    
    res.json({
      success: true,
      message: 'Activities retrieved successfully',
      activities,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    logger.error('Error in activity search:', error);
    res.status(500).json({
      success: false,
      error: {
        message: 'Error searching activities',
        timestamp: new Date().toISOString(),
      }
    });
  }
});

// Catch 404 and forward to error handler
app.use(notFound);

// Global error handling middleware (must be last)
app.use(errorHandler);

module.exports = app;