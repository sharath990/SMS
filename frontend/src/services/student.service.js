/**
 * Student Service
 * 
 * This service handles all student-related API calls, including:
 * - Fetching students (with filtering, pagination, etc.)
 * - Creating, updating, and deleting students
 * - Importing students from CSV/Excel
 */

import axios from 'axios';
import { API_BASE_URL, getAuthConfig, handleApiError } from '../config/api.config';

/**
 * Get all students with optional filtering
 * @param {string} token - JWT authentication token
 * @param {object} filters - Optional filters (stream, class, section, batch, isActive, etc.)
 * @param {number} page - Page number for pagination
 * @param {number} limit - Number of items per page
 * @param {string} sortField - Field to sort by
 * @param {number} sortOrder - Sort order (1 for ascending, -1 for descending)
 * @returns {Promise<object>} Response with students data
 */
export const getStudents = async (token, filters = {}, page = 1, limit = 10, sortField = 'rollNumber', sortOrder = 1) => {
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
    
    const response = await axios.get(`${API_BASE_URL}/students?${params.toString()}`, config);
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
 * Get student count with optional filtering
 * @param {string} token - JWT authentication token
 * @param {object} filters - Optional filters (stream, class, section, batch, isActive, etc.)
 * @returns {Promise<object>} Response with count data
 */
export const getStudentCount = async (token, filters = {}) => {
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
    
    // Add count flag
    params.append('count', 'true');
    
    const response = await axios.get(`${API_BASE_URL}/students?${params.toString()}`, config);
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
 * Get a student by ID
 * @param {string} token - JWT authentication token
 * @param {string} studentId - ID of the student to retrieve
 * @returns {Promise<object>} Response with student data
 */
export const getStudentById = async (token, studentId) => {
  try {
    const config = getAuthConfig(token);
    const response = await axios.get(`${API_BASE_URL}/students/${studentId}`, config);
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
 * Create a new student
 * @param {string} token - JWT authentication token
 * @param {object} studentData - Student data to create
 * @returns {Promise<object>} Response with created student data
 */
export const createStudent = async (token, studentData) => {
  try {
    const config = getAuthConfig(token);
    const response = await axios.post(`${API_BASE_URL}/students`, studentData, config);
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
 * Update an existing student
 * @param {string} token - JWT authentication token
 * @param {string} studentId - ID of the student to update
 * @param {object} studentData - Updated student data
 * @returns {Promise<object>} Response with updated student data
 */
export const updateStudent = async (token, studentId, studentData) => {
  try {
    const config = getAuthConfig(token);
    const response = await axios.put(`${API_BASE_URL}/students/${studentId}`, studentData, config);
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
 * Delete a student
 * @param {string} token - JWT authentication token
 * @param {string} studentId - ID of the student to delete
 * @returns {Promise<object>} Response with deletion status
 */
export const deleteStudent = async (token, studentId) => {
  try {
    const config = getAuthConfig(token);
    const response = await axios.delete(`${API_BASE_URL}/students/${studentId}`, config);
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
 * Import students from file
 * @param {string} token - JWT authentication token
 * @param {File} file - File object containing student data
 * @returns {Promise<object>} Response with import results
 */
export const importStudents = async (token, file) => {
  try {
    const config = {
      headers: {
        'x-auth-token': token,
        'Content-Type': 'multipart/form-data'
      }
    };
    
    const formData = new FormData();
    formData.append('file', file);
    
    const response = await axios.post(`${API_BASE_URL}/import/students`, formData, config);
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
  getStudents,
  getStudentCount,
  getStudentById,
  createStudent,
  updateStudent,
  deleteStudent,
  importStudents
};
