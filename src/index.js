import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import reportWebVitals from './reportWebVitals';
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth, onAuthStateChanged } from "firebase/auth";
import { getFunctions } from "firebase/functions";
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import AuthPage from './pages/AuthPage';
import { UserProvider, useUser } from './contexts/UserContext';
import { BossProvider } from './features/bosses/BossContext';
import { TaskProvider } from './features/tasks/TaskContext';
import { GameProvider } from './features/game/GameContext';

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
  const { user, loading } = useUser();

  if (loading) {
    return <div>Loading...</div>; // Or a spinner
  }

  return user ? children : <Navigate to="/auth" />;
}

root.render(
  <React.StrictMode>
    <BrowserRouter>
      <UserProvider>
        <BossProvider>
          <TaskProvider>
            <GameProvider>
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
          </GameProvider>
        </TaskProvider>
      </BossProvider>
    </UserProvider>
    </BrowserRouter>
  </React.StrictMode>
);

reportWebVitals();
