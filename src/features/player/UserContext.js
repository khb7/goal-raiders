import React, { createContext, useState, useEffect, useContext, useCallback } from 'react';
import { auth } from '../../index';
import { onAuthStateChanged, signOut } from 'firebase/auth';
import api from '../../lib/api';

const UserContext = createContext(null);

export const UserProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [userId, setUserId] = useState(null);
  const [idToken, setIdToken] = useState(null);
  const [userInfo, setUserInfo] = useState(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      setUser(currentUser);
      if (currentUser) {
        setUserId(currentUser.uid);
        const token = await currentUser.getIdToken();
        setIdToken(token);
      } else {
        setUserId('');
        setIdToken(null);
        setUserInfo(null);
      }
    });
    return () => unsubscribe();
  }, []);

  const fetchUserInfo = useCallback(async () => {
    if (userId && idToken) {
      try {
        const fetchedUser = await api.get('/user/me', { idToken });
        setUserInfo(fetchedUser);
      } catch (error) {
        console.error("Error fetching user info:", error);
      }
    }
  }, [userId, idToken]);

  const signOutUser = useCallback(async () => {
    try {
      await signOut(auth);
    } catch (err) {
      console.error('로그아웃 오류:', err);
      throw err;
    }
  }, []);

  useEffect(() => {
    fetchUserInfo();
  }, [fetchUserInfo]);

  return (
    <UserContext.Provider value={{ user, userId, idToken, userInfo, fetchUserInfo, signOutUser }}>
      {children}
    </UserContext.Provider>
  );
};

export const useUser = () => {
  const context = useContext(UserContext);
  if (!context) {
    throw new Error('useUser must be used within a UserProvider');
  }
  return context;
};
