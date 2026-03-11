/**
 * File Processing Service
 * Handles parsing of CSV and Excel files
 */
const Papa = require('papaparse');
const XLSX = require('xlsx');
const logger = require('../utils/logger');

class FileService {
  /**
   * Parse uploaded file based on type
   * @param {Buffer} buffer - File buffer
   * @param {string} filename - Original filename
   * @returns {Promise<Array>} Parsed data array
   */
  async parseFile(buffer, filename) {
    const extension = filename.split('.').pop().toLowerCase();
    
    logger.info('Parsing file', { filename, extension });

    try {
      let data;
      
      switch (extension) {
        case 'csv':
          data = await this.parseCSV(buffer);
          break;
        case 'xlsx':
        case 'xls':
          data = this.parseExcel(buffer);
          break;
        default:
          throw new Error(`Unsupported file type: ${extension}`);
      }

      logger.info('File parsed successfully', { 
        filename, 
        rowCount: data.length,
        columns: data.length > 0 ? Object.keys(data[0]) : []
      });

      return data;
    } catch (error) {
      logger.error('File parsing failed', { 
        filename, 
        error: error.message 
      });
      throw error;
    }
  }

  /**
   * Parse CSV file
   * @param {Buffer} buffer - CSV file buffer
   * @returns {Promise<Array>} Parsed data
   */
  async parseCSV(buffer) {
    return new Promise((resolve, reject) => {
      const csvString = buffer.toString('utf-8');
      
      Papa.parse(csvString, {
        header: true,
        skipEmptyLines: true,
        transformHeader: (header) => header.trim(),
        transform: (value) => value.trim(),
        complete: (results) => {
          if (results.errors.length > 0) {
            logger.warn('CSV parsing warnings', { errors: results.errors });
          }
          
          logger.debug('CSV parsed', { 
            rows: results.data.length,
            fields: results.meta.fields 
          });
          
          resolve(results.data);
        },
        error: (error) => {
          logger.error('CSV parsing error', { error: error.message });
          reject(new Error(`Failed to parse CSV: ${error.message}`));
        }
      });
    });
  }

  /**
   * Parse Excel file
   * @param {Buffer} buffer - Excel file buffer
   * @returns {Array} Parsed data
   */
  parseExcel(buffer) {
    try {
      const workbook = XLSX.read(buffer, { type: 'buffer' });
      
      // Get the first sheet
      const sheetName = workbook.SheetNames[0];
      if (!sheetName) {
        throw new Error('Excel file has no sheets');
      }

      const sheet = workbook.Sheets[sheetName];
      
      // Convert to JSON
      const data = XLSX.utils.sheet_to_json(sheet, {
        defval: '',
        raw: false
      });

      logger.debug('Excel parsed', { 
        sheetName,
        rows: data.length,
        columns: data.length > 0 ? Object.keys(data[0]) : []
      });

      return data;
    } catch (error) {
      logger.error('Excel parsing error', { error: error.message });
      throw new Error(`Failed to parse Excel file: ${error.message}`);
    }
  }

  /**
   * Validate parsed data structure
   * @param {Array} data - Parsed data
   * @returns {Object} Validation result
   */
  validateData(data) {
    const result = {
      valid: true,
      rowCount: 0,
      columns: [],
      warnings: []
    };

    if (!Array.isArray(data)) {
      result.valid = false;
      result.warnings.push('Data is not an array');
      return result;
    }

    if (data.length === 0) {
      result.valid = false;
      result.warnings.push('File contains no data rows');
      return result;
    }

    result.rowCount = data.length;
    result.columns = Object.keys(data[0]);

    // Check for expected sales columns
    const expectedColumns = ['Date', 'Product_Category', 'Region', 'Units_Sold', 'Revenue'];
    const missingColumns = expectedColumns.filter(col => 
      !result.columns.some(c => c.toLowerCase().includes(col.toLowerCase()))
    );

    if (missingColumns.length > 0) {
      result.warnings.push(`Missing expected columns: ${missingColumns.join(', ')}`);
    }

    logger.info('Data validation complete', result);
    return result;
  }
}

module.exports = new FileService();
