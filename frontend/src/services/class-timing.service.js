/**
 * Class Timing Service
 * 
 * This service handles all class timing-related API calls, including:
 * - Fetching class timings (with filtering, pagination, etc.)
 * - Creating, updating, and deleting class timings
 */

import axios from 'axios';
import { API_BASE_URL, getAuthConfig, handleApiError } from '../config/api.config';

/**
 * Get all class timings with optional filtering
 * @param {string} token - JWT authentication token
 * @param {object} filters - Optional filters
 * @param {number} page - Page number for pagination
 * @param {number} limit - Number of items per page
 * @param {string} sortField - Field to sort by
 * @param {number} sortOrder - Sort order (1 for ascending, -1 for descending)
 * @returns {Promise<object>} Response with class timings data
 */
export const getClassTimings = async (token, filters = {}, page = 1, limit = 10, sortField = 'period', sortOrder = 1) => {
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
    
    const response = await axios.get(`${API_BASE_URL}/class-timings?${params.toString()}`, config);
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
 * Get a class timing by ID
 * @param {string} token - JWT authentication token
 * @param {string} classTimingId - ID of the class timing to retrieve
 * @returns {Promise<object>} Response with class timing data
 */
export const getClassTimingById = async (token, classTimingId) => {
  try {
    const config = getAuthConfig(token);
    const response = await axios.get(`${API_BASE_URL}/class-timings/${classTimingId}`, config);
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
 * Create a new class timing
 * @param {string} token - JWT authentication token
 * @param {object} classTimingData - Class timing data to create
 * @returns {Promise<object>} Response with created class timing data
 */
export const createClassTiming = async (token, classTimingData) => {
  try {
    const config = getAuthConfig(token);
    const response = await axios.post(`${API_BASE_URL}/class-timings`, classTimingData, config);
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
 * Update an existing class timing
 * @param {string} token - JWT authentication token
 * @param {string} classTimingId - ID of the class timing to update
 * @param {object} classTimingData - Updated class timing data
 * @returns {Promise<object>} Response with updated class timing data
 */
export const updateClassTiming = async (token, classTimingId, classTimingData) => {
  try {
    const config = getAuthConfig(token);
    const response = await axios.put(`${API_BASE_URL}/class-timings/${classTimingId}`, classTimingData, config);
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
 * Delete a class timing
 * @param {string} token - JWT authentication token
 * @param {string} classTimingId - ID of the class timing to delete
 * @returns {Promise<object>} Response with deletion status
 */
export const deleteClassTiming = async (token, classTimingId) => {
  try {
    const config = getAuthConfig(token);
    const response = await axios.delete(`${API_BASE_URL}/class-timings/${classTimingId}`, config);
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
  getClassTimings,
  getClassTimingById,
  createClassTiming,
  updateClassTiming,
  deleteClassTiming
};
