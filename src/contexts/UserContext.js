import React, { createContext, useState, useEffect, useContext, useCallback } from 'react';
import { auth } from '../index';
import { onAuthStateChanged, signOut } from 'firebase/auth';
import { useNavigate } from 'react-router-dom';

const UserContext = createContext(null);

export const UserProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [userId, setUserId] = useState('');
  const [idToken, setIdToken] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

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
      }
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  const handleSignOut = useCallback(async () => {
    try {
      await signOut(auth);
      alert('로그아웃 성공!');
      navigate('/auth');
    } catch (err) {
      console.error('로그아웃 오류:', err);
    }
  }, [navigate]);

  return (
    <UserContext.Provider value={{ user, userId, loading, idToken, handleSignOut }}>
      {children}
    </UserContext.Provider>
  );
};

export const useUser = () => useContext(UserContext);
