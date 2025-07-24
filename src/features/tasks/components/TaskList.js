import React from 'react';
import { useTask } from '../TaskContext';
import { useBoss } from '../../bosses/BossContext';
import { Button } from 'react-bootstrap';

const TaskList = () => {
  const { tasks, renderTasks, setShowAddTaskModal } = useTask();
  const { currentBossId } = useBoss();

  // Filter tasks to only show those for the currently selected boss
  const filteredTasks = currentBossId
    ? tasks.filter(task => String(task.goalId) === String(currentBossId))
    : []; // If no boss is selected, show no tasks

  return (
    <div className="card mb-4">
      <div className="card-body">
        <div className="d-flex justify-content-between align-items-center mb-3">
          <h5 className="card-title mb-0">Tasks for Current Boss</h5>
          {currentBossId && (
            <Button variant="primary" size="sm" onClick={() => setShowAddTaskModal(true)}>
              Add Task
            </Button>
          )}
        </div>
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
