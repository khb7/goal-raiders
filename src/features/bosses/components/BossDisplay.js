import React from 'react';
import Boss from '../../../Boss'; // Assuming Boss.js is in the root src directory
import { useBoss } from '../BossContext';
import { BOSS_DIFFICULTY_COLOR_MAP } from '../../../utils/constants';

const BossDisplay = () => {
  const { currentBoss, takingDamage, setEditingBossId, setEditingBossName, setEditingBossDifficulty, setEditingBossDueDate, setEditingParentBoss, setShowEditBossModal, isBossDefeated } = useBoss();

  if (!currentBoss) {
    return null;
  }

  return (
    <div
      className="boss-display-area p-3 rounded-3 mb-4"
      style={{ position: 'relative', backgroundColor: BOSS_DIFFICULTY_COLOR_MAP[currentBoss.status] || 'transparent' }}
    >
      {isBossDefeated ? (
        <div className="defeated-boss-message">
          <h2>보스 처치!</h2>
          <p>새로운 보스를 생성하거나 다른 보스를 선택하세요.</p>
        </div>
      ) : (
        <>
          <Boss bossId={currentBoss.id} bossName={currentBoss.title} currentHp={currentBoss.currentHp} maxHp={currentBoss.maxHp} takingDamage={takingDamage} dueDate={currentBoss.dueDate} />
          <button
            className="boss-edit-button"
            onClick={() => {
              setEditingBossId(currentBoss.id);
              setEditingBossName(currentBoss.title);
              setEditingBossDifficulty(currentBoss.status);
              setEditingBossDueDate(currentBoss.dueDate || '');
              setEditingParentBoss(currentBoss.parentGoalId || '');
              setShowEditBossModal(true);
            }}
            style={{ position: 'absolute', top: '10px', right: '10px' }}
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="feather feather-settings"><circle cx="12" cy="12" r="3"></circle><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0-.33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1.51-1V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"></path></svg>
          </button>
        </>
      )}
    </div>
  );
};

export default BossDisplay;
