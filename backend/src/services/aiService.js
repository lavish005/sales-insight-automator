/**
 * AI Service
 * Integrates with Groq API for generating sales summaries (FREE)
 */
const Groq = require('groq-sdk');
const { config } = require('../config');
const logger = require('../utils/logger');

class AIService {
  constructor() {
    this.groq = null;
    
    if (config.groqApiKey) {
      this.groq = new Groq({ apiKey: config.groqApiKey });
      logger.info('AI Service initialized with Groq API (FREE)');
    } else {
      logger.warn('AI Service: No Groq API key configured');
    }
  }

  /**
   * Generate a professional sales summary from data
   * @param {Array} data - Parsed sales data array
   * @returns {Promise<string>} Generated summary
   */
  async generateSummary(data) {
    logger.info('Generating AI summary', { dataRows: data.length });

    if (!this.groq) {
      logger.error('AI not initialized - missing API key');
      throw new Error('AI service not configured. Please set GROQ_API_KEY.');
    }

    try {
      // Prepare data summary for the AI
      const dataSummary = this.prepareDataSummary(data);
      
      const prompt = `You are a professional business analyst. Analyze the following sales data and create an executive summary that would be suitable for leadership review.

SALES DATA:
${dataSummary}

Please provide:
1. **Executive Summary** - A brief overview of the overall sales performance
2. **Key Metrics** - Total revenue, units sold, and other important figures
3. **Regional Performance** - Analysis by region
4. **Product Category Insights** - Performance by product category
5. **Trends & Observations** - Notable patterns or concerns
6. **Recommendations** - Actionable insights for the team

Format the response professionally with clear headings and bullet points where appropriate. Keep it concise but comprehensive.`;

      logger.debug('Sending request to Groq API');
      
      const completion = await this.groq.chat.completions.create({
        messages: [{ role: 'user', content: prompt }],
        model: 'llama-3.3-70b-versatile',
        temperature: 0.7,
        max_tokens: 2048,
      });
      
      const summary = completion.choices[0]?.message?.content || '';

      logger.info('AI summary generated successfully', { 
        summaryLength: summary.length 
      });

      return summary;
    } catch (error) {
      logger.error('AI summary generation failed:', {
        message: error.message,
        status: error.status,
      });
      throw new Error(`Failed to generate AI summary: ${error.message}`);
    }
  }

  /**
   * Prepare a structured summary of the data for the AI
   * @param {Array} data - Raw data array
   * @returns {string} Formatted data summary
   */
  prepareDataSummary(data) {
    if (!data || data.length === 0) {
      return 'No data available';
    }

    // Calculate aggregates
    const totalRevenue = data.reduce((sum, row) => sum + (parseFloat(row.Revenue) || 0), 0);
    const totalUnits = data.reduce((sum, row) => sum + (parseInt(row.Units_Sold) || 0), 0);
    
    // Group by region
    const byRegion = {};
    data.forEach(row => {
      const region = row.Region || 'Unknown';
      if (!byRegion[region]) {
        byRegion[region] = { revenue: 0, units: 0, count: 0 };
      }
      byRegion[region].revenue += parseFloat(row.Revenue) || 0;
      byRegion[region].units += parseInt(row.Units_Sold) || 0;
      byRegion[region].count++;
    });

    // Group by category
    const byCategory = {};
    data.forEach(row => {
      const category = row.Product_Category || 'Unknown';
      if (!byCategory[category]) {
        byCategory[category] = { revenue: 0, units: 0, count: 0 };
      }
      byCategory[category].revenue += parseFloat(row.Revenue) || 0;
      byCategory[category].units += parseInt(row.Units_Sold) || 0;
      byCategory[category].count++;
    });

    // Group by status
    const byStatus = {};
    data.forEach(row => {
      const status = row.Status || 'Unknown';
      byStatus[status] = (byStatus[status] || 0) + 1;
    });

    let summary = `OVERVIEW:
- Total Records: ${data.length}
- Total Revenue: $${totalRevenue.toLocaleString()}
- Total Units Sold: ${totalUnits.toLocaleString()}

BY REGION:
${Object.entries(byRegion).map(([region, stats]) => 
  `- ${region}: $${stats.revenue.toLocaleString()} revenue, ${stats.units} units, ${stats.count} transactions`
).join('\n')}

BY PRODUCT CATEGORY:
${Object.entries(byCategory).map(([category, stats]) => 
  `- ${category}: $${stats.revenue.toLocaleString()} revenue, ${stats.units} units, ${stats.count} transactions`
).join('\n')}

ORDER STATUS:
${Object.entries(byStatus).map(([status, count]) => 
  `- ${status}: ${count} orders`
).join('\n')}

RAW DATA SAMPLE (first 5 rows):
${JSON.stringify(data.slice(0, 5), null, 2)}`;

    return summary;
  }
}

module.exports = new AIService();
