const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const FileProcessingService = require('../services/FileProcessingService');
const VectorService = require('../services/VectorService');

const router = express.Router();

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadPath = path.join(__dirname, '../uploads');
    if (!fs.existsSync(uploadPath)) {
      fs.mkdirSync(uploadPath, { recursive: true });
    }
    cb(null, uploadPath);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({
  storage: storage,
  limits: {
    fileSize: parseInt(process.env.MAX_FILE_SIZE) || 10 * 1024 * 1024, // 10MB default
  },
  fileFilter: (req, file, cb) => {
    const allowedTypes = [
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'application/vnd.ms-excel',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'text/plain',
      'text/csv',
      'application/json'
    ];
    
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Invalid file type. Only PDF, DOC, DOCX, XLS, XLSX, TXT, CSV, and JSON files are allowed.'), false);
    }
  }
});

// Initialize services
const fileProcessingService = new FileProcessingService();
const vectorService = new VectorService();

// Initialize vector service
vectorService.initialize();

// Upload single file
router.post('/', upload.single('file'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    console.log('Processing file:', req.file.originalname);

    // Process the uploaded file
    const processingResult = await fileProcessingService.processFile(req.file);
    
    if (!processingResult.success) {
      // Clean up uploaded file if processing failed
      fs.unlinkSync(req.file.path);
      return res.status(400).json({ 
        error: 'File processing failed', 
        details: processingResult.error 
      });
    }

    // Generate embeddings and store in vector database
    const embeddingResult = await vectorService.storeDocument(
      processingResult.content,
      {
        filename: req.file.originalname,
        fileType: req.file.mimetype,
        fileSize: req.file.size,
        uploadDate: new Date().toISOString()
      }
    );

    if (!embeddingResult.success) {
      console.error('Embedding generation failed:', embeddingResult.error);
      // Don't delete the file, just log the error
    }

    res.json({
      success: true,
      message: 'File uploaded and processed successfully',
      file: {
        id: processingResult.id,
        originalName: req.file.originalname,
        size: req.file.size,
        type: req.file.mimetype,
        processedAt: new Date().toISOString()
      },
      processing: {
        chunks: processingResult.chunks?.length || 0,
        embeddings: embeddingResult.success ? 'Generated' : 'Failed'
      }
    });

  } catch (error) {
    console.error('Upload error:', error);
    
    // Clean up uploaded file if it exists
    if (req.file && fs.existsSync(req.file.path)) {
      fs.unlinkSync(req.file.path);
    }
    
    res.status(500).json({ 
      error: 'Upload failed', 
      message: error.message 
    });
  }
});

// Upload multiple files
router.post('/multiple', upload.array('files', 10), async (req, res) => {
  try {
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ error: 'No files uploaded' });
    }

    const results = [];
    const errors = [];

    for (const file of req.files) {
      try {
        console.log('Processing file:', file.originalname);

        const processingResult = await fileProcessingService.processFile(file);
        
        if (!processingResult.success) {
          errors.push({
            filename: file.originalname,
            error: processingResult.error
          });
          fs.unlinkSync(file.path);
          continue;
        }

        // Generate embeddings
        const embeddingResult = await vectorService.storeDocument(
          processingResult.content,
          {
            filename: file.originalname,
            fileType: file.mimetype,
            fileSize: file.size,
            uploadDate: new Date().toISOString()
          }
        );

        results.push({
          filename: file.originalname,
          success: true,
          chunks: processingResult.chunks?.length || 0,
          embeddings: embeddingResult.success ? 'Generated' : 'Failed'
        });

      } catch (error) {
        console.error(`Error processing ${file.originalname}:`, error);
        errors.push({
          filename: file.originalname,
          error: error.message
        });
        
        if (fs.existsSync(file.path)) {
          fs.unlinkSync(file.path);
        }
      }
    }

    res.json({
      success: true,
      message: `Processed ${results.length} files successfully`,
      results,
      errors: errors.length > 0 ? errors : undefined
    });

  } catch (error) {
    console.error('Multiple upload error:', error);
    res.status(500).json({ 
      error: 'Multiple upload failed', 
      message: error.message 
    });
  }
});

// Get upload status
router.get('/status', async (req, res) => {
  try {
    const uploadsDir = path.join(__dirname, '../uploads');
    const files = fs.readdirSync(uploadsDir);
    
    const fileStats = files.map(filename => {
      const filePath = path.join(uploadsDir, filename);
      const stats = fs.statSync(filePath);
      return {
        filename,
        size: stats.size,
        uploadDate: stats.birthtime,
        lastModified: stats.mtime
      };
    });

    res.json({
      success: true,
      files: fileStats,
      totalFiles: files.length
    });

  } catch (error) {
    console.error('Status check error:', error);
    res.status(500).json({ 
      error: 'Status check failed', 
      message: error.message 
    });
  }
});

// Delete uploaded file
router.delete('/:filename', async (req, res) => {
  try {
    const filename = req.params.filename;
    const filePath = path.join(__dirname, '../uploads', filename);
    
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
      res.json({ 
        success: true, 
        message: 'File deleted successfully' 
      });
    } else {
      res.status(404).json({ 
        error: 'File not found' 
      });
    }

  } catch (error) {
    console.error('Delete error:', error);
    res.status(500).json({ 
      error: 'Delete failed', 
      message: error.message 
    });
  }
});

module.exports = router;
