// API configuration
const API_BASE_URL = process.env.REACT_APP_API_URL || 
  (process.env.NODE_ENV === 'production' 
    ? 'https://backend.onrender.com' 
    : 'http://localhost:5001');

export default API_BASE_URL;



