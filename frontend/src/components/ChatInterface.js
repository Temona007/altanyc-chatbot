import React, { useState, useEffect, useRef } from 'react';
import { AnimatePresence } from 'framer-motion';
import {
  Send,
  Bot,
  User,
  MessageCircle,
  ArrowLeft,
  FileText,
  Home
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import ReactMarkdown from 'react-markdown';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { tomorrow } from 'react-syntax-highlighter/dist/esm/styles/prism';
import API_BASE_URL from '../config/api';

const ChatInterface = () => {
  const [messages, setMessages] = useState([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [searchMode, setSearchMode] = useState('semantic'); // 'semantic' or 'exact'
  const [showFiles, setShowFiles] = useState(false);
  const [files, setFiles] = useState([]);
  const [showCentralPark, setShowCentralPark] = useState(false);
  const [centralParkProperties, setCentralParkProperties] = useState([]);
  const [selectedProperty, setSelectedProperty] = useState(null);
  const [showPropertyModal, setShowPropertyModal] = useState(false);
  const messagesEndRef = useRef(null);
  const didInitializeRef = useRef(false);
  const lastMessageCountRef = useRef(0);
  const navigate = useNavigate();

  useEffect(() => {
    if (didInitializeRef.current) return;
    didInitializeRef.current = true;

    // Add welcome message only if not already present
    setMessages(prev => prev.length > 0 ? prev : [{
      id: Date.now(),
      type: 'bot',
      content: "Hello! I'm your Alta New York real estate AI assistant. I can help you with questions about buying, renting, selling properties in NYC, neighborhood insights, market trends, and more. How can I assist you today?",
      timestamp: new Date()
    }]);
  }, []);

  useEffect(() => {
    // Only scroll to bottom when new messages are actually added
    if (messages.length > lastMessageCountRef.current) {
      lastMessageCountRef.current = messages.length;
      // Use setTimeout to ensure DOM is updated before scrolling
      setTimeout(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
      }, 100);
    }
  }, [messages.length]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const fetchFiles = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/files`);
      const data = await response.json();
      if (data.success) {
        setFiles(data.files);
        setShowFiles(true);
      }
    } catch (error) {
      console.error('Error fetching files:', error);
    }
  };


  const fetchCentralParkProperties = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/central-park/properties`);
      const data = await response.json();
      if (data.success) {
        setCentralParkProperties(data.properties);
        setShowCentralPark(true);
        // Show success message
        setMessages(prev => [...prev, {
          id: Date.now(),
          type: 'bot',
          content: `🏞️ Found ${data.totalProperties} Central Park area properties! Last updated: ${new Date(data.fetchedAt).toLocaleString()}`,
          timestamp: new Date()
        }]);
      } else {
        console.error('Error fetching Central Park properties:', data.error);
        setMessages(prev => [...prev, {
          id: Date.now(),
          type: 'bot',
          content: `❌ Error fetching Central Park properties: ${data.error}`,
          timestamp: new Date()
        }]);
      }
    } catch (error) {
      console.error('Error fetching Central Park properties:', error);
      setMessages(prev => [...prev, {
        id: Date.now(),
        type: 'bot',
        content: `❌ Error fetching Central Park properties: ${error.message}`,
        timestamp: new Date()
      }]);
    }
  };

  const handlePropertyClick = (property) => {
    setSelectedProperty(property);
    setShowPropertyModal(true);
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!inputMessage.trim() || isLoading) return;

    const userMessage = {
      id: Date.now(),
      type: 'user',
      content: inputMessage,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    const messageToSend = inputMessage;
    setInputMessage('');
    setIsLoading(true);

    console.log('📤 Sending message via HTTP:', messageToSend);

    try {
      const response = await fetch(`${API_BASE_URL}/api/chat/message`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: messageToSend,
          searchMode
        })
      });

      const data = await response.json();
      console.log('📥 Received response:', data);

      if (data.success) {
        setMessages(prev => [...prev, {
          id: Date.now(),
          type: 'bot',
          content: data.response.message,
          sources: data.response.sources,
          timestamp: new Date()
        }]);
      } else {
        setMessages(prev => [...prev, {
          id: Date.now(),
          type: 'bot',
          content: "Sorry, I encountered an error. Please try again.",
          timestamp: new Date()
        }]);
      }
    } catch (error) {
      console.error('❌ HTTP request failed:', error);
      setMessages(prev => [...prev, {
        id: Date.now(),
        type: 'bot',
        content: "Connection error. Please refresh the page and try again.",
        timestamp: new Date()
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage(e);
    }
  };

  const MessageBubble = ({ message }) => {
    const isUser = message.type === 'user';
    
    return (
      <div
        className={`flex ${isUser ? 'justify-end' : 'justify-start'} mb-4`}
      >
        <div className={`flex items-start space-x-3 max-w-3xl ${isUser ? 'flex-row-reverse space-x-reverse' : ''}`}>
          <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${
            isUser ? 'bg-alta-navy' : 'bg-alta-gold'
          }`}>
            {isUser ? <User className="w-4 h-4 text-white" /> : <Bot className="w-4 h-4 text-white" />}
          </div>
          <div className={`rounded-2xl px-4 py-3 ${
            isUser 
              ? 'bg-alta-navy text-white' 
              : 'bg-white border border-gray-200 shadow-sm'
          }`}>
            {!isUser ? (
              <div className="prose prose-sm max-w-none">
                <ReactMarkdown
                  components={{
                    code({ node, inline, className, children, ...props }) {
                      const match = /language-(\w+)/.exec(className || '');
                      return !inline && match ? (
                        <SyntaxHighlighter
                          style={tomorrow}
                          language={match[1]}
                          PreTag="div"
                          {...props}
                        >
                          {String(children).replace(/\n$/, '')}
                        </SyntaxHighlighter>
                      ) : (
                        <code className={className} {...props}>
                          {children}
                        </code>
                      );
                    },
                  }}
                >
                  {message.content}
                </ReactMarkdown>
              </div>
            ) : (
              <p className="text-sm">{message.content}</p>
            )}
            
            {message.sources && message.sources.length > 0 && (
              <div className="mt-3 pt-3 border-t border-gray-200">
                <p className="text-xs text-gray-500 mb-2">Sources:</p>
                <div className="space-y-1">
                  {message.sources.map((source, index) => (
                    <div key={index} className="flex items-center space-x-2 text-xs text-gray-600">
                      <FileText className="w-3 h-3" />
                      <span>{source}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
            
            <div className="text-xs text-gray-400 mt-2">
              {message.timestamp.toLocaleTimeString()}
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="h-screen flex flex-col bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-4 py-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <button
              onClick={() => navigate('/')}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <ArrowLeft className="w-5 h-5 text-gray-600" />
            </button>
            <div className="flex items-center space-x-2">
              <MessageCircle className="w-6 h-6 text-alta-navy" />
              <h1 className="text-xl font-semibold text-gray-800">Alta New York AI Assistant</h1>
            </div>
          </div>
          
          <div className="flex items-center space-x-4">
            {/* Search Mode Toggle */}
            <div className="flex items-center space-x-2">
              <label className="text-sm text-gray-600">Search:</label>
              <select
                value={searchMode}
                onChange={(e) => setSearchMode(e.target.value)}
                className="text-sm border border-gray-300 rounded px-2 py-1"
              >
                <option value="semantic">Semantic</option>
                <option value="exact">Exact</option>
              </select>
            </div>
            
            {/* Files Memory Button */}
            <button
              onClick={fetchFiles}
              className="flex items-center space-x-2 px-3 py-1 rounded-lg text-sm transition-colors bg-gray-200 text-gray-600 hover:bg-gray-300"
            >
              <FileText className="w-4 h-4" />
              <span>Files</span>
            </button>


            {/* Central Park Button */}
            <button
              onClick={fetchCentralParkProperties}
              className="flex items-center space-x-2 px-3 py-1 rounded-lg text-sm transition-colors bg-green-600 text-white hover:bg-green-700"
            >
              <Home className="w-4 h-4" />
              <span>Central Park</span>
            </button>
            
            <button
              onClick={() => navigate('/upload')}
              className="btn-outline text-sm"
            >
              <FileText className="w-4 h-4 mr-1" />
              Upload
            </button>
          </div>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-4 py-6">
        <div className="max-w-4xl mx-auto">
          <AnimatePresence>
            {messages.map((message) => (
              <MessageBubble key={message.id} message={message} />
            ))}
          </AnimatePresence>
          
          {isLoading && (
            <div className="flex justify-start mb-4">
              <div className="flex items-start space-x-3">
                <div className="flex-shrink-0 w-8 h-8 rounded-full bg-alta-gold flex items-center justify-center">
                  <Bot className="w-4 h-4 text-white" />
                </div>
                <div className="bg-white border border-gray-200 rounded-2xl px-4 py-3 shadow-sm">
                  <div className="flex items-center space-x-2">
                    <div className="w-4 h-4 border-2 border-alta-navy border-t-transparent rounded-full animate-spin"></div>
                    <span className="text-sm text-gray-600">Thinking...</span>
                  </div>
                </div>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* Input */}
      <div className="bg-white border-t border-gray-200 px-4 py-4">
        <div className="max-w-4xl mx-auto">
          <form onSubmit={handleSendMessage} className="flex items-end space-x-3">
            <div className="flex-1">
              <textarea
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Ask me anything about NYC real estate, properties, neighborhoods, or market trends..."
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-alta-navy focus:border-transparent outline-none resize-none"
                rows="1"
                style={{ minHeight: '48px', maxHeight: '120px' }}
                disabled={isLoading}
              />
            </div>
            <button
              type="submit"
              disabled={!inputMessage.trim() || isLoading}
              className="btn-primary p-3 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Send className="w-5 h-5" />
            </button>
          </form>
          
          <div className="mt-2 text-xs text-gray-500">
            Press Enter to send, Shift+Enter for new line
          </div>
        </div>
      </div>

      {/* Files Modal */}
      {showFiles && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-2xl w-full mx-4 max-h-96 overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold text-gray-800">Files in Database</h2>
              <button
                onClick={() => setShowFiles(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            
            {files.length > 0 ? (
              <div className="space-y-2">
                {files.map((file, index) => (
                  <div key={index} className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                    <FileText className="w-5 h-5 text-alta-navy" />
                    <div className="flex-1">
                      <p className="font-medium text-gray-800">{file.filename}</p>
                      <p className="text-sm text-gray-500">
                        {file.chunks} chunks • {file.size}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <FileText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500">No files found in the database</p>
                <p className="text-sm text-gray-400 mt-2">Upload some files to see them here</p>
              </div>
            )}
          </div>
        </div>
      )}


      {/* Central Park Properties Modal */}
      {showCentralPark && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-6xl w-full mx-4 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-semibold text-gray-800">🏞️ Central Park Area Properties</h2>
              <button
                onClick={() => setShowCentralPark(false)}
                className="text-gray-500 hover:text-gray-700 p-2 hover:bg-gray-100 rounded-full transition-colors"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {centralParkProperties.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {centralParkProperties.map((property, index) => (
                  <div 
                    key={property.id || index} 
                    className="border border-gray-200 rounded-lg p-4 hover:shadow-lg transition-all duration-200 cursor-pointer bg-white hover:bg-gray-50"
                    onClick={() => handlePropertyClick(property)}
                  >
                    {/* Property Image */}
                    {property.photos && property.photos.length > 0 && (
                      <div className="mb-4">
                        <img 
                          src={property.photos[0].href} 
                          alt={property.title}
                          className="w-full h-48 object-cover rounded-lg"
                          onError={(e) => {
                            e.target.style.display = 'none';
                          }}
                        />
                      </div>
                    )}
                    
                    <div className="flex justify-between items-start mb-3">
                      <h3 className="text-lg font-semibold text-gray-800 line-clamp-2">{property.title}</h3>
                      <span className="text-xl font-bold text-alta-navy ml-2">{property.price}</span>
                    </div>
                    
                    <div className="text-gray-600 mb-3">
                      <p className="flex items-center text-sm">
                        <svg className="w-4 h-4 mr-2 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                        </svg>
                        <span className="line-clamp-2">{property.address}</span>
                      </p>
                    </div>
                    
                    <div className="flex items-center justify-between text-sm text-gray-500 mb-3">
                      <div className="flex items-center space-x-4">
                        <span className="flex items-center">
                          <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2H5a2 2 0 00-2-2z" />
                          </svg>
                          {property.beds} beds
                        </span>
                        <span className="flex items-center">
                          <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 14v3m4-3v3m4-3v3M3 21h18M3 10h18M3 7l9-4 9 4M4 10h16v11H4V10z" />
                          </svg>
                          {property.baths} baths
                        </span>
                        <span className="flex items-center">
                          <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4" />
                          </svg>
                          {property.sqft} sqft
                        </span>
                      </div>
                    </div>
                    
                    <div className="text-center">
                      <span className="text-alta-navy hover:text-blue-800 text-sm font-medium">
                        Click to view details →
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500">
                <p>No Central Park area properties found.</p>
                <p className="text-sm mt-2">Properties are fetched daily at 9:00 AM EST.</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Property Detail Modal */}
      {showPropertyModal && selectedProperty && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center p-6 border-b">
              <h2 className="text-2xl font-semibold text-gray-800">Property Details</h2>
              <button
                onClick={() => setShowPropertyModal(false)}
                className="text-gray-500 hover:text-gray-700 p-2 hover:bg-gray-100 rounded-full transition-colors"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            
            <div className="p-6">
              {/* Property Images */}
              {selectedProperty.photos && selectedProperty.photos.length > 0 && (
                <div className="mb-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {selectedProperty.photos.slice(0, 4).map((photo, index) => (
                      <img 
                        key={index}
                        src={photo.href} 
                        alt={`${selectedProperty.title} - Image ${index + 1}`}
                        className="w-full h-64 object-cover rounded-lg"
                        onError={(e) => {
                          e.target.style.display = 'none';
                        }}
                      />
                    ))}
                  </div>
                </div>
              )}
              
              {/* Property Info */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div>
                  <h3 className="text-2xl font-bold text-alta-navy mb-2">{selectedProperty.title}</h3>
                  <p className="text-3xl font-bold text-alta-gold mb-4">{selectedProperty.price}</p>
                  
                  <div className="space-y-3 mb-6">
                    <div className="flex items-center">
                      <svg className="w-5 h-5 mr-3 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                      <span className="text-gray-700">{selectedProperty.address}</span>
                    </div>
                  </div>
                </div>
                
                <div className="bg-gray-50 rounded-lg p-4">
                  <h4 className="text-lg font-semibold text-gray-800 mb-4">Property Details</h4>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="flex items-center">
                      <svg className="w-5 h-5 mr-2 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2H5a2 2 0 00-2-2z" />
                      </svg>
                      <div>
                        <p className="text-sm text-gray-500">Bedrooms</p>
                        <p className="font-semibold">{selectedProperty.beds}</p>
                      </div>
                    </div>
                    <div className="flex items-center">
                      <svg className="w-5 h-5 mr-2 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 14v3m4-3v3m4-3v3M3 21h18M3 10h18M3 7l9-4 9 4M4 10h16v11H4V10z" />
                      </svg>
                      <div>
                        <p className="text-sm text-gray-500">Bathrooms</p>
                        <p className="font-semibold">{selectedProperty.baths}</p>
                      </div>
                    </div>
                    <div className="flex items-center">
                      <svg className="w-5 h-5 mr-2 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4" />
                      </svg>
                      <div>
                        <p className="text-sm text-gray-500">Square Feet</p>
                        <p className="font-semibold">{selectedProperty.sqft}</p>
                      </div>
                    </div>
                    <div className="flex items-center">
                      <svg className="w-5 h-5 mr-2 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                      </svg>
                      <div>
                        <p className="text-sm text-gray-500">Property Type</p>
                        <p className="font-semibold">{selectedProperty.propertyType || 'N/A'}</p>
                      </div>
                    </div>
                  </div>
                  
                  {selectedProperty.lotSize && selectedProperty.lotSize !== 'N/A' && (
                    <div className="mt-4 pt-4 border-t">
                      <div className="flex items-center">
                        <svg className="w-5 h-5 mr-2 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        <div>
                          <p className="text-sm text-gray-500">Lot Size</p>
                          <p className="font-semibold">{selectedProperty.lotSize}</p>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
              
              {/* Additional Info */}
              <div className="mt-6 pt-6 border-t">
                <div className="flex flex-wrap gap-4 text-sm text-gray-600">
                  <span><strong>Source:</strong> {selectedProperty.source}</span>
                  <span><strong>Property ID:</strong> {selectedProperty.id}</span>
                  {selectedProperty.scrapedAt && (
                    <span><strong>Last Updated:</strong> {new Date(selectedProperty.scrapedAt).toLocaleDateString()}</span>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ChatInterface;
