const express = require('express');
const ChatService = require('../services/ChatService');

const router = express.Router();
const chatService = new ChatService();

// Initialize chat service
chatService.initialize();

// Get chat history
router.get('/history/:sessionId', async (req, res) => {
  try {
    const { sessionId } = req.params;
    const history = await chatService.getConversationHistory(sessionId);
    
    res.json({
      success: true,
      history,
      sessionId
    });

  } catch (error) {
    console.error('Error getting chat history:', error);
    res.status(500).json({
      error: 'Failed to get chat history',
      message: error.message
    });
  }
});

// Clear chat history
router.delete('/history/:sessionId', async (req, res) => {
  try {
    const { sessionId } = req.params;
    await chatService.clearConversationHistory(sessionId);
    
    res.json({
      success: true,
      message: 'Chat history cleared'
    });

  } catch (error) {
    console.error('Error clearing chat history:', error);
    res.status(500).json({
      error: 'Failed to clear chat history',
      message: error.message
    });
  }
});

// Process message (alternative to socket.io)
router.post('/message', async (req, res) => {
  try {
    const { message, searchMode = 'semantic', translationEnabled = false, sessionId } = req.body;
    
    if (!message) {
      return res.status(400).json({
        error: 'Message is required'
      });
    }

    const response = await chatService.processMessage(message, {
      searchMode,
      translationEnabled,
      socketId: sessionId
    });

    res.json({
      success: true,
      response
    });

  } catch (error) {
    console.error('Error processing message:', error);
    res.status(500).json({
      error: 'Failed to process message',
      message: error.message
    });
  }
});

// Get translation memory stats
router.get('/translation-stats', async (req, res) => {
  try {
    const stats = await chatService.getTranslationMemoryStats();
    
    res.json({
      success: true,
      stats
    });

  } catch (error) {
    console.error('Error getting translation stats:', error);
    res.status(500).json({
      error: 'Failed to get translation stats',
      message: error.message
    });
  }
});

module.exports = router;
