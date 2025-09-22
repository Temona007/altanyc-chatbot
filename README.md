# Alta New York Real Estate AI Assistant

A comprehensive AI-powered real estate assistant for Alta New York, built with React, Node.js, OpenAI API, LangChain, and Pinecone Database.

## Features

- **Property Search & Listings**: AI-powered property search and matching
- **Market Analysis**: Real-time NYC real estate market insights
- **Neighborhood Insights**: Detailed information about NYC neighborhoods
- **Buying & Renting Guidance**: Step-by-step assistance for property transactions
- **AI Chatbot with RAG**: Retrieval-Augmented Generation for intelligent responses
- **Expert Knowledge Base**: Access to Alta New York's real estate expertise
- **Real-time Chat Interface**: Live chat with WebSocket support
- **Modern UI/UX**: Responsive design with animations and transitions

## Tech Stack

### Frontend
- React 18
- Tailwind CSS
- Framer Motion (animations)
- Socket.IO Client
- React Router
- Axios

### Backend
- Node.js
- Express.js
- Socket.IO
- Multer (file uploads)
- OpenAI API
- LangChain
- Pinecone Database

### File Processing
- PDF-Parse (PDF processing)
- Mammoth (Word document processing)
- XLSX (Excel processing)

## Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd madco-chatbot
   ```

2. **Install dependencies**
   ```bash
   npm run install-all
   ```

3. **Set up environment variables**
   Create a `.env` file in the server directory:
   ```bash
   touch server/.env
   ```
   
   Add your API keys to `server/.env`:
   ```env
   # OpenAI Configuration
   OPENAI_API_KEY=your_openai_api_key_here
   
   # Pinecone Configuration
   PINECONE_API_KEY=your_pinecone_api_key_here
   PINECONE_ENVIRONMENT=your_pinecone_environment_here
   PINECONE_INDEX_NAME=alta-ny-knowledge-base
   
   # Server Configuration
   PORT=5000
   NODE_ENV=development
   MAX_FILE_SIZE=10485760
   ```

4. **Start the development servers**
   ```bash
   npm run dev
   ```

   This will start:
   - Backend server on http://localhost:5000
   - Frontend React app on http://localhost:3000

## Usage

### 1. Landing Page
- Visit http://localhost:3000 to see the Alta New York real estate landing page
- Learn about the company and available features
- Navigate to chat or file upload sections

### 2. File Upload
- Go to the Upload section to add real estate documents to the knowledge base
- Supported formats: PDF, DOC, DOCX, XLS, XLSX, TXT, CSV
- Files are automatically processed and indexed for search

### 3. AI Chat
- Start chatting with the Alta New York AI assistant
- Get expert guidance on NYC real estate
- Access property information and market insights
- Get real-time responses with source citations

## API Endpoints

### Upload
- `POST /api/upload` - Upload single file
- `POST /api/upload/multiple` - Upload multiple files
- `GET /api/upload/status` - Get upload status
- `DELETE /api/upload/:filename` - Delete uploaded file

### Chat
- `GET /api/chat/history/:sessionId` - Get chat history
- `DELETE /api/chat/history/:sessionId` - Clear chat history
- `POST /api/chat/message` - Process message (alternative to WebSocket)
- `GET /api/chat/translation-stats` - Get translation memory stats

### Search
- `POST /api/search/semantic` - Semantic search
- `POST /api/search/exact` - Exact text search
- `POST /api/search/hybrid` - Hybrid search (combines both)
- `GET /api/search/suggestions` - Get search suggestions
- `GET /api/search/stats` - Get index statistics

### Health
- `GET /api/health` - Health check endpoint

## WebSocket Events

### Client to Server
- `userMessage` - Send user message with options

### Server to Client
- `botResponse` - Receive AI response
- `error` - Receive error messages

## Configuration

### Environment Variables
- `OPENAI_API_KEY` - OpenAI API key for embeddings and chat
- `PINECONE_API_KEY` - Pinecone API key
- `PINECONE_ENVIRONMENT` - Pinecone environment
- `PINECONE_INDEX_NAME` - Pinecone index name
- `PORT` - Server port (default: 5000)
- `NODE_ENV` - Environment (development/production)
- `MAX_FILE_SIZE` - Maximum file size in bytes (default: 10MB)

### File Processing
- Automatic text extraction from various file formats
- Chunking for optimal vector embedding
- Metadata extraction and storage

### Vector Database
- Pinecone integration for vector storage
- Automatic embedding generation using OpenAI
- Semantic similarity search capabilities

## Development

### Project Structure
```
alta-ny-chatbot/
├── client/                 # React frontend
│   ├── src/
│   │   ├── components/     # React components
│   │   ├── App.js         # Main app component
│   │   └── index.js       # Entry point
│   ├── public/            # Static files
│   └── package.json       # Frontend dependencies
├── server/                # Node.js backend
│   ├── routes/            # API routes
│   ├── services/          # Business logic services
│   ├── uploads/           # File upload directory
│   └── index.js           # Server entry point
├── content/               # Existing Alta New York content
└── package.json           # Root package.json
```

### Available Scripts
- `npm run dev` - Start both frontend and backend
- `npm run server` - Start backend only
- `npm run client` - Start frontend only
- `npm run build` - Build frontend for production
- `npm run install-all` - Install all dependencies

## Deployment

### Production Build
1. Build the frontend:
   ```bash
   npm run build
   ```

2. Set production environment variables
3. Deploy the server with the built frontend

### Docker (Optional)
Create a Dockerfile for containerized deployment:
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

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

This project is licensed under the MIT License.

## Support

For support and questions, please contact the development team or refer to the Alta New York main website at https://altanewyork.com/

## About Alta New York

Alta New York is a premier real estate company that has been serving New York City for over 15 years. We provide:

- **Property Sales**: Expert guidance for buying and selling NYC properties
- **Rental Services**: Comprehensive rental assistance and tenant services
- **Market Analysis**: Real-time market insights and property valuations
- **Neighborhood Expertise**: Deep knowledge of NYC neighborhoods and amenities

Our experienced team of real estate professionals is committed to providing personalized service and expert guidance throughout your NYC real estate journey, backed by cutting-edge technology and comprehensive market knowledge.
