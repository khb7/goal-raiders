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
import { BrowserRouter } from 'react-router-dom';
import AppRoutes from './routes';

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

root.render(
  <React.StrictMode>
    <UserProvider>
      <BrowserRouter>
        <AppRoutes />
      </BrowserRouter>
    </UserProvider>
  </React.StrictMode>
);

reportWebVitals();
