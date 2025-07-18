import React from 'react';
import { useBoss } from '../features/bosses/BossContext';

function AppHeader() {
  const { currentBoss } = useBoss();

  return (
    <div className="row mb-3 app-header-container">
      <div className="col-md-12 p-3 d-flex justify-content-between align-items-center">
        <h1 className="h3 mb-0">Goal Raiders</h1>
        <div>
        </div>
      </div>
      {currentBoss && (
        <div className="boss-status-container">
          <div className="d-flex align-items-center">
            <span className="me-2">Current Boss: <strong>{currentBoss.title}</strong></span>
            <div className="progress" style={{ width: '150px', height: '20px' }}>
              <div
                className="progress-bar bg-success"
                role="progressbar"
                style={{ width: `${(currentBoss.currentHp / currentBoss.maxHp) * 100}%` }}
                aria-valuenow={currentBoss.currentHp}
                aria-valuemin="0"
                aria-valuemax={currentBoss.maxHp}
              ></div>
            </div>
            <span className="ms-2">{currentBoss.currentHp} / {currentBoss.maxHp} HP</span>
          </div>
        </div>
      )}
    </div>
  );
}

export default AppHeader;
