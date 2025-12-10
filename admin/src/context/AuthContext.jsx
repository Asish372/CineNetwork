import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../services/api';

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    const token = sessionStorage.getItem('admin_token') || localStorage.getItem('admin_token');
    
    if (!token) {
      setLoading(false);
      return;
    }

    try {
      // Set default header for all future requests
      api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      
      const res = await api.get('/admin/verify');
      if (res.data.valid) {
        setUser(res.data.user);
        setIsAuthenticated(true);
      } else {
        logout();
      }
    } catch (error) {
      console.error('Auth check failed:', error);
      logout();
    } finally {
      setLoading(false);
    }
  };

  const login = async (email, password, rememberMe) => {
    const res = await api.post('/auth/login', { email, password });
    const { token, user } = res.data;

    if (rememberMe) {
      localStorage.setItem('admin_token', token);
    } else {
      sessionStorage.setItem('admin_token', token);
    }

    // Set header immediately
    api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    
    setUser(user);
    setIsAuthenticated(true);
    return user;
  };

  const logout = () => {
    localStorage.removeItem('admin_token');
    sessionStorage.removeItem('admin_token');
    delete api.defaults.headers.common['Authorization'];
    setUser(null);
    setIsAuthenticated(false);
  };

  return (
    <AuthContext.Provider value={{ user, loading, isAuthenticated, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};
