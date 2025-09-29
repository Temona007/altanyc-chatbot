const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const compression = require('compression');
const rateLimit = require('express-rate-limit');
const { createServer } = require('http');
const path = require('path');
const fs = require('fs');
require('dotenv').config();

// Import routes
const uploadRoutes = require('./routes/upload');
const chatRoutes = require('./routes/chat');
const searchRoutes = require('./routes/search');

// Import services
const ChatService = require('./services/ChatService');
const FileProcessingService = require('./services/FileProcessingService');
const VectorService = require('./services/VectorService');

const app = express();
const server = createServer(app);

// Security middleware
app.use(helmet());
app.use(compression());

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100 // limit each IP to 100 requests per windowMs
});
app.use(limiter);

// CORS configuration
const allowedOrigins = [
  'http://localhost:3000',
  'https://alta-ny-chatbot-frontend.onrender.com',
  'https://frontend.onrender.com',
  'https://alta-ny-chatbot.onrender.com',
  // Newly deployed frontend domain
  'https://altanyc-chatbot-frontend.onrender.com'
].filter(Boolean);

// Allow override via env var to avoid future deploy blocks
if (process.env.FRONTEND_ORIGIN) {
  allowedOrigins.push(process.env.FRONTEND_ORIGIN);
}

// In production, allow all Render domains to prevent CORS issues
if (process.env.NODE_ENV === 'production') {
  allowedOrigins.push(/^https:\/\/.*\.onrender\.com$/);
}

app.use(cors({
  origin: function (origin, callback) {
    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin) return callback(null, true);
    
    // In development, allow all localhost origins
    if (process.env.NODE_ENV === 'development' && origin.includes('localhost')) {
      return callback(null, true);
    }
    
    // In production, allow all Render domains
    if (process.env.NODE_ENV === 'production' && origin.includes('.onrender.com')) {
      return callback(null, true);
    }
    
    // Check if origin matches any allowed origin (string or regex)
    const isAllowed = allowedOrigins.some(allowedOrigin => {
      if (typeof allowedOrigin === 'string') {
        return allowedOrigin === origin;
      } else if (allowedOrigin instanceof RegExp) {
        return allowedOrigin.test(origin);
      }
      return false;
    });
    
    if (isAllowed) {
      callback(null, true);
    } else {
      console.log('CORS blocked origin:', origin);
      console.log('Allowed origins:', allowedOrigins);
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true
}));

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Static files
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Create uploads directory if it doesn't exist
const uploadsDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// Initialize services
const chatService = new ChatService();
const fileProcessingService = new FileProcessingService();
const vectorService = new VectorService();

// Routes
app.use('/api/upload', uploadRoutes);
app.use('/api/chat', chatRoutes);
app.use('/api/search', searchRoutes);

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    timestamp: new Date().toISOString(),
    services: {
      openai: !!process.env.OPENAI_API_KEY,
      pinecone: !!process.env.PINECONE_API_KEY
    }
  });
});

// Central Park properties endpoint
app.get('/api/central-park/properties', async (req, res) => {
  try {
    // Look for the most recent Central Park properties file
    const dataDir = path.join(__dirname, 'data');
    const files = fs.readdirSync(dataDir).filter(file => 
      file.startsWith('central_park_properties_') && file.endsWith('.json')
    );
    
    if (files.length === 0) {
      return res.json({
        success: false,
        error: 'No Central Park properties data found'
      });
    }
    
    // Get the most recent file
    const latestFile = files.sort().pop();
    const filePath = path.join(dataDir, latestFile);
    const data = JSON.parse(fs.readFileSync(filePath, 'utf8'));
    
    res.json({
      success: true,
      properties: data.properties || data,
      totalProperties: data.properties ? data.properties.length : data.length,
      latestFile: latestFile,
      fetchedAt: data.fetchedAt || new Date().toISOString(),
      source: 'Local Data File'
    });
  } catch (error) {
    console.error('Error fetching Central Park properties:', error);
    res.json({
      success: false,
      error: 'Failed to fetch Central Park properties'
    });
  }
});

// Files endpoint to show what's in the database
app.get('/api/files', async (req, res) => {
  try {
    if (!vectorService.isInitialized) {
      return res.json({ success: true, files: [] });
    }

    // Get index stats to see what's in the database
    const stats = await vectorService.index.describeIndexStats();
    
    // For now, we'll return a simple list based on what we know is uploaded
    // In a real implementation, you might want to store file metadata separately
    const files = [
      {
        filename: 'alta_ny_real_estate.txt',
        chunks: stats.totalVectorCount || 0,
        size: '~2KB'
      }
    ];

    res.json({ success: true, files });
  } catch (error) {
    console.error('Error fetching files:', error);
    res.json({ success: false, error: error.message, files: [] });
  }
});


// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Error:', err);
  res.status(500).json({
    error: 'Internal server error',
    message: process.env.NODE_ENV === 'development' ? err.message : 'Something went wrong'
  });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

const PORT = process.env.PORT || 5001;

server.listen(PORT, () => {
console.log(`🚀 Alta New York Chatbot Server running on port ${PORT}`);
  console.log(`📁 Upload directory: ${uploadsDir}`);
  console.log(`🔧 Environment: ${process.env.NODE_ENV || 'development'}`);
  
  // Initialize services
  Promise.all([
    vectorService.initialize(),
    fileProcessingService.initialize(),
    chatService.initialize()
  ]).then(() => {
    console.log('✅ All services initialized successfully');
  }).catch((error) => {
    console.error('❌ Service initialization failed:', error);
  });
});

module.exports = { app, server };
