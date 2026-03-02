import { toast } from 'react-hot-toast';

class ApiError extends Error {
  constructor(message, statusCode, errors = null) {
    super(message);
    this.statusCode = statusCode;
    this.errors = errors;
    this.name = 'ApiError';
  }
}

/**
 * Enhanced API error handler with better categorization
 * @param {Error} error - Error object from axios
 * @param {Object} options - Options { silent, customMessage }
 * @returns {ApiError} Structured error object
 */
export const handleApiError = (error, options = {}) => {
  const { silent = false, customMessage } = options;

  if (error.response) {
    const { status, data } = error.response;
    let message = customMessage || data?.message || data?.error || data?.title || 'An error occurred';
    
    // Handle structured validation errors (400)
    if (status === 400 && data?.errors) {
      const errorMessages = Object.entries(data.errors)
        .map(([field, msgs]) => `${field}: ${Array.isArray(msgs) ? msgs.join(', ') : msgs}`);
      
      if (errorMessages.length > 0 && !silent) {
        errorMessages.forEach(msg => toast.error(msg, { duration: 4000 }));
        message = 'Validation failed';
      }
      return new ApiError(message, status, data.errors);
    }
    
    // Unauthorized (401)
    if (status === 401) {
      if (!silent) toast.error('Session expired. Please login again.');
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      if (!window.location.pathname.includes('/login')) {
        setTimeout(() => window.location.href = '/login', 1000);
      }
      return new ApiError('Unauthorized', status);
    }
    
    // Forbidden (403)
    if (status === 403) {
      if (!silent) toast.error('You do not have permission to perform this action.');
      return new ApiError('Access denied', status);
    }
    
    // Not Found (404)
    if (status === 404) {
      if (!silent) toast.error('Resource not found');
      return new ApiError('Not Found', status);
    }
    
    // Conflict (409)
    if (status === 409) {
      if (!silent) toast.error(message);
      return new ApiError(message, status);
    }
    
    // Server Error (500+)
    if (status >= 500) {
      const serverMessage = message && message !== 'An error occurred'
        ? message
        : 'Server error. Please try again later.';

      if (!silent) toast.error(serverMessage);
      return new ApiError(serverMessage, status);
    }
    
    // Default error
    if (!silent) toast.error(message);
    return new ApiError(message, status, data?.errors);
  } 
  
  // Network error
  if (error.request) {
    if (!silent) {
      toast.error('Cannot connect to server. Please check your connection.', {
        duration: 5000
      });
    }
    return new ApiError('Network error', 0);
  }
  
  // Other errors
  const message = error.message || 'An unexpected error occurred';
  if (!silent) toast.error(message);
  return new ApiError(message, 0);
};

/**
 * Format validation errors for forms
 * @param {Object} errors - Validation errors object
 * @returns {Object} Formatted errors
 */
export const formatValidationErrors = (errors) => {
  if (!errors || typeof errors !== 'object') return {};
  
  return Object.entries(errors).reduce((acc, [field, messages]) => {
    acc[field] = Array.isArray(messages) ? messages[0] : messages;
    return acc;
  }, {});
};

export default ApiError;
