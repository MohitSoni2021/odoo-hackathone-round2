require('dotenv').config();

const app = require('./app');
const connectDB = require('./config/db');
const logger = require('./config/logger');

// Handle uncaught exceptions
process.on('uncaughtException', (err) => {
  logger.error('Uncaught Exception:', err);
  process.exit(1);
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (err) => {
  logger.error('Unhandled Promise Rejection:', err);
  process.exit(1);
});

const PORT = process.env.PORT || 5000;

const startServer = async () => {
  try {
    // Connect to database
    await connectDB();
    
    // Start server
    const server = app.listen(PORT, () => {
      logger.info(`🚀 Server running on port ${PORT} in ${process.env.NODE_ENV} mode`);
      logger.info(`📊 Health check available at http://localhost:${PORT}/health`);
      logger.info(`📖 API base URL: http://localhost:${PORT}/api/v1`);
    });

    // Graceful shutdown
    const gracefulShutdown = (signal) => {
      logger.info(`Received ${signal}. Starting graceful shutdown...`);
      
      server.close(() => {
        logger.info('HTTP server closed');
        
        // Close database connection
        const mongoose = require('mongoose');
        mongoose.connection.close(false, () => {
          logger.info('MongoDB connection closed');
          process.exit(0);
        });
      });

      // Force close server after 10s
      setTimeout(() => {
        logger.error('Could not close connections in time, forcefully shutting down');
        process.exit(1);
      }, 10000);
    };

    // Listen for termination signals
    process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
    process.on('SIGINT', () => gracefulShutdown('SIGINT'));

  } catch (error) {
    logger.error('Failed to start server:', error);
    process.exit(1);
  }
};

// Start the server
startServer();