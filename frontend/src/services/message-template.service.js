/**
 * Message Template Service
 * 
 * This service handles all message template-related API calls, including:
 * - Fetching message templates (with filtering, pagination, etc.)
 * - Creating, updating, and deleting message templates
 */

import axios from 'axios';
import { API_BASE_URL, getAuthConfig, handleApiError } from '../config/api.config';

/**
 * Get all message templates with optional filtering
 * @param {string} token - JWT authentication token
 * @param {object} filters - Optional filters (category, etc.)
 * @param {number} page - Page number for pagination
 * @param {number} limit - Number of items per page
 * @param {string} sortField - Field to sort by
 * @param {number} sortOrder - Sort order (1 for ascending, -1 for descending)
 * @returns {Promise<object>} Response with message templates data
 */
export const getMessageTemplates = async (token, filters = {}, page = 1, limit = 10, sortField = 'name', sortOrder = 1) => {
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
    
    const response = await axios.get(`${API_BASE_URL}/message-templates?${params.toString()}`, config);
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
 * Get a message template by ID
 * @param {string} token - JWT authentication token
 * @param {string} templateId - ID of the message template to retrieve
 * @returns {Promise<object>} Response with message template data
 */
export const getMessageTemplateById = async (token, templateId) => {
  try {
    const config = getAuthConfig(token);
    const response = await axios.get(`${API_BASE_URL}/message-templates/${templateId}`, config);
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
 * Create a new message template
 * @param {string} token - JWT authentication token
 * @param {object} templateData - Message template data to create
 * @returns {Promise<object>} Response with created message template data
 */
export const createMessageTemplate = async (token, templateData) => {
  try {
    const config = getAuthConfig(token);
    const response = await axios.post(`${API_BASE_URL}/message-templates`, templateData, config);
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
 * Update an existing message template
 * @param {string} token - JWT authentication token
 * @param {string} templateId - ID of the message template to update
 * @param {object} templateData - Updated message template data
 * @returns {Promise<object>} Response with updated message template data
 */
export const updateMessageTemplate = async (token, templateId, templateData) => {
  try {
    const config = getAuthConfig(token);
    const response = await axios.put(`${API_BASE_URL}/message-templates/${templateId}`, templateData, config);
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
 * Delete a message template
 * @param {string} token - JWT authentication token
 * @param {string} templateId - ID of the message template to delete
 * @returns {Promise<object>} Response with deletion status
 */
export const deleteMessageTemplate = async (token, templateId) => {
  try {
    const config = getAuthConfig(token);
    const response = await axios.delete(`${API_BASE_URL}/message-templates/${templateId}`, config);
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
  getMessageTemplates,
  getMessageTemplateById,
  createMessageTemplate,
  updateMessageTemplate,
  deleteMessageTemplate
};
