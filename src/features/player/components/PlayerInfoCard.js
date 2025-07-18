import React from 'react';
import { useUser } from '../../../contexts/UserContext';
import { useGame } from '../../../features/game/GameContext';
import { Button } from 'react-bootstrap';

const PlayerInfoCard = () => {
  const { user, handleSignOut } = useUser();
  const { userInfo, playerHp } = useGame();

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
            <Button variant="outline-secondary" size="sm" onClick={handleSignOut}>Logout</Button>
          </>
        ) : (
          <p>Please log in to see your player info.</p>
        )}
      </div>
    </div>
  );
};

export default PlayerInfoCard;
