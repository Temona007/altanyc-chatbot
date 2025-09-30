import React, { useState, useEffect } from 'react';
import axios from 'axios';
import API_BASE_URL from '../config/api';

const PropertiesModal = ({ isOpen, onClose }) => {
  const [properties, setProperties] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (isOpen) {
      fetchProperties();
    }
  }, [isOpen]);

  const fetchProperties = async () => {
    setIsLoading(true);
    setError('');
    
    try {
      console.log('🏠 Fetching Central Park properties...');
      const response = await axios.get(`${API_BASE_URL}/api/central-park/properties`);
      
      if (response.data.success) {
        setProperties(response.data.properties);
      } else {
        throw new Error(response.data.error || 'Failed to fetch properties');
      }
    } catch (error) {
      console.error('❌ Error fetching Central Park properties:', error);
      setError('Sorry, I couldn\'t fetch the properties. Please try again later.');
    } finally {
      setIsLoading(false);
    }
  };

  const formatPrice = (price) => {
    if (!price || price === 'N/A' || price === 'NaN') return 'Price not available';
    
    // If price is already formatted as a string with $, return as is
    if (typeof price === 'string' && price.startsWith('$')) {
      return price;
    }
    
    // Convert string to number if needed
    const numericPrice = typeof price === 'string' ? parseFloat(price.replace(/[,$]/g, '')) : price;
    
    if (isNaN(numericPrice) || numericPrice <= 0) return 'Price not available';
    
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(numericPrice);
  };

  const formatPropertyType = (type) => {
    if (!type) return 'Property type not specified';
    return type.charAt(0).toUpperCase() + type.slice(1).toLowerCase();
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2 className="modal-title">Central Park Area Properties</h2>
          <button className="modal-close" onClick={onClose}>
            ×
          </button>
        </div>
        
        <div className="modal-content">
          {isLoading && (
            <div className="loading">
              <div>🏠 Loading properties...</div>
            </div>
          )}
          
          {error && (
            <div className="error">
              {error}
            </div>
          )}
          
          {!isLoading && !error && properties.length === 0 && (
            <div style={{ textAlign: 'center', color: '#666', padding: '2rem' }}>
              <p>No properties available at the moment.</p>
              <button className="btn" onClick={fetchProperties}>
                🔄 Refresh
              </button>
            </div>
          )}
          
          {!isLoading && !error && properties.length > 0 && (
            <>
              <div style={{ marginBottom: '1.5rem', color: '#666' }}>
                <p>Showing {properties.length} properties in the Central Park area</p>
              </div>
              
              <div style={{ display: 'grid', gap: '1rem' }}>
                {properties.map((property, index) => (
                  <div key={index} className="property-card">
                    <div className="property-title">
                      {property.title || `Property ${index + 1}`}
                    </div>
                    
                    <div className="property-price">
                      {formatPrice(property.price)}
                    </div>
                    
                    {property.address && (
                      <div className="property-address">
                        📍 {property.address}
                      </div>
                    )}
                    
                    <div className="property-details">
                      {property.beds && property.beds !== 'N/A' && (
                        <span>🛏️ {property.beds} bed{property.beds !== '1' ? 's' : ''}</span>
                      )}
                      {property.baths && property.baths !== 'N/A' && (
                        <span> {property.baths} bath{property.baths !== '1' ? 's' : ''}</span>
                      )}
                      {property.sqft && property.sqft !== 'N/A' && (
                        <span> • {property.sqft} sqft</span>
                      )}
                      {property.propertyType && (
                        <span> • {formatPropertyType(property.propertyType)}</span>
                      )}
                    </div>
                    
                    {property.description && (
                      <div className="property-description">
                        {property.description}
                      </div>
                    )}
                    
                    {(property.link || property.url) && (
                      <div style={{ marginTop: '1rem' }}>
                        <a 
                          href={property.link || property.url} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="btn btn-secondary"
                          style={{ fontSize: '0.875rem', padding: '0.5rem 1rem' }}
                        >
                          View Details →
                        </a>
                      </div>
                    )}
                  </div>
                ))}
              </div>
              
              <div style={{ marginTop: '2rem', textAlign: 'center' }}>
                <button className="btn btn-secondary" onClick={fetchProperties}>
                  🔄 Refresh Properties
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default PropertiesModal;
