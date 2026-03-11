/**
 * API Routes
 * Defines all API endpoints for the Sales Insight Automator
 */
const express = require('express');
const multer = require('multer');
const router = express.Router();

const { rateLimiter, validateApiKey, validateFile, validateEmail } = require('../middleware/security');
const fileService = require('../services/fileService');
const aiService = require('../services/aiService');
const emailService = require('../services/emailService');
const logger = require('../utils/logger');
const { config } = require('../config');

// Configure multer for file uploads (memory storage)
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: config.maxFileSizeMB * 1024 * 1024
  }
});

/**
 * @swagger
 * /api/health:
 *   get:
 *     summary: Health check endpoint
 *     description: Returns the health status of the API and its services
 *     tags: [Health]
 *     responses:
 *       200:
 *         description: Service is healthy
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 status:
 *                   type: string
 *                 version:
 *                   type: string
 *                 services:
 *                   type: object
 */
router.get('/health', async (req, res) => {
  logger.debug('Health check requested');
  
  const emailConnected = await emailService.verifyConnection();
  
  res.json({
    success: true,
    status: 'healthy',
    version: '1.0.0',
    timestamp: new Date().toISOString(),
    services: {
      api: 'operational',
      ai: config.groqApiKey ? 'configured' : 'not configured',
      email: emailConnected ? 'connected' : 'not connected'
    }
  });
});

/**
 * @swagger
 * /api/upload:
 *   post:
 *     summary: Upload sales data file
 *     description: Upload a CSV or Excel file to generate an AI-powered sales summary
 *     tags: [Sales]
 *     security:
 *       - ApiKeyAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             required:
 *               - file
 *               - email
 *             properties:
 *               file:
 *                 type: string
 *                 format: binary
 *                 description: CSV or Excel file containing sales data
 *               email:
 *                 type: string
 *                 format: email
 *                 description: Recipient email address for the summary
 *     responses:
 *       200:
 *         description: Summary generated and email sent successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *                 summary:
 *                   type: string
 *                 emailSent:
 *                   type: boolean
 *       400:
 *         description: Bad request - invalid file or email
 *       401:
 *         description: Unauthorized - missing API key
 *       413:
 *         description: File too large
 *       429:
 *         description: Too many requests
 *       500:
 *         description: Internal server error
 */
router.post('/upload',
  rateLimiter,
  validateApiKey,
  upload.single('file'),
  validateFile,
  validateEmail,
  async (req, res) => {
    const startTime = Date.now();
    const { email } = req.body;
    const file = req.file;

    logger.info('Processing upload request', {
      filename: file.originalname,
      size: file.size,
      email
    });

    try {
      // Step 1: Parse the file
      logger.info('Step 1: Parsing file...');
      const data = await fileService.parseFile(file.buffer, file.originalname);
      
      const validation = fileService.validateData(data);
      if (!validation.valid) {
        return res.status(400).json({
          success: false,
          error: 'Invalid data format',
          details: validation.warnings
        });
      }

      logger.info(`Parsed ${data.length} rows from file`);

      // Step 2: Generate AI summary
      logger.info('Step 2: Generating AI summary...');
      const summary = await aiService.generateSummary(data);
      logger.info('AI summary generated successfully');

      // Step 3: Send email
      logger.info('Step 3: Sending email...');
      let emailSent = false;
      let emailError = null;

      try {
        await emailService.sendSummary(email, summary);
        emailSent = true;
        logger.info('Email sent successfully');
      } catch (error) {
        emailError = error.message;
        logger.error('Failed to send email', { error: error.message });
      }

      const processingTime = Date.now() - startTime;
      logger.info('Request completed', { processingTime: `${processingTime}ms` });

      res.json({
        success: true,
        message: emailSent 
          ? 'Summary generated and sent to your email!' 
          : 'Summary generated but email delivery failed.',
        summary,
        emailSent,
        emailError,
        stats: {
          rowsProcessed: data.length,
          processingTimeMs: processingTime
        }
      });

    } catch (error) {
      logger.error('Upload processing failed', {
        error: error.message,
        stack: error.stack
      });

      res.status(500).json({
        success: false,
        error: 'Failed to process file',
        details: error.message
      });
    }
  }
);

/**
 * @swagger
 * /api/preview:
 *   post:
 *     summary: Preview file data
 *     description: Upload a file and preview the parsed data without generating a summary
 *     tags: [Sales]
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             required:
 *               - file
 *             properties:
 *               file:
 *                 type: string
 *                 format: binary
 *     responses:
 *       200:
 *         description: File parsed successfully
 */
router.post('/preview',
  rateLimiter,
  upload.single('file'),
  validateFile,
  async (req, res) => {
    const file = req.file;
    
    logger.info('Preview request', { filename: file.originalname });

    try {
      const data = await fileService.parseFile(file.buffer, file.originalname);
      const validation = fileService.validateData(data);

      res.json({
        success: true,
        validation,
        preview: data.slice(0, 10), // First 10 rows
        totalRows: data.length
      });

    } catch (error) {
      logger.error('Preview failed', { error: error.message });
      res.status(400).json({
        success: false,
        error: 'Failed to parse file',
        details: error.message
      });
    }
  }
);

module.exports = router;
