import React from 'react';
import { useTask } from '../TaskContext';
import { useBoss } from '../../bosses/BossContext';
import { DIFFICULTY_DAMAGE_MAP, BOSS_DIFFICULTY_COLOR_MAP } from '../../../utils/constants';

const TaskList = () => {
  const { tasks, toggleTask, editTask, deleteTask, renderTasks } = useTask();
  const { bosses, currentBossId, setCurrentBossId, toggleBossCollapse, collapsedBosses } = useBoss();

  const renderBosses = (bossList, allTasks, parentId = null, indent = 0) => {
    console.log("Rendering Bosses and Tasks:");
    console.log("Bosses:", bossList);
    console.log("All Tasks:", allTasks);
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
              {renderTasks(unassignedTasks, null, indent + 1)}
            </ul>
          </React.Fragment>
        )}
        {bossList
          .filter(boss => boss.parentGoalId === parentId)
          .map(boss => {
            const bossTasks = allTasks.filter(task => String(task.goalId) === String(boss.id));
            console.log(`Tasks for boss ${boss.title} (${boss.id}):`, bossTasks);
            const isCollapsed = collapsedBosses[boss.id];
            return (
              <React.Fragment key={boss.id}>
                <li
                  className={`list-group-item d-flex justify-content-between align-items-center ${boss.id === currentBossId ? 'active' : ''}`}
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
                    {/* Add boss specific actions here if needed */}
                  </div>
                </li>
                {!isCollapsed && (
                  <ul className="list-group list-group-flush">
                    {bossTasks.length > 0 ? (
                      renderTasks(bossTasks, null, indent + 1)
                    ) : (
                      <li className="list-group-item text-muted" style={{ paddingLeft: `${20 + (indent + 1) * 20}px` }}>
                        No tasks for this boss.
                      </li>
                    )}
                    {renderBosses(bossList, allTasks, boss.id, indent + 1)}
                  </ul>
                )}
              </React.Fragment>
            );
          })}
      </>
    );
  };

  return (
    <div className="card mb-4">
      <div className="card-body">
        <h5 className="card-title">Bosses and Tasks</h5>
        <ul className="list-group list-group-flush">
          {renderBosses(bosses, tasks)}
        </ul>
      </div>
    </div>
  );
};

export default TaskList;
