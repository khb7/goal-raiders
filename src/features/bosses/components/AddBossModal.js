import React from 'react';
import { Modal, Button, Form } from 'react-bootstrap';
import { useBoss } from '../BossContext';
import { DIFFICULTY_DAMAGE_MAP } from '../../../utils/constants';

const AddBossModal = () => {
  const {
    newBossName,
    setNewBossName,
    selectedBossDifficulty,
    setSelectedBossDifficulty,
    newBossDueDate,
    setNewBossDueDate,
    selectedParentBoss,
    setSelectedParentBoss,
    showAddBossModal,
    setShowAddBossModal,
    addBoss,
    bosses,
  } = useBoss();

  return (
    <Modal show={showAddBossModal} onHide={() => setShowAddBossModal(false)}>
      <Modal.Header closeButton>
        <Modal.Title>Add New Boss</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <Form>
          <Form.Group className="mb-3">
            <Form.Label htmlFor="newBossNameInput">New Boss Name:</Form.Label>
            <Form.Control
              type="text"
              id="newBossNameInput"
              value={newBossName}
              onChange={(e) => setNewBossName(e.target.value)}
              placeholder="Enter new boss name"
            />
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Label htmlFor="bossDifficultySelect">Boss Difficulty:</Form.Label>
            <Form.Select
              id="bossDifficultySelect"
              value={selectedBossDifficulty}
              onChange={(e) => setSelectedBossDifficulty(e.target.value)}
            >
              {Object.keys(DIFFICULTY_DAMAGE_MAP).map(difficulty => (
                <option key={difficulty} value={difficulty}>{difficulty}</option>
              ))}
            </Form.Select>
          </Form.Group>
          <Form.Group className="mb-3">
            <Form.Label htmlFor="newBossDueDateInput">Due Date (Optional):</Form.Label>
            <Form.Control
              type="date"
              id="newBossDueDateInput"
              value={newBossDueDate}
              onChange={(e) => setNewBossDueDate(e.target.value)}
            />
          </Form.Group>
          <Form.Group className="mb-3">
            <Form.Label htmlFor="parentBossSelect">Parent Boss:</Form.Label>
            <Form.Select
              id="parentBossSelect"
              value={selectedParentBoss}
              onChange={(e) => setSelectedParentBoss(e.target.value)}
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
        <Button variant="secondary" onClick={() => setShowAddBossModal(false)}>
          Cancel
        </Button>
        <Button variant="primary" onClick={addBoss}>
          Add Boss
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

export default AddBossModal;
