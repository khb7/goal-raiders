import React from 'react';
import { useGameConfig } from '../../game/GameConfigContext';

const TaskList = ({ tasks, toggleTask, editTask, deleteTask }) => {
  const { gameConfig } = useGameConfig();

  const renderTasks = (parentId = null, indent = 0) => {
    const filteredTasks = tasks.filter(task => task.parentTaskId === parentId);

    if (filteredTasks.length === 0) {
      return null;
    }

    return (
      <ul className="list-group list-group-flush">
        {filteredTasks.map(task => (
          <React.Fragment key={task.id}>
            <li
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
            </li>
            {renderTasks(task.id, indent + 1)}
          </React.Fragment>
        ))}
      </ul>
    );
  };

  return renderTasks();
};

export default TaskList;
