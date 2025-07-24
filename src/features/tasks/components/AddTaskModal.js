import React from 'react';
import { Modal, Button, Form } from 'react-bootstrap';
import { useTask } from '../TaskContext';
import { useBoss } from '../../bosses/BossContext';
import { DIFFICULTY_DAMAGE_MAP } from '../../../utils/constants';

const AddTaskModal = () => {
  const {
    task,
    setTask,
    recurrenceDays,
    setRecurrenceDays,
    selectedDifficulty,
    setSelectedDifficulty,
    selectedParentTask,
    setSelectedParentTask,
    showAddTaskModal,
    setShowAddTaskModal,
    saveTask,
    tasks: allTasks, // Rename tasks to allTasks to avoid conflict with local task state
  } = useTask();

  const { currentBossId, bosses } = useBoss();

  return (
    <Modal show={showAddTaskModal} onHide={() => setShowAddTaskModal(false)}>
      <Modal.Header closeButton>
        <Modal.Title>Add New Task</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <Form>
          <Form.Group className="mb-3">
            <Form.Label htmlFor="newTaskInput">Task Description:</Form.Label>
            <Form.Control
              type="text"
              id="newTaskInput"
              value={task}
              onChange={(e) => setTask(e.target.value)}
              placeholder="Enter new task"
            />
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Label htmlFor="recurrenceDaysInput">Recurrence Days:</Form.Label>
            <Form.Control
              type="number"
              id="recurrenceDaysInput"
              value={recurrenceDays}
              onChange={(e) => setRecurrenceDays(e.target.value)}
              min="0"
            />
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Label htmlFor="taskDifficultySelect">Difficulty:</Form.Label>
            <Form.Select
              id="taskDifficultySelect"
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
              {allTasks.filter(t => t.goalId === currentBossId).map(t => (
                <option key={t.id} value={t.id}>{t.title}</option>
              ))}
            </Form.Select>
          </Form.Group>
        </Form>
      </Modal.Body>
      <Modal.Footer>
        <Button variant="secondary" onClick={() => setShowAddTaskModal(false)}>
          Cancel
        </Button>
        <Button variant="primary" onClick={saveTask}>
          Add Task
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

export default AddTaskModal;