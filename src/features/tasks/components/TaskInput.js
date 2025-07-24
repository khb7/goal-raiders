import React from 'react';
import { Button } from 'react-bootstrap';
import { useTask } from '../TaskContext';

const TaskInput = () => {
  const { setShowAddTaskModal } = useTask();

  return (
    <div className="card mb-4">
      <div className="card-body text-center">
        <h5 className="card-title">Task Management</h5>
        <Button variant="primary" onClick={() => setShowAddTaskModal(true)}>
          Add New Task
        </Button>
      </div>
    </div>
  );
};

export default TaskInput;
