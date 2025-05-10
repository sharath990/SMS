/**
 * Class Service
 * 
 * This service handles all class-related API calls, including:
 * - Fetching classes (with filtering, pagination, etc.)
 * - Creating, updating, and deleting classes
 */

import axios from 'axios';
import { API_BASE_URL, getAuthConfig, handleApiError } from '../config/api.config';

/**
 * Get all classes with optional filtering
 * @param {string} token - JWT authentication token
 * @param {object} filters - Optional filters (stream, batch, etc.)
 * @param {number} page - Page number for pagination
 * @param {number} limit - Number of items per page
 * @param {string} sortField - Field to sort by
 * @param {number} sortOrder - Sort order (1 for ascending, -1 for descending)
 * @returns {Promise<object>} Response with classes data
 */
export const getClasses = async (token, filters = {}, page = 1, limit = 10, sortField = 'name', sortOrder = 1) => {
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
    
    const response = await axios.get(`${API_BASE_URL}/classes?${params.toString()}`, config);
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
 * Get a class by ID
 * @param {string} token - JWT authentication token
 * @param {string} classId - ID of the class to retrieve
 * @returns {Promise<object>} Response with class data
 */
export const getClassById = async (token, classId) => {
  try {
    const config = getAuthConfig(token);
    const response = await axios.get(`${API_BASE_URL}/classes/${classId}`, config);
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
 * Create a new class
 * @param {string} token - JWT authentication token
 * @param {object} classData - Class data to create
 * @returns {Promise<object>} Response with created class data
 */
export const createClass = async (token, classData) => {
  try {
    const config = getAuthConfig(token);
    const response = await axios.post(`${API_BASE_URL}/classes`, classData, config);
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
 * Update an existing class
 * @param {string} token - JWT authentication token
 * @param {string} classId - ID of the class to update
 * @param {object} classData - Updated class data
 * @returns {Promise<object>} Response with updated class data
 */
export const updateClass = async (token, classId, classData) => {
  try {
    const config = getAuthConfig(token);
    const response = await axios.put(`${API_BASE_URL}/classes/${classId}`, classData, config);
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
 * Delete a class
 * @param {string} token - JWT authentication token
 * @param {string} classId - ID of the class to delete
 * @returns {Promise<object>} Response with deletion status
 */
export const deleteClass = async (token, classId) => {
  try {
    const config = getAuthConfig(token);
    const response = await axios.delete(`${API_BASE_URL}/classes/${classId}`, config);
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
 * Get sections for a class
 * @param {string} token - JWT authentication token
 * @param {string} classId - ID of the class
 * @returns {Promise<object>} Response with sections data
 */
export const getClassSections = async (token, classId) => {
  try {
    const config = getAuthConfig(token);
    const response = await axios.get(`${API_BASE_URL}/classes/${classId}/sections`, config);
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
  getClasses,
  getClassById,
  createClass,
  updateClass,
  deleteClass,
  getClassSections
};
