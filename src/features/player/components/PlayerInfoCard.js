import React from 'react';
import { useUser } from '../UserContext';

const PlayerInfoCard = () => {
  const { user, userInfo, signOutUser } = useUser();

  return (
    <div className="card">
      <div className="card-body">
        <h5 className="card-title">Player Info</h5>
        {user && userInfo ? (
          <>
            <p><strong>Email:</strong> {user.email}</p>
            <p><strong>Level:</strong> {userInfo.level}</p>
            <p><strong>XP:</strong> {userInfo.experience} / 100</p>
            <p><strong>HP:</strong> {userInfo.currentHp} / {userInfo.maxHp}</p>
            <button className="btn btn-outline-secondary btn-sm" onClick={signOutUser}>Logout</button>
          </>
        ) : (
          <p>Please log in to see your player info.</p>
        )}
      </div>
    </div>
  );
};

export default PlayerInfoCard;
