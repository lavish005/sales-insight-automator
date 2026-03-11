/**
 * Winston Logger Configuration
 * Provides structured logging with timestamps and log levels
 */
const winston = require('winston');
const { config } = require('../config');

// Custom log format
const logFormat = winston.format.combine(
  winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
  winston.format.errors({ stack: true }),
  winston.format.printf(({ level, message, timestamp, stack, ...meta }) => {
    let log = `${timestamp} [${level.toUpperCase()}]: ${message}`;
    
    // Add metadata if present
    if (Object.keys(meta).length > 0) {
      log += ` ${JSON.stringify(meta)}`;
    }
    
    // Add stack trace for errors
    if (stack) {
      log += `\n${stack}`;
    }
    
    return log;
  })
);

// Console format with colors for development
const consoleFormat = winston.format.combine(
  winston.format.colorize({ all: true }),
  winston.format.timestamp({ format: 'HH:mm:ss' }),
  winston.format.printf(({ level, message, timestamp, ...meta }) => {
    let log = `${timestamp} ${level}: ${message}`;
    if (Object.keys(meta).length > 0 && !meta.stack) {
      log += ` ${JSON.stringify(meta)}`;
    }
    return log;
  })
);

// Build transports array - file transports don't work on Vercel serverless
const transports = [
  // Console transport (always enabled)
  new winston.transports.Console({
    format: config.nodeEnv === 'development' ? consoleFormat : logFormat
  })
];

// Add file transports only when NOT on Vercel (serverless has read-only filesystem)
if (!process.env.VERCEL) {
  transports.push(
    // File transport for errors
    new winston.transports.File({
      filename: 'logs/error.log',
      level: 'error',
      maxsize: 5242880, // 5MB
      maxFiles: 5
    }),
    // File transport for all logs
    new winston.transports.File({
      filename: 'logs/combined.log',
      maxsize: 5242880,
      maxFiles: 5
    })
  );
}

// Create logger instance
const logger = winston.createLogger({
  level: config.nodeEnv === 'development' ? 'debug' : 'info',
  format: logFormat,
  transports
});

// Helper methods for structured logging
logger.request = (req, message = 'Incoming request') => {
  logger.info(message, {
    method: req.method,
    url: req.originalUrl,
    ip: req.ip || req.connection?.remoteAddress,
    userAgent: req.get('user-agent')
  });
};

logger.response = (req, statusCode, message = 'Response sent') => {
  const level = statusCode >= 400 ? 'warn' : 'info';
  logger[level](message, {
    method: req.method,
    url: req.originalUrl,
    statusCode
  });
};

module.exports = logger;
