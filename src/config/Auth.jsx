import React, { createContext, useContext, useEffect, useState } from 'react';
import { firebaseAuthentication } from '../config/firebase';
import { signInWithEmailAndPassword, signOut } from 'firebase/auth';

const AuthContext = createContext();

export function useAuth() {
  return useContext(AuthContext);
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const unsubscribe = firebaseAuthentication.onAuthStateChanged((user) => {
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

  const login = (email, password) => {
    return signInWithEmailAndPassword(firebaseAuthentication, email, password)
      .then((userCredential) => {
        // Set user info including displayName
        setUser({
          ...userCredential.user,
          displayName: userCredential.user.displayName || 'User'
        });
        return userCredential.user;
      })
      .catch((error) => {
        setError(error.message);
        throw error;
      });
  };

  const logout = () => {
    return signOut(firebaseAuthentication)
      .then(() => {
        setUser(null);
        console.log('User signed out successfully');
      })
      .catch((error) => {
        setError(error.message);
        console.error('Error signing out:', error);
      });
  };

  const updateTokensIfNecessary = async () => {
    try {
      const user = firebaseAuthentication.currentUser;
      if (user) {
        const token = await user.getIdToken(true);
        // Lakukan sesuatu dengan token yang diperbarui
      }
    } catch (error) {
      console.error("Error updating token:", error);
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

  return <AuthContext.Provider value={value}>{!loading && children}</AuthContext.Provider>;
}
