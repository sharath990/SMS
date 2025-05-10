import { createContext, useState, useEffect } from 'react';
import { authService } from '../services';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('token'));
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // We don't need to set default headers anymore since we're using the service layer

  // Load user if token exists
  useEffect(() => {
    const loadUser = async () => {
      if (token) {
        try {
          setLoading(true);
          const response = await authService.getCurrentUser(token);

          if (response.success) {
            setUser(response.data.user);
            setIsAuthenticated(true);
          } else {
            // Authentication failed
            localStorage.removeItem('token');
            setToken(null);
            setUser(null);
            setIsAuthenticated(false);
            setError(response.error.message || 'Authentication failed');
          }
        } catch (error) {
          // Unexpected error
          console.error('Authentication error:', error);
          localStorage.removeItem('token');
          setToken(null);
          setUser(null);
          setIsAuthenticated(false);
          setError('Authentication failed - unexpected error');
        }
      }
      setLoading(false);
    };

    loadUser();
  }, [token]);

  // Register user
  const register = async (userData) => {
    try {
      setLoading(true);
      setError(null);

      const response = await authService.register(userData);

      if (response.success) {
        localStorage.setItem('token', response.data.token);
        setToken(response.data.token);
        setUser(response.data.user);
        setIsAuthenticated(true);
        setLoading(false);
        return { success: true };
      } else {
        setLoading(false);
        setError(response.error.message || 'Registration failed');
        return { success: false, error: response.error.message || 'Registration failed' };
      }
    } catch (error) {
      console.error('Registration error:', error);
      setLoading(false);
      setError('Registration failed - unexpected error');
      return { success: false, error: 'Registration failed - unexpected error' };
    }
  };

  // Login user
  const login = async (userData) => {
    console.log('AuthContext: login function called with:', userData.email);
    try {
      setLoading(true);
      setError(null);
      console.log('AuthContext: calling auth service login');

      const response = await authService.login(userData);
      console.log('AuthContext: auth service login response:', response);

      if (response.success) {
        console.log('AuthContext: login successful, setting token and user');
        localStorage.setItem('token', response.data.token);
        setToken(response.data.token);
        setUser(response.data.user);
        setIsAuthenticated(true);
        setLoading(false);
        return { success: true, user: response.data.user };
      } else {
        console.log('AuthContext: login failed:', response.error);
        setLoading(false);
        setError(response.error.message || 'Login failed');
        return { success: false, error: response.error.message || 'Login failed' };
      }
    } catch (error) {
      console.error('AuthContext: unexpected login error:', error);
      setLoading(false);
      setError('Login failed - unexpected error');
      return { success: false, error: 'Login failed - unexpected error' };
    }
  };

  // Logout user
  const logout = () => {
    localStorage.removeItem('token');
    setToken(null);
    setUser(null);
    setIsAuthenticated(false);
  };

  // Clear errors
  const clearError = () => {
    setError(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isAuthenticated,
        loading,
        error,
        register,
        login,
        logout,
        clearError
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export default AuthContext;
