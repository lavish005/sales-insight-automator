/**
 * Application Configuration
 * Centralizes all environment variables and app settings
 */
require('dotenv').config();

const config = {
  // Server Configuration
  port: process.env.PORT || 5000,
  nodeEnv: process.env.NODE_ENV || 'development',
  
  // MongoDB Configuration
  mongoUri: process.env.MONGODB_URI || 'mongodb://localhost:27017/sales_automator',
  
  // Security
  apiKey: process.env.API_KEY || '',
  allowedOrigins: process.env.ALLOWED_ORIGINS?.split(',') || ['http://localhost:3000', 'http://localhost:5173'],
  
  // Rate Limiting
  rateLimitWindowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS) || 60000, // 1 minute
  rateLimitMax: parseInt(process.env.RATE_LIMIT_MAX) || 10,
  
  // File Upload
  maxFileSizeMB: parseInt(process.env.MAX_FILE_SIZE_MB) || 10,
  
  // AI Configuration (Groq - FREE)
  groqApiKey: process.env.GROQ_API_KEY || '',
  
  // Email Configuration - Gmail SMTP (FREE)
  gmailUser: process.env.GMAIL_USER || '',
  gmailAppPassword: process.env.GMAIL_APP_PASSWORD || '',
  
  // Alternative: Resend or custom SMTP
  resendApiKey: process.env.RESEND_API_KEY || '',
  smtpHost: process.env.SMTP_HOST || '',
  smtpPort: parseInt(process.env.SMTP_PORT) || 587,
  smtpUser: process.env.SMTP_USER || '',
  smtpPass: process.env.SMTP_PASS || '',
  emailFrom: process.env.EMAIL_FROM || 'Sales Automator <noreply@example.com>',
};

// Validation
const validateConfig = () => {
  const warnings = [];
  
  if (!config.groqApiKey) {
    warnings.push('GROQ_API_KEY not set - AI features will not work');
  }
  
  if (!config.gmailUser && !config.resendApiKey && !config.smtpHost) {
    warnings.push('No email service configured - emails will not be sent');
  }
  
  return warnings;
};

module.exports = { config, validateConfig };
