import axios from 'axios';

// ✅ Set API URL to match your running backend (configure via VITE_API_URL in .env)
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5050/api';

// Create axios instance with credentials enabled for HttpOnly cookies
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true, // Enable sending/receiving cookies
});

// Request interceptor: No need to manually attach JWT (automatically sent as cookie)
api.interceptors.request.use(
  (config) => {
    // JWT is automatically sent in HttpOnly cookie by browser
    // No manual Authorization header needed
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor: handle common errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    // If server responded with a status code
    if (error.response) {
      // Unauthorized → clear session and redirect to login
      if (error.response.status === 401) {
        // Check if this is a login request - don't redirect in that case
        if (!error.config.url.includes('/auth/login')) {
          // Only clear user info (token is in HttpOnly cookie, managed by browser)
          localStorage.removeItem('user');
          // Don't redirect if already on login page
          if (!window.location.pathname.includes('/login')) {
            window.location.href = '/login';
          }
        }
      }
    } 
    // If request was made but no response received
    else if (error.request) {
      console.error('No response received from server:', error.request);
      alert(`Cannot connect to the server at ${API_BASE_URL}. Please make sure the backend is running.`);
    } 
    // Other request setup errors
    else {
      console.error('Error setting up request:', error.message);
    }

    return Promise.reject(error);
  }
);

export default api;
