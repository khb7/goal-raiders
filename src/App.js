import React, { useState, useEffect, useCallback } from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import { Modal, Button, Form } from 'react-bootstrap'; // Import Modal, Button, Form
import { useUser } from './contexts/UserContext';
import { useBoss } from './features/bosses/BossContext';
import AddBossModal from './features/bosses/components/AddBossModal';
import EditBossModal from './features/bosses/components/EditBossModal';
import BossDisplay from './features/bosses/components/BossDisplay';
import BossSelector from './features/bosses/components/BossSelector';
import { useTask } from './features/tasks/TaskContext';
import TaskInput from './features/tasks/components/TaskInput';
import TaskList from './features/tasks/components/TaskList';
import PlayerInfoCard from './features/player/components/PlayerInfoCard';
import { useGame } from './features/game/GameContext';

// 보스 체력 차는 양 맞게 하고 보스 추가 오류 고치기

import './App.css';
import { useNavigate } from 'react-router-dom';
import Boss from './Boss';
import AppHeader from './components/AppHeader';
import DashboardSection from './components/DashboardSection';

import { DIFFICULTY_DAMAGE_MAP, BOSS_DIFFICULTY_COLOR_MAP } from './utils/constants';

function App() {
  const { user, userId, handleSignOut } = useUser();
  const { bosses, currentBossId, setCurrentBossId, newBossName, setNewBossName, selectedBossDifficulty, setSelectedBossDifficulty, newBossDueDate, setNewBossDueDate, selectedParentBoss, setSelectedParentBoss, showAddBossModal, setShowAddBossModal, showEditBossModal, setShowEditBossModal, editingBossId, setEditingBossId, editingBossName, setEditingBossName, editingBossDifficulty, setEditingBossDifficulty, editingBossDueDate, setEditingBossDueDate, editingParentBoss, setEditingParentBoss, addBoss, editBoss, deleteBoss, currentBoss, toggleBossCollapse, collapsedBosses, loadBosses, gameConfig } = useBoss();
  const { tasks, task, setTask, recurrenceDays, setRecurrenceDays, selectedDifficulty, setSelectedDifficulty, selectedParentTask, setSelectedParentTask, editingTaskId, setEditingTaskId, takingDamage, setTakingDamage, saveTask, toggleTask, editTask, deleteTask, loadTasks, renderTasks } = useTask();
  return (
    <div className="container-fluid mt-3 app-main-background d-flex flex-column min-vh-100">
      <AppHeader />
      <DashboardSection />

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
              <BossSelector />
          </div>

          {/* Add New Boss Modal */}
          <AddBossModal />

          {/* Edit Current Boss Modal */}
          <EditBossModal />

          {currentBoss && (
            <BossDisplay />
          )}
          <TaskList />

          {/* Add Task Form */}
          <TaskInput />
        </div>

        {/* Right Panel */}
        <div className="col-md-3">
          <PlayerInfoCard />
        </div>
      </div>
    </div>
  );
}

export default App;



