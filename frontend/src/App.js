import React, { useState, useEffect } from 'react';
import ChatInterface from './components/ChatInterface';
import PropertiesModal from './components/PropertiesModal';
import API_BASE_URL from './config/api';

function App() {
  const [connectionStatus, setConnectionStatus] = useState('checking');
  const [isPropertiesModalOpen, setIsPropertiesModalOpen] = useState(false);

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
        <h1><a href="/" style={{ color: 'inherit', textDecoration: 'none' }}>Alta New York</a></h1>
        <p>AI Real Estate Assistant</p>
        <div className="header-actions">
          <span className={`connection-status ${connectionStatus}`}>
            {connectionStatus === 'connected' ? '🟢 Connected' :
             connectionStatus === 'checking' ? '🟡 Checking...' : '🔴 Connection Error'}
          </span>
          <button
            className="btn btn-secondary"
            onClick={() => setIsPropertiesModalOpen(true)}
          >
            🏠 View Properties
          </button>
        </div>
      </div>

      <div className="container">
        <div className="card">
          <ChatInterface />
        </div>
      </div>

      <PropertiesModal
        isOpen={isPropertiesModalOpen}
        onClose={() => setIsPropertiesModalOpen(false)}
      />
    </div>
  );
}

export default App;

