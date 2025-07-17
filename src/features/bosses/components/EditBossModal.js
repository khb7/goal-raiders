import React, { useState, useEffect } from 'react';
import { Modal, Button, Form } from 'react-bootstrap';

const EditBossModal = ({ show, handleClose, handleEditBoss, handleDeleteBoss, boss, allBosses, gameConfig, userId }) => {
  const [title, setTitle] = useState('');
  const [difficulty, setDifficulty] = useState('Medium');
  const [dueDate, setDueDate] = useState('');
  const [parentGoalId, setParentGoalId] = useState('');

  useEffect(() => {
    if (boss) {
      setTitle(boss.title || '');
      setDifficulty(boss.status || 'Medium');
      setDueDate(boss.dueDate || '');
      setParentGoalId(boss.parentGoalId || '');
    }
  }, [boss]);

  const handleSubmit = () => {
    const bossData = {
      title,
      userId,
      parentGoalId: parentGoalId || null,
      dueDate: dueDate || null,
      status: difficulty,
    };
    handleEditBoss(bossData);
  };

  return (
    <Modal show={show} onHide={handleClose}>
      <Modal.Header closeButton>
        <Modal.Title>Edit Boss</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <Form>
          <Form.Group className="mb-3">
            <Form.Label>Boss Name:</Form.Label>
            <Form.Control
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
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
              {allBosses.filter(b => b.id !== boss.id).map(b => (
                <option key={b.id} value={b.id}>{b.title}</option>
              ))}
            </Form.Select>
          </Form.Group>
        </Form>
      </Modal.Body>
      <Modal.Footer>
        <Button variant="danger" onClick={handleDeleteBoss}>
          Delete Boss
        </Button>
        <Button variant="secondary" onClick={handleClose}>
          Cancel
        </Button>
        <Button variant="primary" onClick={handleSubmit}>
          Save Changes
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

export default EditBossModal;
