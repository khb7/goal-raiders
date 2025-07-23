import React from 'react';
import { useBoss } from '../BossContext';
import { BOSS_DIFFICULTY_COLOR_MAP } from '../../../utils/constants';

const BossList = () => {
  const { bosses, currentBossId, setCurrentBossId, toggleBossCollapse, collapsedBosses } = useBoss();

  const renderBosses = (bossList, parentId = null, indent = 0) => {
    return bossList
      .filter(boss => boss.parentGoalId === parentId)
      .map(boss => {
        const isCollapsed = collapsedBosses[boss.id];
        return (
          <React.Fragment key={boss.id}>
            <li
              className={`list-group-item d-flex justify-content-between align-items-center ${boss.id === currentBossId ? 'active' : ''}`}
              style={{
                paddingLeft: `${20 + indent * 20}px`,
                backgroundColor: boss.id !== currentBossId ? BOSS_DIFFICULTY_COLOR_MAP[boss.status] : null,
                cursor: 'pointer'
              }}
              onClick={() => setCurrentBossId(boss.id)}
            >
              <span>
                {boss.title} ({boss.currentHp} / {boss.maxHp} HP)
              </span>
              <button
                className="btn btn-sm btn-outline-secondary ms-2"
                onClick={(e) => {
                    e.stopPropagation(); // Prevent the li's onClick from firing
                    toggleBossCollapse(boss.id);
                }}
              >
                {isCollapsed ? 'Expand' : 'Collapse'}
              </button>
            </li>
            {!isCollapsed && (
              <ul className="list-group list-group-flush">
                {renderBosses(bossList, boss.id, indent + 1)}
              </ul>
            )}
          </React.Fragment>
        );
      });
  };

  return (
    <div className="card mb-4">
      <div className="card-body">
        <h5 className="card-title">Bosses</h5>
        <ul className="list-group list-group-flush">
          {renderBosses(bosses)}
        </ul>
      </div>
    </div>
  );
};

export default BossList;