/**
 * Swagger/OpenAPI Configuration
 */
const swaggerJsdoc = require('swagger-jsdoc');

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Sales Insight Automator API',
      version: '1.0.0',
      description: `
## Overview
The Sales Insight Automator API allows you to upload sales data files (CSV/Excel) and receive 
AI-generated professional summaries delivered directly to your email.

## Authentication
Protected endpoints require an API key passed via the \`X-API-Key\` header.
In development mode, authentication may be disabled.

## Rate Limiting
API requests are rate-limited to prevent abuse:
- **10 requests** per **60 seconds** per IP address

## File Requirements
- **Supported formats:** CSV, XLSX, XLS
- **Maximum file size:** 10MB
- **Expected columns:** Date, Product_Category, Region, Units_Sold, Revenue, Status

## Workflow
1. Upload your sales data file via \`POST /api/upload\`
2. Provide the recipient email address
3. Receive an AI-generated executive summary in your inbox
      `,
      contact: {
        name: 'Rabbitt AI Support',
        email: 'support@rabbittai.com'
      },
      license: {
        name: 'MIT',
        url: 'https://opensource.org/licenses/MIT'
      }
    },
    servers: [
      {
        url: 'http://localhost:5000',
        description: 'Development server'
      },
      {
        url: 'https://your-production-url.com',
        description: 'Production server'
      }
    ],
    components: {
      securitySchemes: {
        ApiKeyAuth: {
          type: 'apiKey',
          in: 'header',
          name: 'X-API-Key',
          description: 'API key for authentication'
        }
      },
      schemas: {
        Error: {
          type: 'object',
          properties: {
            success: {
              type: 'boolean',
              example: false
            },
            error: {
              type: 'string',
              example: 'Error message'
            },
            details: {
              type: 'string'
            }
          }
        },
        UploadResponse: {
          type: 'object',
          properties: {
            success: {
              type: 'boolean'
            },
            message: {
              type: 'string'
            },
            summary: {
              type: 'string'
            },
            emailSent: {
              type: 'boolean'
            },
            stats: {
              type: 'object',
              properties: {
                rowsProcessed: {
                  type: 'number'
                },
                processingTimeMs: {
                  type: 'number'
                }
              }
            }
          }
        }
      }
    },
    tags: [
      {
        name: 'Health',
        description: 'Health check endpoints'
      },
      {
        name: 'Sales',
        description: 'Sales data processing endpoints'
      }
    ]
  },
  apis: ['./src/routes/*.js']
};

const swaggerSpec = swaggerJsdoc(options);

module.exports = swaggerSpec;
