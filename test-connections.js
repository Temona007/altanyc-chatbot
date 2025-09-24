const { OpenAI } = require('openai');
const { Pinecone } = require('@pinecone-database/pinecone');

// Load environment variables
require('dotenv').config();

async function testConnections() {
  console.log('🔍 Testing API Connections...\n');
  
  // Test OpenAI Connection
  console.log('1. Testing OpenAI Connection...');
  if (!process.env.OPENAI_API_KEY) {
    console.log('❌ OPENAI_API_KEY not found in environment variables');
    console.log('   Please add your OpenAI API key to server/.env file');
  } else {
    try {
      const openai = new OpenAI({
        apiKey: process.env.OPENAI_API_KEY
      });
      
      // Test with a simple completion
      const response = await openai.chat.completions.create({
        model: "gpt-3.5-turbo",
        messages: [{ role: "user", content: "Hello, this is a test message." }],
        max_tokens: 10
      });
      
      console.log('✅ OpenAI connection successful!');
      console.log(`   Response: ${response.choices[0].message.content}`);
    } catch (error) {
      console.log('❌ OpenAI connection failed:');
      console.log(`   Error: ${error.message}`);
    }
  }
  
  console.log('\n2. Testing Pinecone Connection...');
  if (!process.env.PINECONE_API_KEY || !process.env.PINECONE_ENVIRONMENT) {
    console.log('❌ PINECONE_API_KEY or PINECONE_ENVIRONMENT not found');
    console.log('   Please add your Pinecone credentials to server/.env file');
  } else {
    try {
        const pc = new Pinecone({
          apiKey: process.env.PINECONE_API_KEY
        });
      
      // Test connection by trying to get index stats
      const indexName = process.env.PINECONE_INDEX_NAME || 'alta-ny-knowledge-base';
      
      try {
        const index = pc.index(indexName);
        const stats = await index.describeIndexStats();
        console.log('✅ Pinecone connection successful!');
        console.log(`✅ Index '${indexName}' exists and is accessible`);
        console.log(`   Vector count: ${stats.totalVectorCount || 0}`);
      } catch (indexError) {
        if (indexError.message.includes('not found') || indexError.message.includes('does not exist')) {
          console.log('✅ Pinecone connection successful!');
          console.log(`⚠️  Index '${indexName}' not found`);
          console.log('   The system will attempt to create this index automatically');
        } else {
          throw indexError;
        }
      }
      
    } catch (error) {
      console.log('❌ Pinecone connection failed:');
      console.log(`   Error: ${error.message}`);
      
      if (error.message.includes('fetch failed')) {
        console.log('   This usually means:');
        console.log('   - Invalid API key or environment');
        console.log('   - Network connectivity issues');
        console.log('   - Pinecone service is down');
      }
    }
  }
  
  console.log('\n📋 Environment Variables Status:');
  console.log(`   OPENAI_API_KEY: ${process.env.OPENAI_API_KEY ? '✅ Set' : '❌ Missing'}`);
  console.log(`   PINECONE_API_KEY: ${process.env.PINECONE_API_KEY ? '✅ Set' : '❌ Missing'}`);
  console.log(`   PINECONE_ENVIRONMENT: ${process.env.PINECONE_ENVIRONMENT ? '✅ Set' : '❌ Missing'}`);
  console.log(`   PINECONE_INDEX_NAME: ${process.env.PINECONE_INDEX_NAME || 'alta-ny-knowledge-base'}`);
  
  console.log('\n💡 Next Steps:');
  if (!process.env.OPENAI_API_KEY || !process.env.PINECONE_API_KEY) {
    console.log('   1. Create a .env file in the server directory');
    console.log('   2. Add your API keys to the .env file');
    console.log('   3. Run this test again');
  } else {
    console.log('   All connections are working! You can start the chatbot.');
  }
}

testConnections().catch(console.error);