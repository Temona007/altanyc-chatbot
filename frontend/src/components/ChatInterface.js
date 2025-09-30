import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import API_BASE_URL from '../config/api';

const ChatInterface = () => {
  const [messages, setMessages] = useState([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [sessionId] = useState(() => `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`);
  const [showScrollButton, setShowScrollButton] = useState(false);
  const chatContainerRef = useRef(null);

  // Auto-scroll to bottom when messages change
  useEffect(() => {
    if (chatContainerRef.current) {
      // Use setTimeout to ensure DOM is updated
      setTimeout(() => {
        chatContainerRef.current.scrollTo({
          top: chatContainerRef.current.scrollHeight,
          behavior: 'smooth'
        });
      }, 100);
    }
  }, [messages, isLoading]);

  // Also scroll when loading state changes
  useEffect(() => {
    if (chatContainerRef.current && isLoading) {
      setTimeout(() => {
        chatContainerRef.current.scrollTo({
          top: chatContainerRef.current.scrollHeight,
          behavior: 'smooth'
        });
      }, 100);
    }
  }, [isLoading]);

  // Handle scroll events to show/hide scroll button
  useEffect(() => {
    const chatContainer = chatContainerRef.current;
    if (!chatContainer) return;

    const handleScroll = () => {
      const { scrollTop, scrollHeight, clientHeight } = chatContainer;
      const isNearBottom = scrollHeight - scrollTop - clientHeight < 100;
      setShowScrollButton(!isNearBottom && messages.length > 0);
    };

    chatContainer.addEventListener('scroll', handleScroll);
    return () => chatContainer.removeEventListener('scroll', handleScroll);
  }, [messages.length]);

  // Function to scroll to bottom
  const scrollToBottom = () => {
    if (chatContainerRef.current) {
      setTimeout(() => {
        chatContainerRef.current.scrollTo({
          top: chatContainerRef.current.scrollHeight,
          behavior: 'smooth'
        });
      }, 100);
    }
  };

  const sendMessage = async () => {
    if (!inputMessage.trim() || isLoading) return;

    const userMessage = {
      id: Date.now(),
      text: inputMessage,
      sender: 'user',
      timestamp: new Date().toISOString()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputMessage('');
    setIsLoading(true);
    
    // Scroll to bottom after adding user message
    setTimeout(() => scrollToBottom(), 150);

    try {
      console.log('📤 Sending message via HTTP:', inputMessage);
      
      const response = await axios.post(`${API_BASE_URL}/api/chat/message`, {
        message: inputMessage,
        sessionId: sessionId
      });

      console.log('✅ Response received:', response.data);

      if (response.data.success) {
        const botMessage = {
          id: Date.now() + 1,
          text: response.data.response.message,
          sender: 'bot',
          timestamp: new Date().toISOString(),
          sources: response.data.response.sources || []
        };

        setMessages(prev => [...prev, botMessage]);
        // Scroll to bottom after adding bot message
        setTimeout(() => scrollToBottom(), 150);
      } else {
        throw new Error(response.data.error || 'Unknown error');
      }
    } catch (error) {
      console.error('❌ HTTP request failed:', error);
      
      const errorMessage = {
        id: Date.now() + 1,
        text: `Sorry, I'm having trouble connecting to the server. Please try again. Error: ${error.message}`,
        sender: 'bot',
        timestamp: new Date().toISOString(),
        isError: true
      };

      setMessages(prev => [...prev, errorMessage]);
      // Scroll to bottom after adding error message
      setTimeout(() => scrollToBottom(), 150);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  return (
    <div className="chat-interface">
      <div className="chat-container" ref={chatContainerRef}>
        {messages.length === 0 && (
          <div className="welcome-message">
            <div className="welcome-icon">🏠</div>
            <h3>Welcome to Alta New York</h3>
            <p>Your AI-powered real estate assistant for NYC properties</p>
            <div className="welcome-tips">
              <div className="tip">💡 Ask about latest deals</div>
              <div className="tip">🏙️ Find properties in specific neighborhoods</div>
              <div className="tip">📊 Get market insights and trends</div>
            </div>
          </div>
        )}
        
        {messages.map((message) => (
          <div key={message.id} className={`message ${message.sender}`}>
            <div className="message-header">
              <span className="message-avatar">
                {message.sender === 'user' ? '👤' : '🏠'}
              </span>
              <span className="message-sender">
                {message.sender === 'user' ? 'You' : 'Alta AI'}
              </span>
              <span className="message-time">
                {new Date(message.timestamp).toLocaleTimeString()}
              </span>
            </div>
            <div className="message-content">{message.text}</div>
            {message.sources && message.sources.length > 0 && (
              <div className="message-sources">
                <strong>Sources:</strong> {message.sources.join(', ')}
              </div>
            )}
          </div>
        ))}
        
        {isLoading && (
          <div className="loading-message">
            <div className="loading-dots">
              <span></span>
              <span></span>
              <span></span>
            </div>
            <span>Alta AI is thinking...</span>
          </div>
        )}
        
        {/* Scroll to bottom button */}
        {showScrollButton && (
          <button 
            className="scroll-to-bottom-btn"
            onClick={scrollToBottom}
            title="Scroll to latest message"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M7 14L12 19L17 14" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </button>
        )}
      </div>

      <div className="chat-input-container">
        <div className="chat-input-wrapper">
          <input
            type="text"
            className="chat-input"
            placeholder="Ask about NYC real estate..."
            value={inputMessage}
            onChange={(e) => setInputMessage(e.target.value)}
            onKeyPress={handleKeyPress}
            disabled={isLoading}
          />
          <button 
            className="send-button" 
            onClick={sendMessage}
            disabled={isLoading || !inputMessage.trim()}
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M2.01 21L23 12L2.01 3L2 10L17 12L2 14L2.01 21Z" fill="currentColor"/>
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
};

export default ChatInterface;