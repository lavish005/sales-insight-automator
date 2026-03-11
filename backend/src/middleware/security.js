/**
 * Security Middleware
 * Implements API key validation, rate limiting, and file validation
 */
const rateLimit = require('express-rate-limit');
const { config } = require('../config');
const logger = require('../utils/logger');

/**
 * Rate limiter middleware
 * Prevents abuse by limiting requests per IP
 */
const rateLimiter = rateLimit({
  windowMs: config.rateLimitWindowMs,
  max: config.rateLimitMax,
  message: {
    success: false,
    error: 'Too many requests, please try again later.',
    retryAfter: Math.ceil(config.rateLimitWindowMs / 1000)
  },
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req, res) => {
    logger.warn('Rate limit exceeded', { ip: req.ip, url: req.originalUrl });
    res.status(429).json({
      success: false,
      error: 'Too many requests, please try again later.',
      retryAfter: Math.ceil(config.rateLimitWindowMs / 1000)
    });
  }
});

/**
 * API Key validation middleware
 * Validates X-API-Key header if API_KEY is configured
 */
const validateApiKey = (req, res, next) => {
  // Skip validation if no API key is configured (development mode)
  if (!config.apiKey) {
    logger.debug('API key validation skipped - no key configured');
    return next();
  }

  const providedKey = req.headers['x-api-key'];

  if (!providedKey) {
    logger.warn('Missing API key', { ip: req.ip, url: req.originalUrl });
    return res.status(401).json({
      success: false,
      error: 'Missing API key. Include X-API-Key header.'
    });
  }

  if (providedKey !== config.apiKey) {
    logger.warn('Invalid API key attempt', { ip: req.ip, url: req.originalUrl });
    return res.status(403).json({
      success: false,
      error: 'Invalid API key.'
    });
  }

  logger.debug('API key validated successfully');
  next();
};

/**
 * File validation middleware
 * Validates file type and size
 */
const validateFile = (req, res, next) => {
  if (!req.file) {
    logger.warn('No file uploaded', { ip: req.ip });
    return res.status(400).json({
      success: false,
      error: 'No file uploaded. Please upload a .csv or .xlsx file.'
    });
  }

  const allowedMimeTypes = [
    'text/csv',
    'application/vnd.ms-excel',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
  ];

  const allowedExtensions = ['.csv', '.xlsx', '.xls'];
  const fileExtension = '.' + req.file.originalname.split('.').pop().toLowerCase();

  // Validate extension
  if (!allowedExtensions.includes(fileExtension)) {
    logger.warn('Invalid file type', { 
      filename: req.file.originalname,
      extension: fileExtension 
    });
    return res.status(400).json({
      success: false,
      error: `Invalid file type. Allowed types: ${allowedExtensions.join(', ')}`
    });
  }

  // Validate size
  const maxSize = config.maxFileSizeMB * 1024 * 1024;
  if (req.file.size > maxSize) {
    logger.warn('File too large', {
      filename: req.file.originalname,
      size: req.file.size,
      maxSize
    });
    return res.status(413).json({
      success: false,
      error: `File size exceeds ${config.maxFileSizeMB}MB limit.`
    });
  }

  logger.info('File validated', {
    filename: req.file.originalname,
    size: req.file.size,
    type: fileExtension
  });

  next();
};

/**
 * Email validation middleware
 */
const validateEmail = (req, res, next) => {
  const { email } = req.body;
  
  if (!email) {
    return res.status(400).json({
      success: false,
      error: 'Email address is required.'
    });
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return res.status(400).json({
      success: false,
      error: 'Invalid email address format.'
    });
  }

  logger.debug('Email validated', { email });
  next();
};

module.exports = {
  rateLimiter,
  validateApiKey,
  validateFile,
  validateEmail
};
