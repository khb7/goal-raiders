import React, { useContext } from 'react';
import { useGameConfig } from '../../game/GameConfigContext';
import { useTask } from '../TaskContext';

const TaskList = () => {
  const { tasks, toggleTask, deleteTask, editTask } = useTask();
  const { gameConfig } = useGameConfig();

  const renderTasks = (parentId = null, indent = 0) => {
    const filteredTasks = (tasks ?? []).filter(task => task.parentId === parentId && !task.isCompleted);

    return filteredTasks.map(task => (
      <li
        key={task.id}
        className={`list-group-item d-flex justify-content-between align-items-center ${
          task.completed ? 'list-group-item-secondary text-decoration-line-through' : ''
        }`}
        style={{ paddingLeft: `${20 + indent * 20}px` }}
      >
        <span onClick={() => editTask(task)} style={{ cursor: 'pointer' }}>
          {task.title} ({task.difficulty} - {gameConfig.difficultyDamageMap[task.difficulty]} HP)
        </span>
        <div>
          <button
            className={`btn ${task.completed ? 'btn-warning' : 'btn-success'}`}
            onClick={(e) => {
              e.stopPropagation();
              toggleTask(task.id);
            }}
            disabled={task.completed}
          >
            {task.completed ? 'Completed' : 'Complete'}
          </button>
          <button
            className="btn btn-danger ms-2"
            onClick={(e) => {
              e.stopPropagation();
              deleteTask(task.id);
            }}
          >
            Delete
          </button>
        </div>
        {renderTasks(task.id, indent + 1).length > 0 && (
          <ul className="list-group mt-2">
            {renderTasks(task.id, indent + 1)}
          </ul>
        )}
      </li>
    ));
  };

  return (
    <div>
      <h2>Your Tasks</h2>
      <ul className="list-group mb-3">
        {renderTasks()}
      </ul>
    </div>
  );
};

export default TaskList;
