import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../config/Auth';

// Definisikan daftar email admin
const ADMIN_EMAILS = [
  "adityabayuwicaksono38@gmail.com"
  // Tambahkan email admin lain jika diperlukan
];

function PrivateRoute({ children, adminOnly = false }) {
  const { user } = useAuth();
  
  // Cek apakah user sudah login
  if (!user) {
    return <Navigate to="/Coba" replace />;
  }

  // Cek apakah email sudah diverifikasi
  if (!user.emailVerified) {
    // Anda bisa mengganti ini dengan halaman khusus untuk verifikasi email
    alert("Please verify your email first");
    return <Navigate to="/Coba" replace />;
  }

  // Jika route khusus admin, cek apakah user adalah admin
  if (adminOnly && !ADMIN_EMAILS.includes(user.email)) {
    // Redirect ke halaman tidak memiliki akses atau homepage
    return <Navigate to="/" replace />;
  }

  return children;
}

export default PrivateRoute;