import React, { useState, useEffect } from 'react';
import ChatInterface from './components/ChatInterface';
import FileUpload from './components/FileUpload';
import API_BASE_URL from './config/api';

function App() {
  const [activeTab, setActiveTab] = useState('chat');
  const [connectionStatus, setConnectionStatus] = useState('checking');

  useEffect(() => {
    // Check backend connection
    const checkConnection = async () => {
      try {
        const response = await fetch(`${API_BASE_URL}/api/health`);
        if (response.ok) {
          setConnectionStatus('connected');
        } else {
          setConnectionStatus('error');
        }
      } catch (error) {
        console.error('Connection check failed:', error);
        setConnectionStatus('error');
      }
    };

    checkConnection();
  }, []);

  return (
    <div className="App">
      <div className="header">
        <h1>Alta New York</h1>
        <p>AI Real Estate Assistant</p>
        <div style={{ marginTop: '1rem' }}>
          <span style={{ 
            padding: '0.5rem 1rem', 
            borderRadius: '20px', 
            backgroundColor: connectionStatus === 'connected' ? '#4caf50' : '#f44336',
            fontSize: '0.9rem'
          }}>
            {connectionStatus === 'connected' ? '🟢 Connected' : 
             connectionStatus === 'checking' ? '🟡 Checking...' : '🔴 Connection Error'}
          </span>
        </div>
      </div>

      <div className="container">
        <div className="card">
          <div style={{ marginBottom: '2rem' }}>
            <button 
              className={`btn ${activeTab === 'chat' ? '' : 'btn-secondary'}`}
              onClick={() => setActiveTab('chat')}
              style={{ marginRight: '1rem', backgroundColor: activeTab === 'chat' ? '#667eea' : '#f5f5f5', color: activeTab === 'chat' ? 'white' : '#333' }}
            >
              💬 Chat
            </button>
            <button 
              className={`btn ${activeTab === 'upload' ? '' : 'btn-secondary'}`}
              onClick={() => setActiveTab('upload')}
              style={{ backgroundColor: activeTab === 'upload' ? '#667eea' : '#f5f5f5', color: activeTab === 'upload' ? 'white' : '#333' }}
            >
              📁 Upload Files
            </button>
          </div>

          {activeTab === 'chat' && <ChatInterface />}
          {activeTab === 'upload' && <FileUpload />}
        </div>
      </div>
    </div>
  );
}

export default App;
