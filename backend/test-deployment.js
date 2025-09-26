// Test file to verify deployment is working
console.log('Deployment test - VectorService imports:');
try {
  const { Pinecone } = require('@pinecone-database/pinecone');
  console.log('✅ Pinecone import successful');
} catch (error) {
  console.log('❌ Pinecone import failed:', error.message);
}

try {
  const OpenAI = require('openai');
  console.log('✅ OpenAI import successful');
} catch (error) {
  console.log('❌ OpenAI import failed:', error.message);
}

try {
  const { v4: uuidv4 } = require('uuid');
  console.log('✅ UUID import successful');
} catch (error) {
  console.log('❌ UUID import failed:', error.message);
}

// Test if LangChain is still present (should fail)
try {
  require('@langchain/openai');
  console.log('❌ LangChain still present - this should not happen!');
} catch (error) {
  console.log('✅ LangChain successfully removed:', error.message);
}

console.log('Deployment test completed');





