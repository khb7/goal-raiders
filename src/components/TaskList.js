import React from 'react';

const DIFFICULTY_DAMAGE_MAP = {
  Easy: 10,
  Medium: 20,
  Hard: 30,
  "Very Hard": 50,
};

const TaskList = ({ tasks, parentId = null, indent = 0, toggleTask, editTask, deleteTask }) => {
  return tasks
    .filter(task => task.parentTaskId === parentId)
    .map(task => (
      <React.Fragment key={task.id}>
        <li
          className={`list-group-item d-flex justify-content-between align-items-center ${
            task.completed ? 'list-group-item-secondary text-decoration-line-through' : ''
          } ${task.isDue ? 'list-group-item-info' : ''}`}
          style={{ paddingLeft: `${20 + indent * 20}px` }}
        >
          {task.title} ({task.difficulty} - {DIFFICULTY_DAMAGE_MAP[task.difficulty]} HP)
          <div>
            <button
              className={`btn ${task.completed ? 'btn-warning' : 'btn-success'}`}
              onClick={() => toggleTask(task.id)}
              disabled={task.completed}
            >
              {task.completed ? 'Completed' : 'Complete Task'}
            </button>
            <button
              className="btn btn-info ms-2"
              onClick={() => editTask(task.id)}
            >
              Edit
            </button>
            <button
              className="btn btn-danger ms-2"
              onClick={() => deleteTask(task.id)}
            >
              Delete
            </button>
          </div>
        </li>
        {TaskList({ tasks, parentId: task.id, indent: indent + 1, toggleTask, editTask, deleteTask })}
      </React.Fragment>
    ));
};

export default TaskList;
