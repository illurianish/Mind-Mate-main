const config = {
  apiUrl: process.env.REACT_APP_API_URL || 
    (process.env.NODE_ENV === 'production'
      ? 'https://mind-mate-fe88.onrender.com'
      : 'http://localhost:5002'),
  
  // Add timeout for API calls
  apiTimeout: 30000, // 30 seconds
  
  // Add retry configuration
  maxRetries: 3,
  retryDelay: 1000, // 1 second
};

export default config; 