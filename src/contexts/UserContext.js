import React, { createContext, useState, useEffect, useContext, useCallback } from 'react';
import { auth } from '../index';
import { onAuthStateChanged, signOut } from 'firebase/auth';
import api from '../lib/api';

const UserContext = createContext(null);

export const UserProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [userId, setUserId] = useState(null);
  const [idToken, setIdToken] = useState(null);
  const [userInfo, setUserInfo] = useState(null); // User Level and XP

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      setUser(currentUser);
      if (currentUser) {
        setUserId(currentUser.uid);
        const token = await currentUser.getIdToken();
        setIdToken(token);
        console.log("Firebase User:", currentUser);
        console.log("Fetched ID Token:", token);
      } else {
        setUserId('');
        setIdToken(null);
        setUserInfo(null); // Clear user info on logout
        console.log("User logged out.");
      }
    });
    return () => unsubscribe();
  }, []);

  const fetchUserInfo = useCallback(async () => {
    if (userId && idToken) {
      try {
        console.log("Fetching user info from /api/user/me...");
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
      // 상태는 onAuthStateChanged 리스너에 의해 자동으로 업데이트됩니다.
    } catch (err) {
      console.error('로그아웃 오류:', err);
      throw err; // 에러를 다시 던져서 호출하는 곳에서 처리할 수 있도록 합니다.
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
