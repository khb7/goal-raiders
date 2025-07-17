import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useUser } from '../features/player/UserContext';
import App from '../App';
import AuthPage from '../features/auth/AuthPage';

function PrivateRoute({ children }) {
  const { user } = useUser();
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
