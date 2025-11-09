import React, { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';

const AuthContext = createContext();

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [token, setToken] = useState(localStorage.getItem('token'));

  const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:4000/api';

  useEffect(() => {
    if (token) {
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      fetchUser();
    } else {
      setLoading(false);
    }
  }, [token]);

  const fetchUser = async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/auth/me`);
      setUser(response.data);
    } catch (error) {
      console.error('Failed to fetch user:', error);
      logout();
    } finally {
      setLoading(false);
    }
  };

  const login = (newToken) => {
    console.log('AuthContext.login called with token:', newToken ? 'Yes' : 'No');
    console.log('AuthContext.login - Token length:', newToken ? newToken.length : 0);
    console.log('AuthContext.login - Token value (first 20 chars):', newToken ? newToken.substring(0, 20) + '...' : 'None');
    
    if (!newToken) {
      console.error('Login called with empty token!');
      return;
    }
    
    // Decode token if it's URL encoded
    const decodedToken = decodeURIComponent(newToken);
    console.log('AuthContext.login - Decoded token (first 20 chars):', decodedToken.substring(0, 20) + '...');
    
    setToken(decodedToken);
    localStorage.setItem('token', decodedToken);
    const storedToken = localStorage.getItem('token');
    console.log('AuthContext.login - Token saved to localStorage:', storedToken ? 'Yes' : 'No');
    console.log('AuthContext.login - Stored token (first 20 chars):', storedToken ? storedToken.substring(0, 20) + '...' : 'None');
    axios.defaults.headers.common['Authorization'] = `Bearer ${decodedToken}`;
    fetchUser();
  };

  const logout = () => {
    setToken(null);
    setUser(null);
    localStorage.removeItem('token');
    delete axios.defaults.headers.common['Authorization'];
  };

  const mockLogin = async (email, name) => {
    try {
      const response = await axios.post(`${API_BASE_URL}/auth/mock`, { email, name });
      login(response.data.access_token);
      return response.data;
    } catch (error) {
      console.error('Mock login failed:', error);
      throw error;
    }
  };

  const value = {
    user,
    token,
    loading,
    login,
    logout,
    mockLogin,
    fetchUser,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}


