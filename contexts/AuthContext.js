'use client';

import { createContext, useContext, useEffect, useState } from 'react';
import { onAuthStateChanged, signOut } from 'firebase/auth';
import { auth } from '../lib/firebase';

const AuthContext = createContext({});

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
  const [authToken, setAuthToken] = useState(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      try {
        if (firebaseUser) {
          // Get ID token
          const idToken = await firebaseUser.getIdToken();
          setAuthToken(idToken);
          localStorage.setItem('authToken', idToken);
          
          // Authenticate with backend to get user data
          const response = await fetch('/v1/auth/signin', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${idToken}`
            },
            body: JSON.stringify({ idToken })
          });

          if (response.ok) {
            const data = await response.json();
            if (data.success) {
              setUser(data.data.user);
            } else {
              console.error('Backend authentication failed:', data.message);
              setUser(null);
              setAuthToken(null);
              localStorage.removeItem('authToken');
            }
          } else {
            console.error('Backend authentication request failed');
            setUser(null);
            setAuthToken(null);
            localStorage.removeItem('authToken');
          }
        } else {
          setUser(null);
          setAuthToken(null);
          localStorage.removeItem('authToken');
        }
      } catch (error) {
        console.error('Auth state change error:', error);
        setUser(null);
        setAuthToken(null);
        localStorage.removeItem('authToken');
      } finally {
        setLoading(false);
      }
    });

    return unsubscribe;
  }, []);

  const logout = async () => {
    try {
      await signOut(auth);
      setUser(null);
      setAuthToken(null);
      localStorage.removeItem('authToken');
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  const value = {
    user,
    authToken,
    loading,
    logout
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};