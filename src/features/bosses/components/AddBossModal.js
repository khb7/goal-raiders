import React, { useState } from 'react';
import { Modal, Button, Form } from 'react-bootstrap';

const AddBossModal = ({ show, handleClose, handleAddBoss, bosses, gameConfig, userId }) => {
  const [title, setTitle] = useState('');
  const [difficulty, setDifficulty] = useState('Medium');
  const [dueDate, setDueDate] = useState('');
  const [parentGoalId, setParentGoalId] = useState('');

  const handleSubmit = () => {
    const maxHp = gameConfig.bossHpMap[difficulty] || 100;
    const bossData = {
      title,
      maxHp,
      currentHp: maxHp,
      userId,
      parentGoalId: parentGoalId || null,
      dueDate: dueDate || null,
      status: difficulty,
    };
    handleAddBoss(bossData);
    setTitle('');
    setDifficulty('Medium');
    setDueDate('');
    setParentGoalId('');
  };

  return (
    <Modal show={show} onHide={handleClose}>
      <Modal.Header closeButton>
        <Modal.Title>Add New Boss</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <Form>
          <Form.Group className="mb-3">
            <Form.Label>New Boss Name:</Form.Label>
            <Form.Control
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Enter new boss name"
            />
          </Form.Group>
          <Form.Group className="mb-3">
            <Form.Label>Boss Difficulty:</Form.Label>
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
            <Form.Label>Due Date (Optional):</Form.Label>
            <Form.Control
              type="date"
              value={dueDate}
              onChange={(e) => setDueDate(e.target.value)}
            />
          </Form.Group>
          <Form.Group className="mb-3">
            <Form.Label>Parent Boss:</Form.Label>
            <Form.Select
              value={parentGoalId}
              onChange={(e) => setParentGoalId(e.target.value)}
            >
              <option value="">No Parent Boss</option>
              {bosses.map(boss => (
                <option key={boss.id} value={boss.id}>{boss.title}</option>
              ))}
            </Form.Select>
          </Form.Group>
        </Form>
      </Modal.Body>
      <Modal.Footer>
        <Button variant="secondary" onClick={handleClose}>
          Cancel
        </Button>
        <Button variant="primary" onClick={handleSubmit}>
          Add Boss
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

export default AddBossModal;
