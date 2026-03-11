/**
 * Email Service
 * Sends generated summaries via email using Gmail SMTP or other providers
 */
const nodemailer = require('nodemailer');
const { config } = require('../config');
const logger = require('../utils/logger');

class EmailService {
  constructor() {
    this.transporter = null;
    this.initialized = false;
    
    this.initialize();
  }

  /**
   * Initialize email transporter
   */
  initialize() {
    try {
      if (config.gmailUser && config.gmailAppPassword) {
        // Use Gmail SMTP (FREE and works with any recipient)
        this.transporter = nodemailer.createTransport({
          service: 'gmail',
          auth: {
            user: config.gmailUser,
            pass: config.gmailAppPassword
          }
        });
        this.initialized = true;
        logger.info('Email Service initialized with Gmail SMTP');
      } else if (config.resendApiKey) {
        // Use Resend SMTP
        this.transporter = nodemailer.createTransport({
          host: 'smtp.resend.com',
          port: 465,
          secure: true,
          auth: {
            user: 'resend',
            pass: config.resendApiKey
          }
        });
        this.initialized = true;
        logger.info('Email Service initialized with Resend');
      } else if (config.smtpHost) {
        // Use custom SMTP
        this.transporter = nodemailer.createTransport({
          host: config.smtpHost,
          port: config.smtpPort,
          secure: config.smtpPort === 465,
          auth: {
            user: config.smtpUser,
            pass: config.smtpPass
          }
        });
        this.initialized = true;
        logger.info('Email Service initialized with SMTP');
      } else {
        logger.warn('Email Service: No email configuration found');
      }
    } catch (error) {
      logger.error('Email Service initialization failed', { error: error.message });
    }
  }

  /**
   * Send sales summary email
   * @param {string} to - Recipient email address
   * @param {string} summary - AI-generated summary content
   * @returns {Promise<boolean>} Success status
   */
  async sendSummary(to, summary) {
    logger.info('Attempting to send email', { to });

    if (!this.initialized || !this.transporter) {
      logger.error('Email service not initialized');
      throw new Error('Email service not configured. Please set email credentials.');
    }

    const htmlContent = this.formatSummaryAsHtml(summary);
    
    // Use Gmail user as sender if configured
    const fromEmail = config.gmailUser || config.emailFrom;

    const mailOptions = {
      from: fromEmail,
      to: to,
      subject: `📊 Sales Insight Report - ${new Date().toLocaleDateString()}`,
      text: summary,
      html: htmlContent
    };

    try {
      const result = await this.transporter.sendMail(mailOptions);
      logger.info('Email sent successfully', { 
        to,
        messageId: result.messageId 
      });
      return true;
    } catch (error) {
      logger.error('Failed to send email', { 
        to,
        error: error.message,
        stack: error.stack 
      });
      throw new Error(`Failed to send email: ${error.message}`);
    }
  }

  /**
   * Format summary as HTML email
   * @param {string} summary - Plain text summary
   * @returns {string} HTML formatted email
   */
  formatSummaryAsHtml(summary) {
    // Convert markdown-style formatting to HTML
    let html = summary
      // Bold text
      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
      // Headers
      .replace(/^### (.*$)/gm, '<h3 style="color: #2563eb; margin-top: 20px;">$1</h3>')
      .replace(/^## (.*$)/gm, '<h2 style="color: #1e40af; margin-top: 24px;">$1</h2>')
      .replace(/^# (.*$)/gm, '<h1 style="color: #1e3a8a; margin-top: 28px;">$1</h1>')
      // Bullet points
      .replace(/^- (.*$)/gm, '<li>$1</li>')
      .replace(/^• (.*$)/gm, '<li>$1</li>')
      // Numbered lists
      .replace(/^\d+\. (.*$)/gm, '<li>$1</li>')
      // Line breaks
      .replace(/\n\n/g, '</p><p>')
      .replace(/\n/g, '<br>');

    // Wrap lists properly
    html = html.replace(/(<li>.*<\/li>)+/gs, '<ul style="margin-left: 20px;">$&</ul>');

    return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 800px; margin: 0 auto; padding: 20px; background-color: #f8fafc;">
  <div style="background-color: white; border-radius: 12px; padding: 32px; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">
    <div style="text-align: center; margin-bottom: 24px; padding-bottom: 24px; border-bottom: 2px solid #e2e8f0;">
      <h1 style="color: #1e40af; margin: 0;">📊 Sales Insight Report</h1>
      <p style="color: #64748b; margin-top: 8px;">Generated on ${new Date().toLocaleDateString('en-US', { 
        weekday: 'long', 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric' 
      })}</p>
    </div>
    
    <div style="color: #334155; line-height: 1.6;">
      <p>${html}</p>
    </div>
    
    <div style="margin-top: 32px; padding-top: 24px; border-top: 2px solid #e2e8f0; text-align: center; color: #94a3b8; font-size: 14px;">
      <p>Generated by Sales Insight Automator - Rabbitt AI</p>
      <p>This is an automated report. Please do not reply to this email.</p>
    </div>
  </div>
</body>
</html>`;
  }

  /**
   * Verify email service connection
   * @returns {Promise<boolean>} Connection status
   */
  async verifyConnection() {
    if (!this.transporter) {
      return false;
    }

    try {
      await this.transporter.verify();
      logger.info('Email service connection verified');
      return true;
    } catch (error) {
      logger.error('Email service connection failed', { error: error.message });
      return false;
    }
  }
}

module.exports = new EmailService();
