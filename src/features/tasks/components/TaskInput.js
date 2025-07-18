import React from 'react';
import { Button, Form } from 'react-bootstrap';
import { useTask } from '../TaskContext';
import { DIFFICULTY_DAMAGE_MAP } from '../../../utils/constants';

const TaskInput = () => {
  const {
    task,
    setTask,
    recurrenceDays,
    setRecurrenceDays,
    selectedDifficulty,
    setSelectedDifficulty,
    selectedParentTask,
    setSelectedParentTask,
    editingTaskId,
    saveTask,
    tasks,
  } = useTask();

  return (
    <div className="card mb-4">
      <div className="card-body">
        <h5 className="card-title">Add New Task</h5>
        <Form>
          <Form.Group className="mb-3">
            <Form.Label htmlFor="taskInput">Task Title:</Form.Label>
            <Form.Control
              type="text"
              id="taskInput"
              value={task}
              onChange={(e) => setTask(e.target.value)}
              placeholder="Enter task title"
            />
          </Form.Group>
          <Form.Group className="mb-3">
            <Form.Label htmlFor="recurrenceInput">Recurrence Days (0 for no recurrence):</Form.Label>
            <Form.Control
              type="number"
              id="recurrenceInput"
              value={recurrenceDays}
              onChange={(e) => setRecurrenceDays(e.target.value)}
              min="0"
            />
          </Form.Group>
          <Form.Group className="mb-3">
            <Form.Label htmlFor="difficultySelect">Difficulty:</Form.Label>
            <Form.Select
              id="difficultySelect"
              value={selectedDifficulty}
              onChange={(e) => setSelectedDifficulty(e.target.value)}
            >
              {Object.keys(DIFFICULTY_DAMAGE_MAP).map(difficulty => (
                <option key={difficulty} value={difficulty}>{difficulty}</option>
              ))}
            </Form.Select>
          </Form.Group>
          <Form.Group className="mb-3">
            <Form.Label htmlFor="parentTaskSelect">Parent Task (Optional):</Form.Label>
            <Form.Select
              id="parentTaskSelect"
              value={selectedParentTask}
              onChange={(e) => setSelectedParentTask(e.target.value)}
            >
              <option value="">No Parent Task</option>
              {tasks.map(t => (
                <option key={t.id} value={t.id}>{t.title}</option>
              ))}
            </Form.Select>
          </Form.Group>
          <Button variant="primary" onClick={saveTask}>
            {editingTaskId ? 'Update Task' : 'Add Task'}
          </Button>
        </Form>
      </div>
    </div>
  );
};

export default TaskInput;
