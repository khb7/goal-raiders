import React from 'react';
import { useUser } from '../../../contexts/UserContext';
import { useGame } from '../../../features/game/GameContext';
import { Button, ProgressBar } from 'react-bootstrap'; // Import ProgressBar

const PlayerInfoCard = () => {
  const { user, handleSignOut } = useUser();
  const { userInfo, playerHp } = useGame();

  const xpToNextLevel = 100; // Assuming 100 XP per level
  const currentXpPercentage = (userInfo?.experience / xpToNextLevel) * 100;

  return (
    <div className="card">
      <div className="card-body">
        <h5 className="card-title">Player Info</h5>
        {user && userInfo ? (
          <>
            <p className="mb-1"><strong>Email:</strong> {user.email}</p>
            <h4 className="mb-3">Level: {userInfo.level}</h4>

            <p className="mb-1"><strong>XP:</strong> {userInfo.experience} / {xpToNextLevel}</p>
            <ProgressBar now={currentXpPercentage} label={`${userInfo.experience}%`} className="mb-3 custom-progress-bar xp" />

            <p className="mb-1"><strong>HP:</strong> {playerHp} / 100</p>
            <ProgressBar now={playerHp} max={100} variant="danger" className="mb-3 custom-progress-bar hp" />

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
