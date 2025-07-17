import React, { useState, useEffect } from 'react';
import { Modal, Button, Form } from 'react-bootstrap';
import { useGameConfig } from '../../game/GameConfigContext';

const EditTaskModal = ({ show, handleClose, handleSaveTask, task, tasks, currentBossId, userId }) => {
  const { gameConfig } = useGameConfig();
  const [title, setTitle] = useState('');
  const [recurrenceDays, setRecurrenceDays] = useState(0);
  const [difficulty, setDifficulty] = useState('Medium');
  const [parentTaskId, setParentTaskId] = useState('');

  const isEditMode = task !== null;

  useEffect(() => {
    if (isEditMode) {
      setTitle(task.title || '');
      setRecurrenceDays(task.recurrenceDays || 0);
      setDifficulty(task.difficulty || 'Medium');
      setParentTaskId(task.parentTaskId || '');
    } else {
      setTitle('');
      setRecurrenceDays(0);
      setDifficulty('Medium');
      setParentTaskId('');
    }
  }, [task, isEditMode]);

  const handleSubmit = () => {
    const taskData = {
      title,
      completed: isEditMode ? task.completed : false,
      recurrenceDays: parseInt(recurrenceDays, 10),
      lastCompleted: isEditMode ? task.lastCompleted : null,
      difficulty,
      parentTaskId: parentTaskId || null,
      goalId: String(currentBossId),
      userId,
    };
    handleSaveTask(taskData);
  };

  return (
    <Modal show={show} onHide={handleClose} centered>
      <Modal.Header closeButton>
        <Modal.Title>{isEditMode ? 'Edit Task' : 'Add New Task'}</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <Form>
          <Form.Group className="mb-3">
            <Form.Label>Task Title:</Form.Label>
            <Form.Control
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Enter task title"
            />
          </Form.Group>
          <Form.Group className="mb-3">
            <Form.Label>Recurrence Days (0 for no recurrence):</Form.Label>
            <Form.Control
              type="number"
              value={recurrenceDays}
              onChange={(e) => setRecurrenceDays(e.target.value)}
              min="0"
            />
          </Form.Group>
          <Form.Group className="mb-3">
            <Form.Label>Difficulty:</Form.Label>
            <Form.Select
              value={difficulty}
              onChange={(e) => setDifficulty(e.target.value)}
            >
              {Object.keys(gameConfig.difficultyDamageMap).map(diff => (
                <option key={diff} value={diff}>{diff}</option>
              ))}
            </Form.Select>
          </Form.Group>
          <Form.Group className="mb-3">
            <Form.Label>Parent Task (Optional):</Form.Label>
            <Form.Select
              value={parentTaskId}
              onChange={(e) => setParentTaskId(e.target.value)}
            >
              <option value="">No Parent Task</option>
              {tasks
                .filter(t => !isEditMode || t.id !== task.id)
                .map(t => (
                  <option key={t.id} value={t.id}>{t.title}</option>
              ))}
            </Form.Select>
          </Form.Group>
        </Form>
      </Modal.Body>
      <Modal.Footer>
        <Button variant="secondary" onClick={handleClose}>
          Close
        </Button>
        <Button variant="primary" onClick={handleSubmit}>
          {isEditMode ? 'Save Changes' : 'Add Task'}
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

export default EditTaskModal;
