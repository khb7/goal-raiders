import React from 'react';
import TaskList from '../../tasks/components/TaskList';
import { useGameConfig } from '../../game/GameConfigContext';

const BossList = ({ bossList, allTasks, parentId = null, indent = 0, currentBossId, setCurrentBossId, collapsedBosses, toggleBossCollapse, toggleTask, editTask, deleteTask }) => {
  const { gameConfig } = useGameConfig();
  const BOSS_DIFFICULTY_COLOR_MAP = gameConfig.bossHpMap ? {
    Easy: '#2E7D32',
    Medium: '#673AB7',
    Hard: '#C62828',
    "Very Hard": '#212121',
  } : {};

  const unassignedTasks = allTasks.filter(task => task.goalId === null || task.goalId === undefined);

  return (
    <>
      {parentId === null && unassignedTasks.length > 0 && (
        <React.Fragment key="unassigned-boss">
          <li
            className={`list-group-item d-flex justify-content-between align-items-center`}
            style={{ paddingLeft: `${20 + indent * 20}px`, backgroundColor: '#f0f0f0' }}
          >
            Unassigned Tasks
          </li>
          <ul className="list-group list-group-flush">
            <TaskList tasks={unassignedTasks} toggleTask={toggleTask} editTask={editTask} deleteTask={deleteTask} indent={indent + 1} />
          </ul>
        </React.Fragment>
      )}
      {bossList
        .filter(boss => boss.parentGoalId === parentId)
        .map(boss => {
          const bossTasks = allTasks.filter(task => String(task.goalId) === String(boss.id));
          const isCollapsed = collapsedBosses[boss.id];
          return (
            <React.Fragment key={boss.id}>
              <li
                className={`list-group-item d-flex justify-content-between align-items-center ${String(boss.id) === String(currentBossId) ? 'active' : ''}`}
                style={{
                  paddingLeft: `${20 + indent * 20}px`,
                  backgroundColor: BOSS_DIFFICULTY_COLOR_MAP[boss.status] || 'transparent',
                }}
              >
                <span onClick={() => setCurrentBossId(boss.id)} style={{ cursor: 'pointer' }}>
                  {boss.title} ({boss.currentHp} / {boss.maxHp} HP)
                </span>
                <div>
                  <button
                    className="btn btn-sm btn-outline-secondary ms-2"
                    onClick={() => toggleBossCollapse(boss.id)}
                  >
                    {isCollapsed ? 'Expand' : 'Collapse'}
                  </button>
                </div>
              </li>
              {!isCollapsed && (
                <ul className="list-group list-group-flush">
                  {bossTasks.length > 0 ? (
                    <TaskList tasks={bossTasks} toggleTask={toggleTask} editTask={editTask} deleteTask={deleteTask} indent={indent + 1} />
                  ) : (
                    <li className="list-group-item text-muted" style={{ paddingLeft: `${20 + (indent + 1) * 20}px` }}>
                      No tasks for this boss.
                    </li>
                  )}
                  <BossList
                    bossList={bossList}
                    allTasks={allTasks}
                    parentId={boss.id}
                    indent={indent + 1}
                    currentBossId={currentBossId}
                    setCurrentBossId={setCurrentBossId}
                    collapsedBosses={collapsedBosses}
                    toggleBossCollapse={toggleBossCollapse}
                    toggleTask={toggleTask}
                    editTask={editTask}
                    deleteTask={deleteTask}
                  />
                </ul>
              )}
            </React.Fragment>
          );
        })}
    </>
  );
};

export default BossList;
