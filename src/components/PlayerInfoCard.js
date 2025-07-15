import React from 'react';
import { useUser } from '../contexts/UserContext';

const PlayerInfoCard = ({ playerHp, handleSignOut }) => {
  const { user, userInfo } = useUser();

  return (
    <div className="card">
      <div className="card-body">
        <h5 className="card-title">Player Info</h5>
        {user && userInfo ? (
          <>
            <p><strong>Email:</strong> {user.email}</p>
            <p><strong>Level:</strong> {userInfo.level}</p>
            <p><strong>XP:</strong> {userInfo.experience} / 100</p>
            <p><strong>HP:</strong> {playerHp} / 100</p> {/* 임시 HP 표시 */}
            <button className="btn btn-outline-secondary btn-sm" onClick={handleSignOut}>Logout</button>
          </>
        ) : (
          <p>Please log in to see your player info.</p>
        )}
      </div>
    </div>
  );
};

export default PlayerInfoCard;
