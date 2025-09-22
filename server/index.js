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
const listingsRoutes = require('./routes/listings');
const listingsRapidAPIRoutes = require('./routes/listings-rapidapi');
const listingsSimpleRoutes = require('./routes/listings-simple');
const realtorAPIRoutes = require('./routes/realtor-api');
const centralParkRoutes = require('./routes/central-park');

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
app.use(cors({
  origin: process.env.NODE_ENV === 'production' 
    ? ['https://yourdomain.com'] 
    : ['http://localhost:3000'],
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
const centralParkScheduler = new (require('./services/CentralParkScheduler'))();

// Routes
app.use('/api/upload', uploadRoutes);
app.use('/api/chat', chatRoutes);
app.use('/api/search', searchRoutes);
app.use('/api/listings', listingsRoutes);
app.use('/api/listings/rapidapi', listingsRapidAPIRoutes);
app.use('/api/listings-simple', listingsSimpleRoutes);
app.use('/api/realtor', realtorAPIRoutes);
app.use('/api/central-park', centralParkRoutes);

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
    chatService.initialize(),
    centralParkScheduler.initialize()
  ]).then(() => {
    console.log('✅ All services initialized successfully');
  }).catch((error) => {
    console.error('❌ Service initialization failed:', error);
  });
});

module.exports = { app, server };
