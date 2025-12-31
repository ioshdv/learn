import React from 'react';
import { useAuth } from '../../context/AuthContext';
import { LoginForm } from './LoginForm';

export const ProtectedRoute = ({ children }) => {
  const { user, loading } = useAuth();

  if (loading) return <div>Cargando sesión...</div>;

  // Si no hay usuario, mostramos el Login
  if (!user) {
    return <LoginForm />;
  }

  return children;
};