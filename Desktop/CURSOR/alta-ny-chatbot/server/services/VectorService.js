const { Pinecone } = require('@pinecone-database/pinecone');
const OpenAI = require('openai');
const { v4: uuidv4 } = require('uuid');

class VectorService {
  constructor() {
    this.pinecone = null;
    this.index = null;
    this.embeddings = null;
    this.isInitialized = false;
  }

  async initialize() {
    try {
      if (!process.env.PINECONE_API_KEY || !process.env.OPENAI_API_KEY) {
        console.warn('Pinecone or OpenAI API key not found. Vector service will run in mock mode.');
        this.isInitialized = false;
        return;
      }

      // Initialize Pinecone
      this.pinecone = new Pinecone({
        apiKey: process.env.PINECONE_API_KEY
      });

      // Initialize OpenAI client
      this.openai = new OpenAI({
        apiKey: process.env.OPENAI_API_KEY
      });

      // Get or create index
      const indexName = process.env.PINECONE_INDEX_NAME || 'alta-ny-knowledge-base';
      
      try {
        // Try to connect to the index directly
        this.index = this.pinecone.index(indexName);
        console.log(`Connected to Pinecone index: ${indexName}`);
      } catch (error) {
        console.log(`Index ${indexName} not found, creating new index...`);
        try {
          await this.pinecone.createIndex({
            name: indexName,
            dimension: 1024, // Your index uses 1024 dimensions
            metric: 'cosine',
            spec: {
              serverless: {
                cloud: 'aws',
                region: 'us-east-1'
              }
            }
          });
          
          // Wait for index to be ready
          await this.waitForIndexReady(indexName);
          this.index = this.pinecone.index(indexName);
          console.log(`Created and connected to new Pinecone index: ${indexName}`);
        } catch (createError) {
          console.error('Error creating Pinecone index:', createError.message);
          throw createError;
        }
      }

      this.isInitialized = true;
      console.log('VectorService initialized successfully');

    } catch (error) {
      console.error('VectorService initialization failed:', error);
      this.isInitialized = false;
    }
  }

  async waitForIndexReady(indexName, maxWaitTime = 300000) {
    const startTime = Date.now();
    
    while (Date.now() - startTime < maxWaitTime) {
      try {
        const indexDescription = await this.pinecone.describeIndex(indexName);
        if (indexDescription.status?.ready) {
          return;
        }
      } catch (error) {
        // Index might not exist yet, continue waiting
      }
      
      await new Promise(resolve => setTimeout(resolve, 5000)); // Wait 5 seconds
    }
    
    throw new Error('Index creation timeout');
  }

  // Truncate embedding to match your Pinecone index dimensions (1024)
  truncateEmbedding(embedding, targetDimensions = 1024) {
    if (embedding.length <= targetDimensions) {
      return embedding;
    }
    return embedding.slice(0, targetDimensions);
  }

  async storeDocument(content, metadata = {}) {
    try {
      if (!this.isInitialized) {
        console.log('Vector service not initialized, storing in mock mode');
        return { success: true, id: uuidv4(), mock: true };
      }

      // Generate embedding
      const response = await this.openai.embeddings.create({
        model: 'text-embedding-ada-002',
        input: content
      });
      const embedding = response.data[0].embedding;
      const truncatedEmbedding = this.truncateEmbedding(embedding, 1024);
      
      // Create vector record
      const vectorId = uuidv4();
      const vectorRecord = {
        id: vectorId,
        values: truncatedEmbedding,
        metadata: {
          content: content.substring(0, 1000), // Store first 1000 chars
          ...metadata,
          createdAt: new Date().toISOString()
        }
      };

      // Store in Pinecone
      await this.index.upsert([vectorRecord]);

      console.log(`Stored document with ID: ${vectorId}`);
      return { success: true, id: vectorId };

    } catch (error) {
      console.error('Error storing document:', error);
      return { success: false, error: error.message };
    }
  }

  async storeChunks(chunks, metadata = {}) {
    try {
      if (!this.isInitialized) {
        console.log('Vector service not initialized, storing chunks in mock mode');
        return { success: true, ids: chunks.map(() => uuidv4()), mock: true };
      }

      const vectors = [];
      
      for (let i = 0; i < chunks.length; i++) {
        const chunk = chunks[i];
        const response = await this.openai.embeddings.create({
          model: 'text-embedding-ada-002',
          input: chunk
        });
        const embedding = response.data[0].embedding;
        const truncatedEmbedding = this.truncateEmbedding(embedding, 1024);
        
        vectors.push({
          id: `${metadata.filename || 'chunk'}-${i}`,
          values: truncatedEmbedding,
          metadata: {
            content: chunk,
            chunkIndex: i,
            ...metadata,
            createdAt: new Date().toISOString()
          }
        });
      }

      // Store all vectors
      await this.index.upsert(vectors);

      console.log(`Stored ${vectors.length} chunks`);
      return { success: true, ids: vectors.map(v => v.id) };

    } catch (error) {
      console.error('Error storing chunks:', error);
      return { success: false, error: error.message };
    }
  }

  async searchSimilar(query, options = {}) {
    try {
      const {
        topK = 5,
        filter = {},
        includeMetadata = true
      } = options;

      if (!this.isInitialized) {
        console.log('Vector service not initialized, returning mock results');
        return {
          success: true,
          results: [
            {
              id: 'mock-1',
              score: 0.95,
              metadata: {
                content: 'Mock result for: ' + query,
                filename: 'mock-document.txt'
              }
            }
          ],
          mock: true
        };
      }

      // Generate query embedding
      const response = await this.openai.embeddings.create({
        model: 'text-embedding-ada-002',
        input: query
      });
      const queryEmbedding = response.data[0].embedding;
      const truncatedQueryEmbedding = this.truncateEmbedding(queryEmbedding, 1024);

      // Search in Pinecone
      const queryParams = {
        vector: truncatedQueryEmbedding,
        topK,
        includeMetadata
      };
      
      // Only add filter if it has content
      if (Object.keys(filter).length > 0) {
        queryParams.filter = filter;
      }
      
      const searchResponse = await this.index.query(queryParams);

      const results = searchResponse.matches.map(match => ({
        id: match.id,
        score: match.score,
        metadata: match.metadata
      }));

      return { success: true, results };

    } catch (error) {
      console.error('Error searching vectors:', error);
      return { success: false, error: error.message };
    }
  }

  async searchExact(query, options = {}) {
    try {
      if (!this.isInitialized) {
        console.log('Vector service not initialized, returning mock exact search results');
        return {
          success: true,
          results: [
            {
              id: 'mock-exact-1',
              score: 1.0,
              metadata: {
                content: 'Exact match for: ' + query,
                filename: 'mock-document.txt'
              }
            }
          ],
          mock: true
        };
      }

      // For exact search, we'll use a simple text matching approach
      // In a real implementation, you might want to use a full-text search engine
      const response = await this.openai.embeddings.create({
        model: 'text-embedding-ada-002',
        input: query
      });
      const queryEmbedding = response.data[0].embedding;
      const truncatedQueryEmbedding = this.truncateEmbedding(queryEmbedding, 1024);
      
      const searchResponse = await this.index.query({
        vector: truncatedQueryEmbedding,
        topK: 10,
        includeMetadata: true
      });

      // Filter results that contain exact matches
      const exactResults = searchResponse.matches.filter(match => {
        const content = match.metadata.content?.toLowerCase() || '';
        const queryLower = query.toLowerCase();
        return content.includes(queryLower);
      });

      return { success: true, results: exactResults };

    } catch (error) {
      console.error('Error in exact search:', error);
      return { success: false, error: error.message };
    }
  }

  async deleteDocument(documentId) {
    try {
      if (!this.isInitialized) {
        console.log('Vector service not initialized, mock delete');
        return { success: true, mock: true };
      }

      await this.index.deleteOne(documentId);
      return { success: true };

    } catch (error) {
      console.error('Error deleting document:', error);
      return { success: false, error: error.message };
    }
  }

  async getIndexStats() {
    try {
      if (!this.isInitialized) {
        return { success: true, stats: { totalVectors: 0, mock: true } };
      }

      const stats = await this.index.describeIndexStats();
      return { success: true, stats };

    } catch (error) {
      console.error('Error getting index stats:', error);
      return { success: false, error: error.message };
    }
  }
}

module.exports = VectorService;
