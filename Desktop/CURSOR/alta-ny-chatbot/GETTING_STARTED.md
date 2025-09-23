# Getting Started with MadCo Transportation AI Chatbot

## Quick Start Guide

### 1. Prerequisites
- Node.js (v18 or higher)
- npm or yarn
- OpenAI API key
- Pinecone API key (optional - app works in mock mode without it)

### 2. Installation

```bash
# Clone or navigate to the project directory
cd madco-chatbot

# Run the setup script
npm run setup

# Install all dependencies
npm run install-all
```

### 3. Configuration

Edit `server/.env` file with your API keys:

```env
# Required for full functionality
OPENAI_API_KEY=your_openai_api_key_here

# Optional - app works in mock mode without Pinecone
PINECONE_API_KEY=your_pinecone_api_key_here
PINECONE_ENVIRONMENT=your_pinecone_environment_here
PINECONE_INDEX_NAME=madco-knowledge-base

# Server settings
PORT=5000
NODE_ENV=development
MAX_FILE_SIZE=10485760
```

### 4. Start the Application

```bash
# Start both frontend and backend
npm run dev
```

This will start:
- Backend server: http://localhost:5000
- Frontend app: http://localhost:3000

### 5. Process Existing Content (Optional)

```bash
# Process the existing MadCo content files
npm run process-content
```

## Features Overview

### 🏠 Landing Page
- Modern, responsive design with MadCo branding
- Company information and service overview
- Navigation to chat and upload features

### 💬 AI Chat Interface
- Real-time chat with WebSocket support
- Semantic and exact search modes
- Translation support
- Source citations
- Conversation history

### 📁 File Upload System
- Support for PDF, DOC, DOCX, XLS, XLSX, TXT, CSV
- Drag and drop interface
- Progress tracking
- Automatic text extraction and processing

### 🔍 Search Capabilities
- **Semantic Search**: AI-powered understanding of meaning
- **Exact Search**: Traditional text matching
- **Hybrid Search**: Combines both approaches
- Vector embeddings with Pinecone

### 🌐 Translation Memory
- Multi-language support
- Intelligent translation caching
- Consistent terminology

## API Endpoints

### Health Check
```bash
curl http://localhost:5000/api/health
```

### Upload File
```bash
curl -X POST -F "file=@document.pdf" http://localhost:5000/api/upload
```

### Search
```bash
curl -X POST -H "Content-Type: application/json" \
  -d '{"query": "transportation services", "topK": 5}' \
  http://localhost:5000/api/search/semantic
```

## Development

### Project Structure
```
madco-chatbot/
├── client/                 # React frontend
│   ├── src/components/    # UI components
│   ├── src/App.js         # Main app
│   └── package.json       # Frontend deps
├── server/                # Node.js backend
│   ├── routes/            # API routes
│   ├── services/          # Business logic
│   ├── scripts/           # Utility scripts
│   └── index.js           # Server entry
├── content/               # Existing MadCo files
└── README.md              # Full documentation
```

### Available Scripts
- `npm run dev` - Start development servers
- `npm run server` - Backend only
- `npm run client` - Frontend only
- `npm run build` - Production build
- `npm run setup` - Initial setup
- `npm run process-content` - Process existing files

## Troubleshooting

### Common Issues

1. **Port already in use**
   ```bash
   # Change port in server/.env
   PORT=5001
   ```

2. **API key errors**
   - Ensure your OpenAI API key is valid
   - Check Pinecone credentials if using vector search

3. **File upload fails**
   - Check file size limits
   - Ensure file type is supported
   - Verify uploads directory exists

4. **Socket connection issues**
   - Check CORS settings
   - Verify WebSocket support
   - Check firewall settings

### Mock Mode
The application runs in mock mode when API keys are not configured:
- Chat responses are pre-generated
- File processing works locally
- Vector search returns mock results
- Translation is simulated

## Production Deployment

### Build for Production
```bash
npm run build
```

### Environment Variables
Set production environment variables:
- `NODE_ENV=production`
- Valid API keys
- Production database URLs

### Docker Deployment
```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build
EXPOSE 5000
CMD ["npm", "start"]
```

## Support

For issues and questions:
1. Check the README.md for detailed documentation
2. Review the API endpoints and WebSocket events
3. Check server logs for error details
4. Verify environment configuration

## About MadCo Transportation

MadCo Transportation is a professional transportation and logistics company providing:
- Asset-based transportation services
- Brokerage services
- Equipment services
- Nationwide coverage

Visit https://madcotransportation.com/ for more information.
