import React, { createContext, useState, useContext, useEffect } from 'react';
import { authService } from '../services/authService';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const savedUser = authService.getCurrentUser();
    if (savedUser) setUser(savedUser);
    setLoading(false);
  }, []);

  const login = async (email, password) => {
    try {
      // Llamada al servicio
      const userData = await authService.login(email, password);
      setUser(userData);
    } catch (error) {
      console.error("ERROR EN EL LOGIN (CONTEXT):", error);
      throw error; // Re-lanzamos para que el formulario lo capture
    }
  };

  const logout = () => {
    authService.logout();
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, login, logout }}>
      {!loading && children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);