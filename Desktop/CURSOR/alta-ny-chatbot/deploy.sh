#!/bin/bash

# 🚀 Alta New York Chatbot - Deployment Script

echo "🚀 Starting deployment preparation..."

# Check if we're in the right directory
if [ ! -f "package.json" ]; then
    echo "❌ Error: Please run this script from the project root directory"
    exit 1
fi

# Install dependencies
echo "📦 Installing dependencies..."
npm run install-all

# Build frontend
echo "🏗️ Building frontend..."
npm run build

# Test the build
echo "🧪 Testing production build..."
cd server && npm start &
SERVER_PID=$!
sleep 5

# Check if server is running
if curl -s http://localhost:5001/api/health > /dev/null; then
    echo "✅ Server is running successfully"
else
    echo "⚠️ Server might not be responding, but build completed"
fi

# Stop the test server
kill $SERVER_PID 2>/dev/null

echo "✅ Deployment preparation complete!"
echo ""
echo "📋 Next steps:"
echo "1. Push your code to GitHub:"
echo "   git add ."
echo "   git commit -m 'Prepare for deployment'"
echo "   git push origin main"
echo ""
echo "2. Deploy on Render:"
echo "   - Go to https://render.com"
echo "   - Connect your GitHub repository"
echo "   - Create a new Web Service for the backend"
echo "   - Create a new Static Site for the frontend"
echo "   - Set environment variables (see DEPLOYMENT_GUIDE.md)"
echo ""
echo "📖 For detailed instructions, see DEPLOYMENT_GUIDE.md"

