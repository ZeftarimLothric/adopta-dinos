// src/components/ProtectedRoute.tsx
import React, { type JSX } from 'react';
import { Navigate } from 'react-router-dom';
import { useUser } from '../context/UserContext';

interface ProtectedRouteProps {
  children: JSX.Element;
  allowedRoles: ('admin' | 'user')[];
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children, allowedRoles }) => {
  const { user } = useUser();

  if (!user) {
    // No logueado, redirigir a login
    return <Navigate to="/login" replace />;
  }

  if (!allowedRoles.includes(user.role)) {
    // No tiene permiso, redirigir a home u otra página
    return <Navigate to="/" replace />;
  }

  return children;
};

export default ProtectedRoute;
