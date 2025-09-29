import React, { useState } from 'react';
import axios from 'axios';
import API_BASE_URL from '../config/api';

const ChatInterface = () => {
  const [messages, setMessages] = useState([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [sessionId] = useState(() => `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`);

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

  const fetchCentralParkProperties = async () => {
    setIsLoading(true);
    try {
      console.log('🏠 Fetching Central Park properties...');
      const response = await axios.get(`${API_BASE_URL}/api/central-park/properties`);
      
      if (response.data.success) {
        const properties = response.data.properties.slice(0, 5); // Show first 5 properties
        const propertiesText = properties.map(prop => 
          `🏠 ${prop.title} - ${prop.price}\n📍 ${prop.address}\n🛏️ ${prop.beds} bed, ${prop.baths} bath, ${prop.sqft} sqft`
        ).join('\n\n');

        const botMessage = {
          id: Date.now(),
          text: `Here are some Central Park area properties:\n\n${propertiesText}\n\nTotal properties available: ${response.data.totalProperties}`,
          sender: 'bot',
          timestamp: new Date().toISOString(),
          sources: ['Central Park Properties']
        };

        setMessages(prev => [...prev, botMessage]);
      } else {
        throw new Error(response.data.error || 'Failed to fetch properties');
      }
    } catch (error) {
      console.error('❌ Error fetching Central Park properties:', error);
      
      const errorMessage = {
        id: Date.now(),
        text: `Sorry, I couldn't fetch the Central Park properties. Please try again later.`,
        sender: 'bot',
        timestamp: new Date().toISOString(),
        isError: true
      };

      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div>
      <div className="chat-container">
        {messages.length === 0 && (
          <div style={{ textAlign: 'center', color: '#666', marginTop: '2rem' }}>
            <h3>Welcome to Alta New York AI Assistant!</h3>
            <p>Ask me about NYC real estate, properties, or upload documents for analysis.</p>
            <button 
              className="btn" 
              onClick={fetchCentralParkProperties}
              style={{ marginTop: '1rem' }}
            >
              🏠 View Central Park Properties
            </button>
          </div>
        )}
        
        {messages.map((message) => (
          <div key={message.id} className={`message ${message.sender}`}>
            <div style={{ fontWeight: 'bold', marginBottom: '0.5rem' }}>
              {message.sender === 'user' ? '👤 You' : '🤖 Alta AI'}
            </div>
            <div style={{ whiteSpace: 'pre-wrap' }}>{message.text}</div>
            {message.sources && message.sources.length > 0 && (
              <div style={{ marginTop: '0.5rem', fontSize: '0.9rem', color: '#666' }}>
                <strong>Sources:</strong> {message.sources.join(', ')}
              </div>
            )}
            <div style={{ fontSize: '0.8rem', color: '#999', marginTop: '0.5rem' }}>
              {new Date(message.timestamp).toLocaleTimeString()}
            </div>
          </div>
        ))}
        
        {isLoading && (
          <div className="loading">
            <div>🤖 Alta AI is thinking...</div>
          </div>
        )}
      </div>

      <div style={{ display: 'flex', gap: '1rem' }}>
        <input
          type="text"
          className="input"
          placeholder="Ask about NYC real estate..."
          value={inputMessage}
          onChange={(e) => setInputMessage(e.target.value)}
          onKeyPress={handleKeyPress}
          disabled={isLoading}
        />
        <button 
          className="btn" 
          onClick={sendMessage}
          disabled={isLoading || !inputMessage.trim()}
        >
          Send
        </button>
      </div>
    </div>
  );
};

export default ChatInterface;
