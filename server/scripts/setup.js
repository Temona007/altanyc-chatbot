const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

console.log('🚀 Setting up MadCo Transportation AI Chatbot...\n');

// Check if .env file exists
const envPath = path.join(__dirname, '../.env');
if (!fs.existsSync(envPath)) {
  console.log('📝 Creating .env file from template...');
  const envExamplePath = path.join(__dirname, '../.env.example');
  if (fs.existsSync(envExamplePath)) {
    fs.copyFileSync(envExamplePath, envPath);
    console.log('✅ .env file created. Please edit it with your API keys.');
  } else {
    console.log('⚠️  .env.example not found. Creating basic .env file...');
    const basicEnv = `# OpenAI Configuration
OPENAI_API_KEY=your_openai_api_key_here

# Pinecone Configuration
PINECONE_API_KEY=your_pinecone_api_key_here
PINECONE_ENVIRONMENT=your_pinecone_environment_here
PINECONE_INDEX_NAME=madco-knowledge-base

# Server Configuration
PORT=5000
NODE_ENV=development

# File Upload Configuration
MAX_FILE_SIZE=10485760
UPLOAD_PATH=./uploads
`;
    fs.writeFileSync(envPath, basicEnv);
    console.log('✅ Basic .env file created. Please edit it with your API keys.');
  }
} else {
  console.log('✅ .env file already exists.');
}

// Create uploads directory
const uploadsDir = path.join(__dirname, '../uploads');
if (!fs.existsSync(uploadsDir)) {
  console.log('📁 Creating uploads directory...');
  fs.mkdirSync(uploadsDir, { recursive: true });
  console.log('✅ Uploads directory created.');
} else {
  console.log('✅ Uploads directory already exists.');
}

// Check if node_modules exists
const nodeModulesPath = path.join(__dirname, '../node_modules');
if (!fs.existsSync(nodeModulesPath)) {
  console.log('📦 Installing server dependencies...');
  try {
    execSync('npm install', { cwd: path.join(__dirname, '..'), stdio: 'inherit' });
    console.log('✅ Server dependencies installed.');
  } catch (error) {
    console.error('❌ Failed to install server dependencies:', error.message);
  }
} else {
  console.log('✅ Server dependencies already installed.');
}

// Check client dependencies
const clientNodeModulesPath = path.join(__dirname, '../../client/node_modules');
if (!fs.existsSync(clientNodeModulesPath)) {
  console.log('📦 Installing client dependencies...');
  try {
    execSync('npm install', { cwd: path.join(__dirname, '../../client'), stdio: 'inherit' });
    console.log('✅ Client dependencies installed.');
  } catch (error) {
    console.error('❌ Failed to install client dependencies:', error.message);
  }
} else {
  console.log('✅ Client dependencies already installed.');
}

console.log('\n🎉 Setup completed!');
console.log('\n📋 Next steps:');
console.log('1. Edit server/.env with your API keys');
console.log('2. Run: npm run dev');
console.log('3. Visit: http://localhost:3000');
console.log('\n📚 For more information, see README.md');
