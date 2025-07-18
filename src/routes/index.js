import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useUser } from '../contexts/UserContext';
import App from '../App';
import AuthPage from '../features/auth/AuthPage';

function PrivateRoute({ children }) {
  const { user, idToken } = useUser(); // idToken also indicates readiness
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    // Wait until the auth state is determined
    if (user !== undefined) {
      setLoading(false);
    }
  }, [user]);

  if (loading) {
    return <div>Loading...</div>; // Or a spinner
  }

  return user && idToken ? children : <Navigate to="/auth" />;
}

const AppRoutes = () => {
  return (
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
  );
};

export default AppRoutes;
