/**
 * API Configuration
 *
 * This file contains configuration for API calls, including base URL and default headers.
 * It also provides utility functions for creating API requests with proper authentication.
 */

import axios from 'axios';

// Base API URL
export const API_BASE_URL = 'http://localhost:5000/api';

/**
 * Create an axios instance with authentication token
 * @param {string} token - JWT authentication token
 * @returns {object} Axios instance with auth headers
 */
export const createAuthenticatedAxios = (token) => {
  return axios.create({
    baseURL: API_BASE_URL,
    headers: {
      'Content-Type': 'application/json',
      'x-auth-token': token
    }
  });
};

/**
 * Get authentication config object for axios requests
 * @param {string} token - JWT authentication token
 * @returns {object} Config object with auth headers
 */
export const getAuthConfig = (token) => {
  return {
    headers: {
      'x-auth-token': token
    }
  };
};

/**
 * Handle API errors consistently
 * @param {Error} error - Error object from axios
 * @returns {object} Standardized error object
 */
export const handleApiError = (error) => {
  let errorMessage = 'An unexpected error occurred';
  let statusCode = 500;

  console.log('handleApiError called with:', error);

  if (error.response) {
    // The request was made and the server responded with a status code
    // that falls out of the range of 2xx
    errorMessage = error.response.data?.message || 'Server returned an error';
    statusCode = error.response.status;
    console.error('API Error Response:', {
      status: error.response.status,
      statusText: error.response.statusText,
      data: error.response.data
    });
  } else if (error.request) {
    // The request was made but no response was received
    errorMessage = 'No response from server. Please check your connection.';
    console.error('API Error Request:', {
      method: error.config?.method,
      url: error.config?.url,
      requestData: error.config?.data
    });
  } else {
    // Something happened in setting up the request that triggered an Error
    errorMessage = error.message;
    console.error('API Error Message:', error.message);
  }

  const errorData = {
    message: errorMessage,
    statusCode,
    originalError: error
  };

  console.log('handleApiError returning:', errorData);

  return errorData;
};

export default {
  API_BASE_URL,
  createAuthenticatedAxios,
  getAuthConfig,
  handleApiError
};
