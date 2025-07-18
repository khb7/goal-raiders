import React, { useState, useEffect, useCallback } from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import { Modal, Button, Form } from 'react-bootstrap'; // Import Modal, Button, Form
import { useUser } from './contexts/UserContext';
import { useBoss } from './features/bosses/BossContext';
import { useTask } from './features/tasks/TaskContext';
import { useGame } from './features/game/GameContext';



import './App.css';
import { useNavigate } from 'react-router-dom';
import Boss from './Boss';

import { DIFFICULTY_DAMAGE_MAP, BOSS_DIFFICULTY_COLOR_MAP } from './utils/constants';

function App() {
  const { user, userId, handleSignOut } = useUser();
  const { bosses, currentBossId, setCurrentBossId, newBossName, setNewBossName, selectedBossDifficulty, setSelectedBossDifficulty, newBossDueDate, setNewBossDueDate, selectedParentBoss, setSelectedParentBoss, showAddBossModal, setShowAddBossModal, showEditBossModal, setShowEditBossModal, editingBossId, setEditingBossId, editingBossName, setEditingBossName, editingBossDifficulty, setEditingBossDifficulty, editingBossDueDate, setEditingBossDueDate, editingParentBoss, setEditingParentBoss, addBoss, editBoss, deleteBoss, currentBoss, toggleBossCollapse, collapsedBosses, loadBosses, gameConfig } = useBoss();
  const { tasks, task, setTask, recurrenceDays, setRecurrenceDays, selectedDifficulty, setSelectedDifficulty, selectedParentTask, setSelectedParentTask, editingTaskId, setEditingTaskId, takingDamage, setTakingDamage, saveTask, toggleTask, editTask, deleteTask, loadTasks, renderTasks } = useTask();
  const { userInfo, playerHp, isVictory, resetGame } = useGame();

  const isVictory = currentBoss && currentBoss.currentHp <= 0;

  return (
    <div className="container-fluid mt-3 app-main-background d-flex flex-column min-vh-100">
      {/* Header */}
      <div className="row mb-3 app-header-container">
        <div className="col-md-12 p-3 d-flex justify-content-between align-items-center">
          <h1 className="h3 mb-0">Goal Raiders</h1>
          <div>
            <button className="btn btn-outline-primary btn-sm" onClick={resetGame}>New Game</button>
          </div>
        </div>
      </div>
          {currentBoss && (
            <div className="boss-status-container">
              <div className="d-flex align-items-center">
                <span className="me-2">Current Boss: <strong>{currentBoss.title}</strong></span>
                <div className="progress" style={{ width: '150px', height: '20px' }}>
                  <div
                    className="progress-bar bg-success"
                    role="progressbar"
                    style={{ width: `${(currentBoss.currentHp / currentBoss.maxHp) * 100}%` }}
                    aria-valuenow={currentBoss.currentHp}
                    aria-valuemin="0"
                    aria-valuemax={currentBoss.maxHp}
                  ></div>
                </div>
                <span className="ms-2">{currentBoss.currentHp} / {currentBoss.maxHp} HP</span>
              </div>
            </div>
          )}
      <div className="p-4 mb-4 rounded-3 dashboard-header">
        <div className="container-fluid">
          <h1 className="display-5 fw-bold">Dashboard</h1>
          <p className="col-md-8 fs-4">오늘의 목표를 달성하고 보스를 물리치세요!</p>
        </div>
      </div>

      <div className="row">
        {/* Left Menu Bar */}
        <div className="col-md-3 sidebar-container">
          <div className="card">
            <div className="card-body">
              <h4 className="card-title">Menu</h4>
              <ul className="list-group list-group-flush">
                <li className="list-group-item">Dashboard</li>
                <li className="list-group-item">Settings</li>
                <li className="list-group-item">About</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="col-md-6 main-content-container">
          <div className="mb-4 d-flex justify-content-between align-items-center">
              <Button variant="primary" onClick={() => setShowAddBossModal(true)}>
                  Add New Boss
              </Button>
              <Form.Group className="mb-0"> {/* Use mb-0 to reduce margin */}
                <Form.Label htmlFor="currentBossSelect" className="me-2 mb-0">Select Current Boss:</Form.Label>
                <Form.Select
                  id="currentBossSelect"
                  value={currentBossId || ''} // Handle null currentBossId
                  onChange={(e) => setCurrentBossId(e.target.value ? parseInt(e.target.value, 10) : null)}
                  style={{ width: '200px', display: 'inline-block' }} // Adjust styling as needed
                >
                  <option value="">-- Select a Boss --</option>
                  {bosses.map(boss => (
                    <option key={boss.id} value={boss.id}>
                      {boss.title} ({boss.currentHp} / {boss.maxHp} HP)
                    </option>
                  ))}
                </Form.Select>
              </Form.Group>
          </div>

          {/* Add New Boss Modal */}
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

          {/* Edit Current Boss Modal */}
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
                              onChange={(e) => setSelectedBossDifficulty(e.target.value)}
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

          {currentBoss && (
            <div 
              className="boss-display-area p-3 rounded-3 mb-4"
              style={{ position: 'relative', backgroundColor: BOSS_DIFFICULTY_COLOR_MAP[currentBoss.status] || 'transparent' }}
            >
              <Boss bossId={currentBoss.id} bossName={currentBoss.title} currentHp={currentBoss.currentHp} maxHp={currentBoss.maxHp} takingDamage={takingDamage} dueDate={currentBoss.dueDate} />
              <button
                className="boss-edit-button"
                onClick={() => {
                  setEditingBossId(currentBoss.id);
                  setEditingBossName(currentBoss.title);
                  setEditingBossDifficulty(currentBoss.status);
                  setEditingBossDueDate(currentBoss.dueDate || '');
                  setEditingParentBoss(currentBoss.parentGoalId || '');
                  setShowEditBossModal(true);
                }}
                style={{ position: 'absolute', top: '10px', right: '10px' }}
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="feather feather-settings"><circle cx="12" cy="12" r="3"></circle><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0-.33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1.51-1V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"></path></svg>
              </button>
            </div>
          )}

          {/* Add Task Form */}
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

          

          
        </div>

        {/* Right Panel */}
        <div className="col-md-3">
          <div className="card">
            <div className="card-body">
              <h5 className="card-title">Player Info</h5>
              {user && userInfo ? (
                <>
                  <p><strong>Email:</strong> {user.email}</p>
                  <p><strong>Level:</strong> {userInfo.level}</p>
                  <p><strong>XP:</strong> {userInfo.experience} / 100</p>
                  <p><strong>HP:</strong> {playerHp} / 100</p> {/* 임시 HP 표시 */}
                  <button className="btn btn-outline-secondary btn-sm" onClick={handleSignOut}>Logout</button>
                </>
              ) : (
                <p>Please log in to see your player info.</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;



