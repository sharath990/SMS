/**
 * Message Service
 *
 * This service handles all messaging-related API calls, including:
 * - Sending messages to various target groups
 * - Fetching message history
 */

import axios from 'axios';
import { API_BASE_URL, getAuthConfig, handleApiError } from '../config/api.config';

/**
 * Send a message to recipients
 * @param {string} token - JWT authentication token
 * @param {object} messageData - Message data including content, recipients, etc.
 * @returns {Promise<object>} Response with message sending status
 */
export const sendMessage = async (token, messageData) => {
  try {
    const config = getAuthConfig(token);
    const response = await axios.post(`${API_BASE_URL}/messaging/send`, messageData, config);
    return {
      success: true,
      data: response.data
    };
  } catch (error) {
    const errorData = handleApiError(error);
    return {
      success: false,
      error: errorData
    };
  }
};

/**
 * Get message history with optional filtering
 * @param {string} token - JWT authentication token
 * @param {object} filters - Optional filters (messageType, targetType, etc.)
 * @param {number} page - Page number for pagination
 * @param {number} limit - Number of items per page
 * @param {string} sortField - Field to sort by
 * @param {number} sortOrder - Sort order (1 for ascending, -1 for descending)
 * @returns {Promise<object>} Response with message history data
 */
export const getMessageHistory = async (token, filters = {}, page = 1, limit = 10, sortField = 'createdAt', sortOrder = -1) => {
  try {
    const config = getAuthConfig(token);

    // Build query parameters
    const params = new URLSearchParams();

    // Add filters
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        params.append(key, value);
      }
    });

    // Add pagination
    params.append('page', page);
    params.append('limit', limit);

    // Add sorting
    if (sortField) {
      params.append('sortField', sortField);
      params.append('sortOrder', sortOrder);
    }

    const response = await axios.get(`${API_BASE_URL}/messages?${params.toString()}`, config);
    return {
      success: true,
      data: response.data
    };
  } catch (error) {
    const errorData = handleApiError(error);
    return {
      success: false,
      error: errorData
    };
  }
};

/**
 * Get a message by ID
 * @param {string} token - JWT authentication token
 * @param {string} messageId - ID of the message to retrieve
 * @returns {Promise<object>} Response with message data
 */
export const getMessageById = async (token, messageId) => {
  try {
    const config = getAuthConfig(token);
    const response = await axios.get(`${API_BASE_URL}/messages/${messageId}`, config);
    return {
      success: true,
      data: response.data
    };
  } catch (error) {
    const errorData = handleApiError(error);
    return {
      success: false,
      error: errorData
    };
  }
};

/**
 * Get message delivery status
 * @param {string} token - JWT authentication token
 * @param {string} messageId - ID of the message to check status
 * @returns {Promise<object>} Response with message delivery status
 */
export const getMessageDeliveryStatus = async (token, messageId) => {
  try {
    const config = getAuthConfig(token);
    const response = await axios.get(`${API_BASE_URL}/messages/${messageId}/status`, config);
    return {
      success: true,
      data: response.data
    };
  } catch (error) {
    const errorData = handleApiError(error);
    return {
      success: false,
      error: errorData
    };
  }
};

/**
 * Get message statistics
 * @param {string} token - JWT authentication token
 * @param {object} filters - Optional filters (timeRange, messageType, etc.)
 * @returns {Promise<object>} Response with message statistics
 */
export const getMessageStatistics = async (token, filters = {}) => {
  try {
    const config = getAuthConfig(token);

    // Build query parameters
    const params = new URLSearchParams();

    // Add filters
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        params.append(key, value);
      }
    });

    const response = await axios.get(`${API_BASE_URL}/messages/statistics?${params.toString()}`, config);
    return {
      success: true,
      data: response.data
    };
  } catch (error) {
    const errorData = handleApiError(error);
    return {
      success: false,
      error: errorData
    };
  }
};

export default {
  sendMessage,
  getMessageHistory,
  getMessageById,
  getMessageDeliveryStatus,
  getMessageStatistics
};
