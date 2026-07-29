import React, { createContext, useState, useContext, useEffect } from 'react';
import { authAPI } from '../services/api';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    const token = localStorage.getItem('token');
    const storedUser = localStorage.getItem('user');

    if (token && storedUser) {
      try {
        const response = await authAPI.getMe();
        setUser(response.data.data);
        setLoading(false);
      } catch (err) {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        setUser(null);
        setLoading(false);
      }
    } else {
      setLoading(false);
    }
  };

  const login = async (credentials) => {
    try {
      setError(null);
      const response = await authAPI.login(credentials);
      const { token, role, id } = response.data;

      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify({ role, id }));

      const userResponse = await authAPI.getMe();
      setUser(userResponse.data.data);

      return { success: true, role };
    } catch (err) {
      const errorMessage = err.response?.data?.message || 'Login failed';
      setError(errorMessage);
      throw new Error(errorMessage);
    }
  };

  const register = async (userData) => {
    try {
      setError(null);
      // Ensure we're sending the correct data structure
      const response = await authAPI.register(userData);

      // Check if we have a valid response with the expected data
      if (response && response.data && response.data.token) {
        const { token, role, id } = response.data;

        localStorage.setItem('token', token);
        localStorage.setItem('user', JSON.stringify({ role, id }));

        try {
          const userResponse = await authAPI.getMe();
          setUser(userResponse.data.data);
        } catch (userErr) {
          console.error('Error fetching user data after registration:', userErr);
          // Continue with registration success even if getMe fails
        }

        return { success: true, role };
      } else {
        throw new Error('Invalid response from server');
      }
    } catch (err) {
      console.error('Registration error details:', err);
      const errorMessage = err.response?.data?.message || 'Registration failed';
      setError(errorMessage);
      throw new Error(errorMessage);
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
    window.location.href = '/login';
  };

  const value = {
    user,
    loading,
    error,
    login,
    register,
    logout,
    isAuthenticated: !!user,
    isAdmin: user?.role === 'admin',
    isSuperAdmin: user?.role === 'superadmin',
    isStudent: user?.role === 'student',
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export default AuthContext;
