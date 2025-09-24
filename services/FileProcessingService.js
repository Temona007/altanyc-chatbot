const fs = require('fs');
const path = require('path');
const pdfParse = require('pdf-parse');
const mammoth = require('mammoth');
const XLSX = require('xlsx');
const { v4: uuidv4 } = require('uuid');

class FileProcessingService {
  constructor() {
    this.supportedTypes = {
      'application/pdf': this.processPDF.bind(this),
      'application/msword': this.processWord.bind(this),
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document': this.processWord.bind(this),
      'application/vnd.ms-excel': this.processExcel.bind(this),
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': this.processExcel.bind(this),
      'text/plain': this.processText.bind(this),
      'text/csv': this.processCSV.bind(this),
      'application/json': this.processJSON.bind(this)
    };
  }

  async initialize() {
    console.log('FileProcessingService initialized');
  }

  async processFile(file) {
    try {
      const fileType = file.mimetype;
      const processor = this.supportedTypes[fileType];

      if (!processor) {
        throw new Error(`Unsupported file type: ${fileType}`);
      }

      console.log(`Processing ${fileType} file: ${file.originalname}`);
      const content = await processor(file.path);
      
      if (!content || content.trim().length === 0) {
        throw new Error('No content extracted from file');
      }

      // Split content into chunks for better processing
      const chunks = this.splitIntoChunks(content);
      
      return {
        success: true,
        id: uuidv4(),
        content,
        chunks,
        metadata: {
          originalName: file.originalname,
          fileType,
          fileSize: file.size,
          chunkCount: chunks.length,
          processedAt: new Date().toISOString()
        }
      };

    } catch (error) {
      console.error('File processing error:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  async processPDF(filePath) {
    try {
      const dataBuffer = fs.readFileSync(filePath);
      const data = await pdfParse(dataBuffer);
      return data.text;
    } catch (error) {
      throw new Error(`PDF processing failed: ${error.message}`);
    }
  }

  async processWord(filePath) {
    try {
      const result = await mammoth.extractRawText({ path: filePath });
      return result.value;
    } catch (error) {
      throw new Error(`Word document processing failed: ${error.message}`);
    }
  }

  async processExcel(filePath) {
    try {
      const workbook = XLSX.readFile(filePath);
      let content = '';

      workbook.SheetNames.forEach(sheetName => {
        const worksheet = workbook.Sheets[sheetName];
        const sheetData = XLSX.utils.sheet_to_csv(worksheet);
        content += `Sheet: ${sheetName}\n${sheetData}\n\n`;
      });

      return content;
    } catch (error) {
      throw new Error(`Excel processing failed: ${error.message}`);
    }
  }

  async processText(filePath) {
    try {
      return fs.readFileSync(filePath, 'utf8');
    } catch (error) {
      throw new Error(`Text file processing failed: ${error.message}`);
    }
  }

  async processCSV(filePath) {
    try {
      const content = fs.readFileSync(filePath, 'utf8');
      // Convert CSV to a more readable format
      const lines = content.split('\n');
      const processedLines = lines.map((line, index) => {
        if (index === 0) {
          return `Headers: ${line}`;
        }
        return `Row ${index}: ${line}`;
      });
      return processedLines.join('\n');
    } catch (error) {
      throw new Error(`CSV processing failed: ${error.message}`);
    }
  }

  async processJSON(filePath) {
    try {
      const content = fs.readFileSync(filePath, 'utf8');
      
      // Parse JSON to validate it's valid
      const jsonData = JSON.parse(content);
      
      // Convert JSON to a more readable text format
      let processedContent = '';
      
      if (Array.isArray(jsonData)) {
        // Handle JSON arrays - limit to first 50 items for large arrays
        const maxItems = Math.min(jsonData.length, 50);
        processedContent = `JSON Array with ${jsonData.length} items (showing first ${maxItems}):\n\n`;
        
        for (let i = 0; i < maxItems; i++) {
          processedContent += `Item ${i + 1}:\n`;
          processedContent += this.formatJSONObject(jsonData[i], 1);
          processedContent += '\n\n';
        }
        
        if (jsonData.length > 50) {
          processedContent += `... and ${jsonData.length - 50} more items\n`;
        }
      } else if (typeof jsonData === 'object' && jsonData !== null) {
        // Handle JSON objects - check if it's a Central Park properties file
        if (jsonData.properties && Array.isArray(jsonData.properties)) {
          // Special handling for Central Park properties files
          const maxProperties = Math.min(jsonData.properties.length, 20);
          processedContent = `Central Park Properties Database:\n`;
          processedContent += `Total Properties: ${jsonData.properties.length}\n`;
          processedContent += `Fetched: ${jsonData.fetchedAt || 'Unknown'}\n`;
          processedContent += `Source: ${jsonData.source || 'Unknown'}\n\n`;
          processedContent += `Sample Properties (showing first ${maxProperties}):\n\n`;
          
          for (let i = 0; i < maxProperties; i++) {
            const prop = jsonData.properties[i];
            processedContent += `Property ${i + 1}:\n`;
            processedContent += `  Title: ${prop.title || 'N/A'}\n`;
            processedContent += `  Price: ${prop.price || 'N/A'}\n`;
            processedContent += `  Address: ${prop.address || 'N/A'}\n`;
            processedContent += `  Beds: ${prop.beds || 'N/A'}, Baths: ${prop.baths || 'N/A'}\n`;
            processedContent += `  Square Feet: ${prop.sqft || 'N/A'}\n\n`;
          }
          
          if (jsonData.properties.length > 20) {
            processedContent += `... and ${jsonData.properties.length - 20} more properties\n`;
          }
        } else {
          // Regular JSON object
          processedContent = 'JSON Object:\n\n';
          processedContent += this.formatJSONObject(jsonData, 0);
        }
      } else {
        // Handle primitive values
        processedContent = `JSON Value: ${JSON.stringify(jsonData)}`;
      }
      
      return processedContent;
    } catch (error) {
      if (error instanceof SyntaxError) {
        throw new Error(`Invalid JSON format: ${error.message}`);
      }
      throw new Error(`JSON processing failed: ${error.message}`);
    }
  }

  formatJSONObject(obj, indentLevel = 0) {
    const indent = '  '.repeat(indentLevel);
    let result = '';
    
    for (const [key, value] of Object.entries(obj)) {
      if (typeof value === 'object' && value !== null) {
        if (Array.isArray(value)) {
          result += `${indent}${key}: Array with ${value.length} items\n`;
          value.forEach((item, index) => {
            if (typeof item === 'object' && item !== null) {
              result += `${indent}  [${index}]:\n`;
              result += this.formatJSONObject(item, indentLevel + 2);
            } else {
              result += `${indent}  [${index}]: ${JSON.stringify(item)}\n`;
            }
          });
        } else {
          result += `${indent}${key}:\n`;
          result += this.formatJSONObject(value, indentLevel + 1);
        }
      } else {
        result += `${indent}${key}: ${JSON.stringify(value)}\n`;
      }
    }
    
    return result;
  }

  splitIntoChunks(text, chunkSize = 1000, overlap = 200) {
    if (!text || text.length <= chunkSize) {
      return [text];
    }

    const chunks = [];
    let start = 0;

    while (start < text.length) {
      let end = start + chunkSize;
      
      // Try to break at sentence boundary
      if (end < text.length) {
        const lastPeriod = text.lastIndexOf('.', end);
        const lastNewline = text.lastIndexOf('\n', end);
        const breakPoint = Math.max(lastPeriod, lastNewline);
        
        if (breakPoint > start + chunkSize * 0.5) {
          end = breakPoint + 1;
        }
      }

      const chunk = text.slice(start, end).trim();
      if (chunk.length > 0) {
        chunks.push(chunk);
      }

      start = end - overlap;
    }

    return chunks;
  }

  // Process existing MadCo content files
  async processExistingContent() {
    try {
      const contentDir = path.join(__dirname, '../../content');
      const files = fs.readdirSync(contentDir);
      
      const results = [];
      
      for (const filename of files) {
        const filePath = path.join(contentDir, filename);
        const stats = fs.statSync(filePath);
        
        if (stats.isFile()) {
          try {
            // Create a mock file object for processing
            const mockFile = {
              path: filePath,
              originalname: filename,
              mimetype: this.getMimeType(filename),
              size: stats.size
            };

            const result = await this.processFile(mockFile);
            if (result.success) {
              results.push({
                filename,
                success: true,
                chunks: result.chunks.length,
                content: result.content.substring(0, 200) + '...'
              });
            } else {
              results.push({
                filename,
                success: false,
                error: result.error
              });
            }
          } catch (error) {
            results.push({
              filename,
              success: false,
              error: error.message
            });
          }
        }
      }

      return results;
    } catch (error) {
      console.error('Error processing existing content:', error);
      return [];
    }
  }

  getMimeType(filename) {
    const ext = path.extname(filename).toLowerCase();
    const mimeTypes = {
      '.pdf': 'application/pdf',
      '.doc': 'application/msword',
      '.docx': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      '.xls': 'application/vnd.ms-excel',
      '.xlsx': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      '.txt': 'text/plain',
      '.csv': 'text/csv',
      '.json': 'application/json'
    };
    return mimeTypes[ext] || 'text/plain';
  }
}

module.exports = FileProcessingService;
