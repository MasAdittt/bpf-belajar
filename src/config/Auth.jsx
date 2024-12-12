// src/contexts/AuthContext.js
import React, { createContext, useContext, useEffect, useState } from 'react';
import { signInWithEmailAndPassword, signOut, onAuthStateChanged } from 'firebase/auth';
import { firebaseAuthentication } from '../config/firebase';

const AuthContext = createContext();

export function useAuth() {
  return useContext(AuthContext);
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(firebaseAuthentication, (user) => {
      if (user) {
        // Set user info including displayName
        setUser({
          ...user,
          displayName: user.displayName || 'User'
        });
      } else {
        setUser(null);
      }
      setLoading(false);
    });
    return unsubscribe;
  }, []);

  const login = async (email, password) => {
    try {
      const userCredential = await signInWithEmailAndPassword(firebaseAuthentication, email, password);
      setUser({
        ...userCredential.user,
        displayName: userCredential.user.displayName || 'User'
      });
      return userCredential.user;
    } catch (error) {
      setError(error.message);
      throw error;
    }
  };

  const logout = async () => {
    try {
      await signOut(firebaseAuthentication);
      setUser(null);
      console.log('User signed out successfully');
    } catch (error) {
      setError(error.message);
      console.error('Error signing out:', error);
      throw error;
    }
  };

  const updateTokensIfNecessary = async () => {
    try {
      const currentUser = firebaseAuthentication.currentUser;
      if (currentUser) {
        const token = await currentUser.getIdToken(true);
        return token;
      }
      return null;
    } catch (error) {
      console.error("Error updating token:", error);
      throw error;
    }
  };

  const value = {
    user,
    login,
    logout,
    loading,
    error,
    updateTokensIfNecessary,
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
}

export default AuthProvider;