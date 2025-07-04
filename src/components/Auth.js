import React, { useState, useEffect } from 'react'; // useEffect 추가
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  GoogleAuthProvider,
  signInWithPopup,
  signOut
} from 'firebase/auth';
import { auth } from '../index'; // auth 객체 import

const Auth = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [user, setUser] = useState(null); // 현재 로그인된 사용자 정보

  // 사용자 상태 변화 감지
  useEffect(() => { // useState -> useEffect로 변경
    const unsubscribe = auth.onAuthStateChanged((currentUser) => {
      setUser(currentUser);
    });
    return () => unsubscribe(); // 컴포넌트 언마운트 시 구독 해제
  }, []);

  const handleSignUp = async () => {
    setError('');
    try {
      await createUserWithEmailAndPassword(auth, email, password);
      alert('회원가입 성공!');
    } catch (err) {
      setError(err.message);
    }
  };

  const handleSignIn = async () => {
    setError('');
    try {
      await signInWithEmailAndPassword(auth, email, password);
      alert('로그인 성공!');
    } catch (err) {
      setError(err.message);
    }
  };

  const handleGoogleSignIn = async () => {
    setError('');
    try {
      const provider = new GoogleAuthProvider();
      await signInWithPopup(auth, provider);
      alert('Google 로그인 성공!');
    } catch (err) {
      setError(err.message);
    }
  };

  const handleSignOut = async () => {
    setError('');
    try {
      await signOut(auth);
      alert('로그아웃 성공!');
    } catch (err) {
      setError(err.message);
    }
  };

  if (user) {
    return (
      <div>
        <h2>환영합니다, {user.email}!</h2>
        <button onClick={handleSignOut}>로그아웃</button>
      </div>
    );
  }

  return (
    <div>
      <h2>회원가입 / 로그인</h2>
      <input
        type="email"
        placeholder="이메일"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
      />
      <input
        type="password"
        placeholder="비밀번호"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
      />
      <button onClick={handleSignUp}>회원가입</button>
      <button onClick={handleSignIn}>로그인</button>
      <button onClick={handleGoogleSignIn}>Google 로그인</button>
      {error && <p style={{ color: 'red' }}>{error}</p>}
    </div>
  );
};

export default Auth;