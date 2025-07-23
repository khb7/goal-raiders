import React from 'react';
import { useBoss } from '../features/bosses/BossContext';
import { useUser } from '../contexts/UserContext'; // Import useUser

function AppHeader() {
  const { currentBoss } = useBoss();
  const { user, handleSignOut } = useUser(); // Get user and handleSignOut

  return (
    <nav className="navbar navbar-expand-lg navbar-dark bg-dark mb-3">
      <div className="container-fluid">
        <a className="navbar-brand" href="#">Goal Raiders</a>
        <div className="collapse navbar-collapse" id="navbarNav">
          <ul className="navbar-nav me-auto mb-2 mb-lg-0">
            {/* Navigation items can go here if needed */}
          </ul>
          <div className="d-flex align-items-center">
            {currentBoss && (
              <div className="d-flex align-items-center me-3">
                <span className="text-light me-2">Current Boss: <strong>{currentBoss.title}</strong></span>
                <div className="progress" style={{ width: '100px', height: '15px' }}>
                  <div
                    className="progress-bar bg-success"
                    role="progressbar"
                    style={{ width: `${(currentBoss.currentHp / currentBoss.maxHp) * 100}%` }}
                    aria-valuenow={currentBoss.currentHp}
                    aria-valuemin="0"
                    aria-valuemax={currentBoss.maxHp}
                  ></div>
                </div>
                <span className="text-light ms-2">{currentBoss.currentHp} / {currentBoss.maxHp} HP</span>
              </div>
            )}
            {user ? (
              <button className="btn btn-outline-light" onClick={handleSignOut}>Sign Out</button>
            ) : (
              <span className="text-light">Not Logged In</span>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}

export default AppHeader;
