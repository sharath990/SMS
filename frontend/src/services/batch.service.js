/**
 * Batch Service
 * 
 * This service handles all batch-related API calls, including:
 * - Fetching batches (with filtering, pagination, etc.)
 * - Creating, updating, and deleting batches
 */

import axios from 'axios';
import { API_BASE_URL, getAuthConfig, handleApiError } from '../config/api.config';

/**
 * Get all batches with optional filtering
 * @param {string} token - JWT authentication token
 * @param {object} filters - Optional filters (isGraduated, etc.)
 * @param {number} page - Page number for pagination
 * @param {number} limit - Number of items per page
 * @param {string} sortField - Field to sort by
 * @param {number} sortOrder - Sort order (1 for ascending, -1 for descending)
 * @returns {Promise<object>} Response with batches data
 */
export const getBatches = async (token, filters = {}, page = 1, limit = 10, sortField = 'startYear', sortOrder = -1) => {
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
    
    const response = await axios.get(`${API_BASE_URL}/batches?${params.toString()}`, config);
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
 * Get active (non-graduated) batches
 * @param {string} token - JWT authentication token
 * @returns {Promise<object>} Response with active batches data
 */
export const getActiveBatches = async (token) => {
  try {
    const config = getAuthConfig(token);
    const params = new URLSearchParams();
    params.append('isGraduated', 'false');
    
    const response = await axios.get(`${API_BASE_URL}/batches?${params.toString()}`, config);
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
 * Get a batch by ID
 * @param {string} token - JWT authentication token
 * @param {string} batchId - ID of the batch to retrieve
 * @returns {Promise<object>} Response with batch data
 */
export const getBatchById = async (token, batchId) => {
  try {
    const config = getAuthConfig(token);
    const response = await axios.get(`${API_BASE_URL}/batches/${batchId}`, config);
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
 * Create a new batch
 * @param {string} token - JWT authentication token
 * @param {object} batchData - Batch data to create
 * @returns {Promise<object>} Response with created batch data
 */
export const createBatch = async (token, batchData) => {
  try {
    const config = getAuthConfig(token);
    const response = await axios.post(`${API_BASE_URL}/batches`, batchData, config);
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
 * Update an existing batch
 * @param {string} token - JWT authentication token
 * @param {string} batchId - ID of the batch to update
 * @param {object} batchData - Updated batch data
 * @returns {Promise<object>} Response with updated batch data
 */
export const updateBatch = async (token, batchId, batchData) => {
  try {
    const config = getAuthConfig(token);
    const response = await axios.put(`${API_BASE_URL}/batches/${batchId}`, batchData, config);
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
 * Delete a batch
 * @param {string} token - JWT authentication token
 * @param {string} batchId - ID of the batch to delete
 * @returns {Promise<object>} Response with deletion status
 */
export const deleteBatch = async (token, batchId) => {
  try {
    const config = getAuthConfig(token);
    const response = await axios.delete(`${API_BASE_URL}/batches/${batchId}`, config);
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
  getBatches,
  getActiveBatches,
  getBatchById,
  createBatch,
  updateBatch,
  deleteBatch
};
