import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Form, Button, Card } from 'react-bootstrap';
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  GoogleAuthProvider,
  signInWithPopup,
  signOut
} from 'firebase/auth';
import { auth } from '../../index';
import { useNavigate } from 'react-router-dom';
import '../../styles/Auth.css'; // Auth.css 임포트

const AuthPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [user, setUser] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((currentUser) => {
      setUser(currentUser);
      if (currentUser) {
        navigate('/');
      }
    });
    return () => unsubscribe();
  }, [navigate]);

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
      <Container className="auth-container">
        <Card className="auth-card">
          <Card.Body>
            <h2>환영합니다, {user.email}!</h2>
            <Button variant="outline-secondary" onClick={handleSignOut}>로그아웃</Button>
          </Card.Body>
        </Card>
      </Container>
    );
  }

  return (
    <div className="auth-container d-flex justify-content-center align-items-center">
      <Card className="auth-card">
        <Card.Body>
          <h2>회원가입 / 로그인</h2>
          <Form>
            <Form.Group className="mb-3" controlId="formBasicEmail">
              <Form.Control
                type="email"
                placeholder="이메일 주소"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </Form.Group>

            <Form.Group className="mb-3" controlId="formBasicPassword">
              <Form.Control
                type="password"
                placeholder="비밀번호"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </Form.Group>

            <Button variant="primary" onClick={handleSignIn} className="mb-2">로그인</Button>
            <Button variant="outline-secondary" onClick={handleSignUp} className="mb-3">회원가입</Button>
            <Button variant="danger" onClick={handleGoogleSignIn} className="google-signin-btn">Google 로그인</Button>
          </Form>
          {error && <p className="error-message">{error}</p>}
        </Card.Body>
      </Card>
    </div>
  );
};

export default AuthPage;
