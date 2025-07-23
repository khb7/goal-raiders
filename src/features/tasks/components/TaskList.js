import React from 'react';
import { useTask } from '../TaskContext';
import { useBoss } from '../../bosses/BossContext';

const TaskList = () => {
  const { tasks, renderTasks } = useTask();
  const { currentBossId } = useBoss();

  // Filter tasks to only show those for the currently selected boss
  const filteredTasks = currentBossId
    ? tasks.filter(task => String(task.goalId) === String(currentBossId))
    : []; // If no boss is selected, show no tasks

  return (
    <div className="card mb-4">
      <div className="card-body">
        <h5 className="card-title">Tasks for Current Boss</h5>
        {currentBossId ? (
          <ul className="list-group list-group-flush">
            {filteredTasks.length > 0 ? (
              renderTasks(filteredTasks, null, 0)
            ) : (
              <li className="list-group-item text-muted">
                No tasks for this boss. Add one above!
              </li>
            )}
          </ul>
        ) : (
          <p className="text-muted">Select a boss to see its tasks.</p>
        )}
      </div>
    </div>
  );
};

export default TaskList;
