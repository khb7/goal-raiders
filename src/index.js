import React from 'react';
import ReactDOM from 'react-dom/client';
import './styles/index.css';
import App from './App';
import reportWebVitals from './reportWebVitals';
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";
import { UserProvider, useUser } from './contexts/UserContext';
import { getFunctions } from "firebase/functions";
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import AuthPage from './pages/AuthPage';

const firebaseConfig = {
  apiKey: process.env.REACT_APP_FIREBASE_API_KEY,
  authDomain: "goal-raiders-20250702.firebaseapp.com",
  projectId: "goal-raiders-20250702",
  storageBucket: "goal-raiders-20250702.firebasestorage.app",
  messagingSenderId: "1056152643992",
  appId: "1:1056152643992:web:5ac67825ae95ac07eea3ed"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
export const functions = getFunctions(app);

const root = ReactDOM.createRoot(document.getElementById('root'));

function PrivateRoute({ children }) {
  const { user, userId, idToken } = useUser();
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    if (user !== null) {
      setLoading(false);
    }
  }, [user]);

  if (loading) {
    return <div>Loading...</div>; // Or a spinner
  }

  return user ? children : <Navigate to="/auth" />;
}

root.render(
  <React.StrictMode>
    <UserProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/auth" element={<AuthPage />} />
          <Route
            path="/*"
            element={
              <PrivateRoute>
                <App />
              </PrivateRoute>
            }
          />
        </Routes>
      </BrowserRouter>
    </UserProvider>
  </React.StrictMode>
);

reportWebVitals();
