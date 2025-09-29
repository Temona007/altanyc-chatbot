const { OpenAI } = require('openai');
const VectorService = require('./VectorService');
const { v4: uuidv4 } = require('uuid');

class ChatService {
  constructor() {
    this.openai = null;
    this.vectorService = new VectorService();
    this.conversationHistory = new Map(); // Store conversation history per session
    this.translationMemory = new Map(); // Store translation memory
    this.isInitialized = false;
  }

  async initialize() {
    try {
      console.log('🚀 ChatService.initialize() called');
      if (!process.env.OPENAI_API_KEY) {
        console.warn('OpenAI API key not found. Chat service will run in mock mode.');
        this.isInitialized = false;
        return;
      }

      console.log('✅ OpenAI API key found, initializing OpenAI client...');
      this.openai = new OpenAI({
        apiKey: process.env.OPENAI_API_KEY
      });

      console.log('🔍 Initializing VectorService...');
      await this.vectorService.initialize();
      console.log('✅ VectorService initialized, checking if it\'s ready...');
      console.log('VectorService isInitialized:', this.vectorService.isInitialized);
      
      this.isInitialized = true;
      console.log('✅ ChatService initialized successfully');

    } catch (error) {
      console.error('❌ ChatService initialization failed:', error);
      this.isInitialized = false;
    }
  }

  async processMessage(message, options = {}) {
    try {
      console.log('🚀 ChatService.processMessage called with:', message);
      const {
        searchMode = 'semantic',
        translationEnabled = false,
        socketId = null
      } = options;

      // Get or create conversation history for this session
      const sessionId = socketId || 'default';
      if (!this.conversationHistory.has(sessionId)) {
        this.conversationHistory.set(sessionId, []);
      }

      const history = this.conversationHistory.get(sessionId);

      // Translate message if needed
      let processedMessage = message;
      let translationUsed = false;
      
      if (translationEnabled && this.isInitialized) {
        console.log('🌐 Translation enabled, processing...');
        const translation = await this.translateMessage(message, 'en');
        if (translation.success) {
          processedMessage = translation.translatedText;
          translationUsed = true;
        }
      }

      // Search for relevant information
      console.log('🔍 Searching knowledge base...');
      const searchResults = await this.searchKnowledge(processedMessage, searchMode);
      console.log('📊 Search results:', searchResults);
      
      // Generate response using RAG
      console.log('🤖 Generating response...');
      const response = await this.generateResponse(
        processedMessage,
        searchResults,
        history,
        translationEnabled
      );
      console.log('✅ Response generated:', response);

      // Update conversation history
      history.push({
        role: 'user',
        content: message,
        timestamp: new Date().toISOString()
      });
      history.push({
        role: 'assistant',
        content: response.message,
        timestamp: new Date().toISOString()
      });

      // Keep only last 10 exchanges to manage memory
      if (history.length > 20) {
        history.splice(0, history.length - 20);
      }

      return {
        message: response.message,
        sources: response.sources,
        searchMode,
        translationUsed,
        conversationId: sessionId
      };

    } catch (error) {
      console.error('Error processing message:', error);
      return {
        message: "I'm sorry, I encountered an error processing your request. Please try again.",
        sources: [],
        searchMode: options.searchMode,
        translationUsed: false,
        error: error.message
      };
    }
  }

  async searchKnowledge(query, searchMode) {
    try {
      console.log('🔍 searchKnowledge called with query:', query, 'mode:', searchMode);
      console.log('VectorService isInitialized:', this.vectorService.isInitialized);
      
      let searchResults;
      
      if (searchMode === 'exact') {
        console.log('🔍 Using exact search...');
        searchResults = await this.vectorService.searchExact(query, { topK: 5 });
      } else {
        console.log('🔍 Using semantic search...');
        searchResults = await this.vectorService.searchSimilar(query, { topK: 5 });
      }

      console.log('📊 Search results:', searchResults);

      if (!searchResults.success) {
        console.error('❌ Search failed:', searchResults.error);
        return { results: [], sources: [] };
      }

      // Extract sources and content
      const sources = searchResults.results.map(result => 
        result.metadata.filename || 'Unknown source'
      );

      console.log('📋 Extracted sources:', sources);
      return {
        results: searchResults.results,
        sources: [...new Set(sources)] // Remove duplicates
      };

    } catch (error) {
      console.error('Knowledge search error:', error);
      return { results: [], sources: [] };
    }
  }

  async generateResponse(query, searchResults, history, translationEnabled) {
    try {
      if (!this.isInitialized) {
        return this.generateMockResponse(query, searchResults);
      }

      // Prepare context from search results
      const context = searchResults.results
        .map(result => result.metadata.content)
        .join('\n\n');

      // Prepare conversation history
      const conversationContext = history
        .slice(-6) // Last 3 exchanges
        .map(msg => `${msg.role}: ${msg.content}`)
        .join('\n');

      // Create system prompt
      const systemPrompt = `You are an AI assistant for Alta New York Real Estate, a premier NYC real estate company.

Company Information:
- Alta New York provides property sales, rental services, market analysis, and neighborhood guidance across New York City
- We have over 15 years of experience and 500+ successful transactions
- We serve clients across all five boroughs with expertise in condos, co-ops, townhouses, and rentals

Instructions:
- Provide accurate, helpful information based on the provided context
- If you don't know something, say so rather than making it up
- Be professional and friendly
- Focus on NYC real estate, neighborhoods, buying/renting steps, and market insights

Context from knowledge base:
${context}

Previous conversation:
${conversationContext}`;

      // Generate response using OpenAI
      const completion = await this.openai.chat.completions.create({
        model: 'gpt-3.5-turbo',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: query }
        ],
        max_tokens: 500,
        temperature: 0.7
      });

      let responseText = completion.choices[0].message.content;

      // Translate response back if needed
      if (translationEnabled) {
        const translation = await this.translateMessage(responseText, 'auto');
        if (translation.success) {
          responseText = translation.translatedText;
        }
      }

      return {
        message: responseText,
        sources: searchResults.sources
      };

    } catch (error) {
      console.error('Response generation error:', error);
      return {
        message: "I'm sorry, I'm having trouble generating a response right now. Please try again.",
        sources: searchResults.sources
      };
    }
  }

  generateMockResponse(query, searchResults) {
    const mockResponses = [
      "I'm a mock AI assistant for Alta New York. I can help with questions about NYC real estate, but I'm currently running in demo mode.",
      "Alta New York offers expert guidance for buying, selling, and renting properties across New York City.",
      "Ask me about steps to buying or renting in NYC, neighborhoods, and current market trends."
    ];

    const randomResponse = mockResponses[Math.floor(Math.random() * mockResponses.length)];
    
    return {
      message: randomResponse,
      sources: searchResults.sources.length > 0 ? searchResults.sources : ['Alta New York Knowledge Base']
    };
  }

  async translateMessage(text, targetLanguage) {
    try {
      if (!this.isInitialized) {
        return { success: true, translatedText: text, mock: true };
      }

      // Check translation memory first
      const memoryKey = `${text}-${targetLanguage}`;
      if (this.translationMemory.has(memoryKey)) {
        return { success: true, translatedText: this.translationMemory.get(memoryKey) };
      }

      const completion = await this.openai.chat.completions.create({
        model: 'gpt-3.5-turbo',
        messages: [
          {
            role: 'system',
            content: `Translate the following text to ${targetLanguage}. Return only the translation without any additional text or explanations.`
          },
          {
            role: 'user',
            content: text
          }
        ],
        max_tokens: 200,
        temperature: 0.3
      });

      const translatedText = completion.choices[0].message.content.trim();
      
      // Store in translation memory
      this.translationMemory.set(memoryKey, translatedText);
      
      // Limit memory size
      if (this.translationMemory.size > 1000) {
        const firstKey = this.translationMemory.keys().next().value;
        this.translationMemory.delete(firstKey);
      }

      return { success: true, translatedText };

    } catch (error) {
      console.error('Translation error:', error);
      return { success: false, error: error.message };
    }
  }

  async clearConversationHistory(sessionId) {
    if (this.conversationHistory.has(sessionId)) {
      this.conversationHistory.delete(sessionId);
    }
  }

  async getConversationHistory(sessionId) {
    return this.conversationHistory.get(sessionId) || [];
  }

  async getTranslationMemoryStats() {
    return {
      size: this.translationMemory.size,
      isInitialized: this.isInitialized
    };
  }
}

module.exports = ChatService;
