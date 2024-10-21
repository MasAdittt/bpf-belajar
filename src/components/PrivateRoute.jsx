import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../config/Auth';

function PrivateRoute({ children }) {
  const { user } = useAuth();
  
  if (!user || user.email !== "adityabayuwicaksono38@gmail.com") {
    return <Navigate to="/Coba" replace />;
  }

  return children;
}

export default PrivateRoute;