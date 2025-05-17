import axios from 'axios';
import { API_BASE_URL } from '../config/api.config';

/**
 * Handle API errors
 * @param {Error} error - Axios error object
 * @returns {Object} Error details
 */
const handleApiError = (error) => {
  console.error('API Error:', error);
  
  if (error.response) {
    // The request was made and the server responded with a status code
    // that falls out of the range of 2xx
    return error.response.data.message || 'Server error';
  } else if (error.request) {
    // The request was made but no response was received
    return 'No response from server. Please check your internet connection.';
  } else {
    // Something happened in setting up the request that triggered an Error
    return error.message || 'Unknown error occurred';
  }
};

/**
 * Request a password reset
 * @param {string} email - User's email address
 * @returns {Promise<Object>} Response with success status
 */
export const requestPasswordReset = async (email) => {
  try {
    const response = await axios.post(`${API_BASE_URL}/password-reset/request`, { email });
    return {
      success: true,
      data: response.data
    };
  } catch (error) {
    return {
      success: false,
      error: handleApiError(error)
    };
  }
};

/**
 * Verify a password reset token
 * @param {string} token - Password reset token
 * @returns {Promise<Object>} Response with user data if token is valid
 */
export const verifyResetToken = async (token) => {
  try {
    const response = await axios.get(`${API_BASE_URL}/password-reset/verify/${token}`);
    return {
      success: true,
      data: response.data
    };
  } catch (error) {
    return {
      success: false,
      error: handleApiError(error)
    };
  }
};

/**
 * Reset password with token
 * @param {string} token - Password reset token
 * @param {string} password - New password
 * @returns {Promise<Object>} Response with success status
 */
export const resetPassword = async (token, password) => {
  try {
    const response = await axios.post(`${API_BASE_URL}/password-reset/reset`, { token, password });
    return {
      success: true,
      data: response.data
    };
  } catch (error) {
    return {
      success: false,
      error: handleApiError(error)
    };
  }
};

export default {
  requestPasswordReset,
  verifyResetToken,
  resetPassword
};
