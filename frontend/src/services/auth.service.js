/**
 * Authentication Service
 *
 * This service handles all authentication-related API calls, including:
 * - Login
 * - Registration
 * - User profile retrieval
 * - User management (CRUD operations)
 */

import axios from 'axios';
import { API_BASE_URL, getAuthConfig, handleApiError } from '../config/api.config';

/**
 * Login a user
 * @param {object} credentials - User credentials (username, password)
 * @returns {Promise<object>} Response with token and user data
 */
export const login = async (credentials) => {
  console.log('AuthService: login function called with:', credentials.email);
  try {
    console.log('AuthService: making API call to login endpoint');
    const response = await axios.post(`${API_BASE_URL}/auth/login`, credentials);
    console.log('AuthService: login API response:', response.data);
    return {
      success: true,
      data: response.data
    };
  } catch (error) {
    console.error('AuthService: login API error:', error);
    const errorData = handleApiError(error);
    console.log('AuthService: processed error data:', errorData);
    return {
      success: false,
      error: errorData
    };
  }
};

/**
 * Register a new user
 * @param {object} userData - User data for registration
 * @returns {Promise<object>} Response with token and user data
 */
export const register = async (userData) => {
  try {
    const response = await axios.post(`${API_BASE_URL}/auth/register`, userData);
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
 * Get current user profile
 * @param {string} token - JWT authentication token
 * @returns {Promise<object>} Response with user data
 */
export const getCurrentUser = async (token) => {
  try {
    const config = getAuthConfig(token);
    const response = await axios.get(`${API_BASE_URL}/auth/user`, config);
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
 * Get all users
 * @param {string} token - JWT authentication token
 * @returns {Promise<object>} Response with users data
 */
export const getAllUsers = async (token) => {
  try {
    const config = getAuthConfig(token);
    const response = await axios.get(`${API_BASE_URL}/auth/users`, config);
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
 * Create a new user
 * @param {string} token - JWT authentication token
 * @param {object} userData - User data to create
 * @returns {Promise<object>} Response with created user data
 */
export const createUser = async (token, userData) => {
  try {
    const config = getAuthConfig(token);
    const response = await axios.post(`${API_BASE_URL}/auth/users`, userData, config);
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
 * Update an existing user
 * @param {string} token - JWT authentication token
 * @param {string} userId - ID of the user to update
 * @param {object} userData - Updated user data
 * @returns {Promise<object>} Response with updated user data
 */
export const updateUser = async (token, userId, userData) => {
  try {
    const config = getAuthConfig(token);
    const response = await axios.put(`${API_BASE_URL}/auth/users/${userId}`, userData, config);
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
 * Delete a user
 * @param {string} token - JWT authentication token
 * @param {string} userId - ID of the user to delete
 * @returns {Promise<object>} Response with deletion status
 */
export const deleteUser = async (token, userId) => {
  try {
    const config = getAuthConfig(token);
    const response = await axios.delete(`${API_BASE_URL}/auth/users/${userId}`, config);
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
  login,
  register,
  getCurrentUser,
  getAllUsers,
  createUser,
  updateUser,
  deleteUser
};
