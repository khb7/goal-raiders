import React from 'react';
import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
import { UserProvider, useUser } from './contexts/UserContext';
import { BossProvider } from './features/bosses/BossContext';
import { TaskProvider } from './features/tasks/TaskContext';
import AppHeader from './components/AppHeader';
import DashboardSection from './components/DashboardSection';
import AuthPage from './pages/AuthPage';
import AddBossModal from './features/bosses/components/AddBossModal';
import EditBossModal from './features/bosses/components/EditBossModal';
import PlayerInfoCard from './features/player/components/PlayerInfoCard'; // Import PlayerInfoCard
import HeroSection from './components/HeroSection'; // Import HeroSection
import './App.css';
import 'bootstrap/dist/css/bootstrap.min.css';

const App = () => {
  const { idToken } = useUser();

  return (
    <div className="App app-main-background d-flex flex-column min-vh-100">
      <AppHeader />
      <HeroSection />
      <main className="container-fluid flex-grow-1">
        <Routes>
          <Route path="/auth" element={<AuthPage />} />
          <Route
            path="/"
            element={idToken ? (
              <div className="row">
                {/* Left Menu Bar */}
                <div className="col-md-3 sidebar-container">
                  <div className="card">
                    <div className="card-body">
                      <h4 className="card-title">Menu</h4>
                      <ul className="list-group list-group-flush">
                        <li className="list-group-item">Dashboard</li>
                        <li className="list-group-item">Settings</li>
                        <li className="list-group-item">About</li>
                      </ul>
                    </div>
                  </div>
                </div>

                {/* Main Content */}
                <div className="col-md-6 main-content-container">
                  <DashboardSection />
                </div>

                {/* Right Panel */}
                <div className="col-md-3">
                  <PlayerInfoCard />
                </div>
              </div>
            ) : (
              <Navigate to="/auth" replace />
            )}
          />
        </Routes>
      </main>
      {/* Modals are rendered here, outside the main content flow but within the App component */}
      <AddBossModal />
      <EditBossModal />
    </div>
  );
};

const AppWrapper = () => (
  <UserProvider>
    <BossProvider>
      <TaskProvider>
        <App />
      </TaskProvider>
    </BossProvider>
  </UserProvider>
);

export default AppWrapper;



