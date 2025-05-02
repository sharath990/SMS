import axios from 'axios';

const API_URL = 'http://localhost:5000/api/auth';

// Set token in headers
const setAuthToken = (token) => {
  if (token) {
    axios.defaults.headers.common['x-auth-token'] = token;
  } else {
    delete axios.defaults.headers.common['x-auth-token'];
  }
};

// Register user
const register = async (userData) => {
  try {
    const response = await axios.post(`${API_URL}/register`, userData);
    if (response.data.token) {
      localStorage.setItem('token', response.data.token);
      setAuthToken(response.data.token);
    }
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: 'Registration failed' };
  }
};

// Login user
const login = async (userData) => {
  try {
    const response = await axios.post(`${API_URL}/login`, userData);
    if (response.data.token) {
      localStorage.setItem('token', response.data.token);
      setAuthToken(response.data.token);
    }
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: 'Login failed' };
  }
};

// Logout user
const logout = () => {
  localStorage.removeItem('token');
  setAuthToken(null);
};

// Get current user
const getCurrentUser = async () => {
  try {
    setAuthToken(localStorage.getItem('token'));
    const response = await axios.get(`${API_URL}/user`);
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: 'Failed to get user data' };
  }
};

const authService = {
  register,
  login,
  logout,
  getCurrentUser,
  setAuthToken
};

export default authService;
