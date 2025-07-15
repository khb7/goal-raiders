import React from 'react';
import { Modal, Button, Form } from 'react-bootstrap';

const EditBossModal = ({
  showEditBossModal,
  setShowEditBossModal,
  editingBossId,
  editingBossName,
  setEditingBossName,
  editingBossDifficulty,
  setEditingBossDifficulty,
  editingBossDueDate,
  setEditingBossDueDate,
  editingParentBoss,
  setEditingParentBoss,
  editBoss,
  deleteBoss,
  bosses,
  DIFFICULTY_DAMAGE_MAP,
}) => {
  return (
    <Modal show={showEditBossModal} onHide={() => setShowEditBossModal(false)}>
      <Modal.Header closeButton>
        <Modal.Title>Edit Boss</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <Form>
          <Form.Group className="mb-3">
            <Form.Label htmlFor="editBossNameInput">Boss Name:</Form.Label>
            <Form.Control
              type="text"
              id="editBossNameInput"
              value={editingBossName}
              onChange={(e) => setEditingBossName(e.target.value)}
            />
          </Form.Group>
          
          <Form.Group className="mb-3">
            <Form.Label htmlFor="editBossDifficultySelect">Boss Difficulty:</Form.Label>
            <Form.Select
              id="editBossDifficultySelect"
              value={editingBossDifficulty}
              onChange={(e) => setEditingBossDifficulty(e.target.value)}
            >
              {Object.keys(DIFFICULTY_DAMAGE_MAP).map(difficulty => (
                <option key={difficulty} value={difficulty}>{difficulty}</option>
              ))}
            </Form.Select>
          </Form.Group>
          <Form.Group className="mb-3">
            <Form.Label htmlFor="editBossDueDateInput">Due Date (Optional):</Form.Label>
            <Form.Control
              type="date"
              id="editBossDueDateInput"
              value={editingBossDueDate}
              onChange={(e) => setEditingBossDueDate(e.target.value)}
            />
          </Form.Group>
          <Form.Group className="mb-3">
            <Form.Label htmlFor="editParentBossSelect">Parent Boss:</Form.Label>
            <Form.Select
              id="editParentBossSelect"
              value={editingParentBoss}
              onChange={(e) => setEditingParentBoss(e.target.value)}
            >
              <option value="">No Parent Boss</option>
              {bosses.filter(boss => boss.id !== editingBossId).map(boss => (
                <option key={boss.id} value={boss.id}>{boss.title}</option>
              ))}
            </Form.Select>
          </Form.Group>
        </Form>
      </Modal.Body>
      <Modal.Footer>
        <Button variant="danger" onClick={deleteBoss}>
          Delete Boss
        </Button>
        <Button variant="secondary" onClick={() => setShowEditBossModal(false)}>
          Cancel
        </Button>
        <Button variant="primary" onClick={editBoss}>
          Save Changes
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

export default EditBossModal;
