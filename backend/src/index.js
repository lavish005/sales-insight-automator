/**
 * Sales Insight Automator - Main Entry Point
 * A secure, containerized application for AI-powered sales data analysis
 */

require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const { setupSwagger } = require('./config/swagger');
const logger = require('./utils/logger');
const uploadRoutes = require('./routes/upload.routes');
const healthRoutes = require('./routes/health.routes');

const app = express();
const PORT = process.env.PORT || 5000;

// ======================
// Security Middleware
// ======================

// Helmet for security headers
app.use(helmet());

// CORS configuration
const corsOptions = {
  origin: process.env.ALLOWED_ORIGINS?.split(',') || ['http://localhost:3000', 'http://localhost:5173'],
  methods: ['GET', 'POST', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-API-Key'],
  credentials: true,
  maxAge: 86400 // 24 hours
};
app.use(cors(corsOptions));

// Rate limiting - protect against abuse
const limiter = rateLimit({
  windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS) || 60 * 1000, // 1 minute
  max: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS) || 10,
  message: {
    success: false,
    error: 'Too many requests. Please try again later.',
    retryAfter: '60 seconds'
  },
  standardHeaders: true,
  legacyHeaders: false
});
app.use('/api/', limiter);

// Body parsing
app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ extended: true, limit: '1mb' }));

// Request logging middleware
app.use((req, res, next) => {
  logger.info(`${req.method} ${req.path}`, {
    ip: req.ip,
    userAgent: req.get('User-Agent')
  });
  next();
});

// ======================
// API Routes
// ======================

app.use('/api/health', healthRoutes);
app.use('/api/upload', uploadRoutes);

// Setup Swagger documentation
setupSwagger(app);

// Root endpoint
app.get('/', (req, res) => {
  res.json({
    name: 'Sales Insight Automator API',
    version: '1.0.0',
    documentation: '/api-docs',
    health: '/api/health'
  });
});

// ======================
// Error Handling
// ======================

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    error: 'Endpoint not found',
    path: req.path
  });
});

// Global error handler
app.use((err, req, res, next) => {
  logger.error('Unhandled error:', err);
  
  res.status(err.status || 500).json({
    success: false,
    error: process.env.NODE_ENV === 'production' 
      ? 'Internal server error' 
      : err.message
  });
});

// ======================
// Server Startup
// ======================

app.listen(PORT, () => {
  logger.info(`🚀 Server running on port ${PORT}`);
  logger.info(`📚 API Docs available at http://localhost:${PORT}/api-docs`);
  logger.info(`🔒 CORS enabled for: ${corsOptions.origin.join(', ')}`);
  
  console.log('\n' + '='.repeat(50));
  console.log('  SALES INSIGHT AUTOMATOR - BACKEND');
  console.log('='.repeat(50));
  console.log(`  🚀 Server:  http://localhost:${PORT}`);
  console.log(`  📚 Swagger: http://localhost:${PORT}/api-docs`);
  console.log(`  💚 Health:  http://localhost:${PORT}/api/health`);
  console.log('='.repeat(50) + '\n');
});

module.exports = app;
