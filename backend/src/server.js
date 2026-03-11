/**
 * Sales Insight Automator - Backend Server
 * Main entry point for the Express application
 */
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const swaggerUi = require('swagger-ui-express');

const { config, validateConfig } = require('./config');
const logger = require('./utils/logger');
const apiRoutes = require('./routes/api');
const swaggerSpec = require('./config/swagger');

// Initialize Express app
const app = express();

// ============================================
// MIDDLEWARE CONFIGURATION
// ============================================

// Security headers
app.use(helmet({
  crossOriginResourcePolicy: { policy: 'cross-origin' }
}));

// CORS configuration - allow Vercel domains and localhost
app.use(cors({
  origin: (origin, callback) => {
    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin) return callback(null, true);
    
    // Allow all Vercel preview/production domains
    if (origin.includes('.vercel.app') || origin.includes('localhost')) {
      return callback(null, true);
    }
    
    // Check configured allowed origins
    if (config.allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      logger.warn('CORS blocked request', { origin });
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-API-Key']
}));

// Body parsing
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// HTTP request logging
app.use(morgan('combined', {
  stream: {
    write: (message) => logger.info(message.trim())
  }
}));

// ============================================
// API ROUTES
// ============================================

// Swagger documentation
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec, {
  customCss: '.swagger-ui .topbar { display: none }',
  customSiteTitle: 'Sales Insight Automator API'
}));

// Swagger JSON endpoint
app.get('/api-docs.json', (req, res) => {
  res.setHeader('Content-Type', 'application/json');
  res.send(swaggerSpec);
});

// API routes
app.use('/api', apiRoutes);

// Root endpoint
app.get('/', (req, res) => {
  res.json({
    name: 'Sales Insight Automator API',
    version: '1.0.0',
    documentation: '/api-docs',
    health: '/api/health'
  });
});

// ============================================
// ERROR HANDLING
// ============================================

// 404 handler
app.use((req, res) => {
  logger.warn('Route not found', { 
    method: req.method, 
    url: req.originalUrl 
  });
  res.status(404).json({
    success: false,
    error: 'Route not found'
  });
});

// Global error handler
app.use((err, req, res, next) => {
  logger.error('Unhandled error', {
    error: err.message,
    stack: err.stack,
    url: req.originalUrl
  });

  // Handle specific error types
  if (err.name === 'MulterError') {
    return res.status(400).json({
      success: false,
      error: `File upload error: ${err.message}`
    });
  }

  if (err.message === 'Not allowed by CORS') {
    return res.status(403).json({
      success: false,
      error: 'CORS policy violation'
    });
  }

  res.status(err.status || 500).json({
    success: false,
    error: config.nodeEnv === 'development' ? err.message : 'Internal server error'
  });
});

// ============================================
// SERVER STARTUP
// ============================================

const startServer = async () => {
  // Validate configuration
  const configWarnings = validateConfig();
  if (configWarnings.length > 0) {
    logger.warn('Configuration warnings:');
    configWarnings.forEach(warning => logger.warn(`  - ${warning}`));
  }

  // Start listening
  app.listen(config.port, () => {
    console.log('\n========================================');
    console.log('🚀 Sales Insight Automator Backend');
    console.log('========================================');
    console.log(`📍 Server running on: http://localhost:${config.port}`);
    console.log(`📚 API Documentation: http://localhost:${config.port}/api-docs`);
    console.log(`🔧 Environment: ${config.nodeEnv}`);
    console.log('========================================\n');
    
    logger.info(`Server started on port ${config.port}`, {
      environment: config.nodeEnv,
      swagger: `http://localhost:${config.port}/api-docs`
    });
  });
};

// Only start server if not in Vercel serverless environment
if (!process.env.VERCEL) {
  startServer();
}

// Export for Vercel serverless
module.exports = app;
