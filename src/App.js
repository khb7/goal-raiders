import React, { useState, useEffect, useCallback } from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import BossList from './components/BossList';
import PlayerInfoCard from './components/PlayerInfoCard';
import { Modal, Button, Form } from 'react-bootstrap';



import './styles/App.css';
import { signOut } from 'firebase/auth';
import { useUser } from './contexts/UserContext';
import { useNavigate } from 'react-router-dom';
import BossDisplay from './components/BossDisplay';
import api from './services/api';

import TaskList from './components/TaskList';

function App() {
  
  const [tasks, setTasks] = useState([]);
  const [task, setTask] = useState('');
  const [recurrenceDays, setRecurrenceDays] = useState(0); // 0 for no recurrence
  const [selectedDifficulty, setSelectedDifficulty] = useState('Medium'); // Default difficulty
  const [selectedParentTask, setSelectedParentTask] = useState(''); // For sub-tasks
  const [selectedParentBoss, setSelectedParentBoss] = useState(''); // For sub-bosses
  const [bosses, setBosses] = useState([]); // Bosses state
  const [currentBossId, setCurrentBossId] = useState(null); // Current boss ID state
  const [newBossName, setNewBossName] = useState(''); // New boss name state
  const [selectedBossDifficulty, setSelectedBossDifficulty] = useState('Medium'); // New boss difficulty state
  const [newBossDueDate, setNewBossDueDate] = useState(''); // New boss due date state
  const [showAddBossModal, setShowAddBossModal] = useState(false); // Add boss modal state
  const [showEditBossModal, setShowEditBossModal] = useState(false); // Edit boss modal state
  const [editingBossId, setEditingBossId] = useState(null); // ID of boss being edited
  const [editingBossName, setEditingBossName] = useState(''); // Name of boss being edited
  const [editingBossDifficulty, setEditingBossDifficulty] = useState('Medium'); // Difficulty of boss being edited
  const [editingBossDueDate, setEditingBossDueDate] = useState(''); // Due date of boss being edited
  const [editingParentBoss, setEditingParentBoss] = useState(''); // Parent boss of boss being edited
  
  const [editingTaskId, setEditingTaskId] = useState(null); // Editing task ID state
  const [takingDamage, setTakingDamage] = useState(false); // Taking damage animation state
  const [playerHp] = useState(100); // Player HP state (temporary)
  const [collapsedBosses, setCollapsedBosses] = useState({}); // State to manage collapsed bosses

  const toggleBossCollapse = (bossId) => {
    setCollapsedBosses(prev => ({
      ...prev,
      [bossId]: !prev[bossId]
    }));
  };

  const navigate = useNavigate();
  const { user, userId, idToken, userInfo, fetchUserInfo } = useUser();

  const [gameConfig, setGameConfig] = useState({
    difficultyDamageMap: {},
    bossHpMap: {},
  });

  useEffect(() => {
    const fetchGameConfig = async () => {
      try {
        const config = await api.get('/config/game');
        setGameConfig({
          difficultyDamageMap: config.difficultyDamageMap || {},
          bossHpMap: config.bossHpMap || {},
        });
      } catch (error) {
        console.error("Error fetching game config:", error);
      }
    };
    fetchGameConfig();
  }, []);

  const currentBoss = currentBossId ? bosses.find(boss => boss.id === currentBossId) : null;
  const isVictory = currentBoss && currentBoss.currentHp <= 0;

  const saveTask = async () => {
    if (!currentBossId) {
      alert("Please select a boss before adding a task.");
      return;
    }
    if (task && userId) { // Ensure userId is available
      const taskData = {
        title: task,
        completed: false,
        recurrenceDays: parseInt(recurrenceDays),
        lastCompleted: null, // Will be set by backend on completion
        difficulty: selectedDifficulty,
        parentTaskId: selectedParentTask || null,
        goalId: currentBossId, // Map bossId to goalId
        userId: userId,
      };

      try {
        let savedTask;
        if (editingTaskId) {
          // Update existing task
          savedTask = await api.put(`/tasks/${editingTaskId}`, taskData, { idToken });
        } else {
          // Add new task
          savedTask = await api.post('/tasks', taskData, { idToken });
        }

        if (editingTaskId) {
          setTasks(tasks.map(t => (t.id === editingTaskId ? savedTask : t)));
          setEditingTaskId(null);
        } else {
          setTasks([...tasks, savedTask]);
        }
      } catch (error) {
        console.error("Error saving task:", error);
        alert(`Failed to save task: ${error.message}`);
      }
        
      setTask('');
      setRecurrenceDays(0);
      setSelectedDifficulty('Medium');
      setSelectedParentTask('');
    }
  };

  const toggleTask = async (id) => {
    if (!idToken) {
      alert("로그인이 필요합니다.");
      return;
    }

    setTakingDamage(true); // For damage animation

    try {
      const updatedTask = await api.post(`/tasks/${id}/complete`, {}, { idToken });
      setTasks(prevTasks => prevTasks.map(t =>
        t.id === updatedTask.id
          ? { ...updatedTask, name: updatedTask.title } // Map title to name for consistency
          : t
      ));

      // Fetch updated boss data after task completion
      if (updatedTask.goalId) {
        const updatedBoss = await api.get(`/goals/${updatedTask.goalId}`, { idToken });
        setBosses(prevBosses => prevBosses.map(boss =>
          boss.id === updatedBoss.id
            ? updatedBoss
            : boss
        ));
      }
    } catch (error) {
      console.error("Error completing task:", error);
      alert(`Failed to complete task: ${error.message}`);
    } finally {
      setTimeout(() => setTakingDamage(false), 500); // End animation
    }
  };

  const editTask = async (id) => {
    try {
      const taskToEdit = await api.get(`/tasks/${id}`, { idToken });
      setTask(taskToEdit.title);
      setRecurrenceDays(taskToEdit.recurrenceDays);
      setSelectedDifficulty(taskToEdit.difficulty);
      setSelectedParentTask(taskToEdit.parentTaskId || '');
      setEditingTaskId(id);
    } catch (error) {
      console.error("Error fetching task for edit:", error);
      alert(`Failed to fetch task for edit: ${error.message}`);
    }
  };

  const deleteTask = async (id) => {
    if (!idToken) {
      alert("로그인이 필요합니다.");
      return;
    }
    try {
      await api.delete(`/tasks/${id}`, { idToken });
      setTasks(tasks.filter(t => t.id !== id));
    } catch (error) {
      console.error("Error deleting task:", error);
      alert(`Failed to delete task: ${error.message}`);
    }
  };

  const loadData = useCallback(async () => {
    console.log("loadData called.");
    if (userId && idToken) {
      console.log("userId and idToken are present. Proceeding with fetch.");
      try {
        // Load bosses from backend
        console.log("Fetching bosses from /api/goals...");
        const fetchedBosses = await api.get('/goals', { idToken });
        console.log("Fetched bosses data:", fetchedBosses);
        console.log("Current boss ID before update:", currentBossId);
        setBosses(fetchedBosses);
        // Try to keep the current boss selected
        const previouslySelectedBoss = fetchedBosses.find(boss => boss.id === currentBossId);
        if (previouslySelectedBoss && previouslySelectedBoss.currentHp > 0) {
          setCurrentBossId(previouslySelectedBoss.id);
        } else if (fetchedBosses.length > 0) {
          // If previous boss is defeated or not found, find the first active boss
          const firstActiveBoss = fetchedBosses.find(boss => boss.currentHp > 0);
          if (firstActiveBoss) {
            setCurrentBossId(firstActiveBoss.id);
          } else {
            // If no active bosses, select the first one (even if defeated)
            setCurrentBossId(fetchedBosses[0].id);
          }
        } else {
          setCurrentBossId(null); // No bosses available
        }

        // Load tasks from backend
        console.log("Fetching tasks from /api/tasks...");
        const fetchedTasks = await api.get('/tasks', { idToken });
        console.log("Fetched tasks data:", fetchedTasks);
        setTasks(fetchedTasks.map(t => ({ ...t, name: t.title }))); // Map title to name for consistency

        // Load user info from backend
        // fetchUserInfo is now handled by UserContext

      } catch (error) {
        console.error("Error loading data:", error);
      }
    } else {
      console.log("userId or idToken not present. Skipping fetch.", { userId, idToken });
    }
  }, [userId, idToken]);

  useEffect(() => {
    if (userId && idToken) {
      loadData();
    }
  }, [userId, idToken]);

  useEffect(() => {
    console.log("Current boss ID updated:", currentBossId);
  }, [currentBossId]);

  useEffect(() => {
    if ("Notification" in window) {
      Notification.requestPermission();
    }
  }, []);

  useEffect(() => {
    const checkRecurrence = () => {
      setTasks(prevTasks => {
        const today = new Date().toISOString().split('T')[0];
        const updatedTasks = prevTasks.map(task => {
          if (task.recurrenceDays > 0 && task.completed) {
            const lastCompletedDate = new Date(task.lastCompleted);
            const nextRecurrenceDate = new Date(lastCompletedDate);
            nextRecurrenceDate.setDate(lastCompletedDate.getDate() + task.recurrenceDays);

            if (nextRecurrenceDate.toISOString().split('T')[0] <= today) {
              return { ...task, completed: false, lastCompleted: null, isDue: true };
            }
          }
          return task;
        });
        return updatedTasks;
      });
    };

    checkRecurrence(); // Run once on component mount

    const midnight = new Date();
    midnight.setHours(24, 0, 0, 0);
    const timeToMidnight = midnight.getTime() - new Date().getTime();

    const timeoutId = setTimeout(() => {
      checkRecurrence(); // Run immediately at midnight
      const intervalId = setInterval(checkRecurrence, 24 * 60 * 60 * 1000); // Then every 24 hours
      return () => clearInterval(intervalId); // Cleanup for setInterval
    }, timeToMidnight);

    return () => clearTimeout(timeoutId); // Cleanup for setTimeout
  }, []); // Empty dependency array to run once on mount

  useEffect(() => {
    tasks.forEach(task => {
      if (task.isDue && Notification.permission === "granted") {
        new Notification("Task Due!", {
          body: `Time to complete: ${task.title}`,
        });
      }
    });
  }, [tasks]);

  const resetGame = async () => {
    if (!userId || !idToken) {
      alert("로그인이 필요합니다.");
      return;
    }

    try {
      // Fetch and delete all bosses for the current user from backend
      const fetchedBosses = await api.get('/goals', { idToken });
      const deleteBossPromises = fetchedBosses.map(boss =>
        api.delete(`/goals/${boss.id}`, { idToken })
      );
      await Promise.all(deleteBossPromises);

      // Fetch and delete all tasks for the current user from backend
      const fetchedTasks = await api.get('/tasks', { idToken });
      const deleteTaskPromises = fetchedTasks.map(task =>
        api.delete(`/tasks/${task.id}`, { idToken })
      );
      await Promise.all(deleteTaskPromises);

      // Clear local state
      setBosses([]);
      setCurrentBossId(null);
      setNewBossName('');
      setTasks([]);
      setTask('');
      setRecurrenceDays(0);
      setSelectedDifficulty('Medium');
      setSelectedParentTask('');
      setEditingTaskId(null); // Clear editing task ID
    } catch (error) {
      console.error("Error resetting game:", error);
      alert(`Failed to reset game: ${error.message}`);
    }
  }

  const handleSignOut = useCallback(async () => {
    try {
      await signOut(auth);
      alert('로그아웃 성공!');
      navigate('/auth'); // Redirect to auth page after logout
    } catch (err) {
      console.error('로그아웃 오류:', err);
    }
  }, [navigate]);

  const callBackendApi = async () => {
    if (!idToken) {
      alert("로그인이 필요합니다.");
      return;
    }
    try {
      const data = await api.get('/test', { idToken });
      alert(`백엔드 응답: ${data}`);
    } catch (error) {
      console.error("백엔드 호출 오류:", error);
      alert(`백엔드 호출 중 오류가 발생했습니다.: ${error.message}`);
    }
  };

  const addBoss = async () => {
    if (!newBossName) {
      alert('보스 이름을 입력해주세요.');
      return;
    }
    if (!userId || !idToken) {
      alert('로그인 후 보스를 추가할 수 있습니다.');
      return;
    }

    // Ensure gameConfig.bossHpMap is loaded
    const maxHp = gameConfig.bossHpMap[selectedBossDifficulty];
    if (!maxHp) {
      alert('게임 설정이 아직 로드되지 않았습니다. 잠시 후 다시 시도해주세요.');
      return;
    }

    const bossData = {
      title: newBossName,
      maxHp: maxHp,
      currentHp: maxHp,
      userId: userId,
      parentGoalId: selectedParentBoss || null,
      dueDate: newBossDueDate || null,
      status: selectedBossDifficulty, // Using difficulty as status for now
    };

    try {
      await api.post('/goals', bossData, { idToken });

      // Reload all data to ensure UI is in sync with backend
      await loadData(); 

      // Reset form and close modal
      setNewBossName('');
      setSelectedBossDifficulty('Medium');
      setSelectedParentBoss('');
      setNewBossDueDate('');
      setShowAddBossModal(false);
    } catch (e) {
      console.error("Error adding boss:", e);
      alert(`Failed to add boss: ${e.message}`);
    }
  };

  const editBoss = async () => {
    if (!editingBossId) {
      alert('수정할 보스를 선택해주세요.');
      return;
    }
    if (!editingBossName) {
      alert('보스 이름을 입력해주세요.');
      return;
    }
    if (!userId || !idToken) {
      alert('로그인 후 보스를 수정할 수 있습니다.');
      return;
    }

    const bossData = {
      title: editingBossName,
      // HP는 변경하지 않고 기존 값을 유지하거나, 필요하다면 백엔드에서 처리
      // maxHp: gameConfig.bossHpMap[editingBossDifficulty],
      // currentHp: gameConfig.bossHpMap[editingBossDifficulty],
      userId: userId,
      parentGoalId: editingParentBoss || null,
      dueDate: editingBossDueDate || null,
      status: editingBossDifficulty, // Using difficulty as status for now
    };

    try {
      await api.put(`/goals/${editingBossId}`, bossData, { idToken });
      await loadData(); // Reload all data to ensure UI is in sync with backend
      setShowEditBossModal(false);
    } catch (e) {
      console.error("Error editing boss:", e);
      alert(`Failed to edit boss: ${e.message}`);
    }
  };

  const deleteBoss = async () => {
    if (!editingBossId) {
      alert('삭제할 보스를 선택해주세요.');
      return;
    }
    if (!userId || !idToken) {
      alert('로그인 후 보스를 삭제할 수 있습니다.');
      return;
    }

    if (!window.confirm('정말로 이 보스를 삭제하시겠습니까? 이 작업은 되돌릴 수 없습니다.')) {
      return;
    }

    try {
      await api.delete(`/goals/${editingBossId}`, { idToken });
      await loadData(); // Reload all data to ensure UI is in sync with backend
      setShowEditBossModal(false);
      setCurrentBossId(null); // Clear current boss if deleted
    } catch (e) {
      console.error("Error deleting boss:", e);
      alert(`Failed to delete boss: ${e.message}`);
    }
  };

  if (isVictory) {
      return (
          <div className="container text-center mt-5">
              <h1 className="display-1 text-success">VICTORY!</h1>
              <p className="lead">You have defeated the {currentBoss.title}!</p>
              <div>
                <Boss bossName={currentBoss.title} currentHp={0} maxHp={currentBoss.maxHp} takingDamage={false} isDefeated={true} />
              </div>
              <button className="btn btn-primary mt-3" onClick={resetGame}>
                  Start a New Challenge
              </button>
          </div>
      )
  }

  

  

  

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
            <BossDisplay 
              currentBoss={currentBoss} 
              takingDamage={takingDamage} 
              onEditBossClick={() => {
                setEditingBossId(currentBoss.id);
                setEditingBossName(currentBoss.title);
                setEditingBossDifficulty(currentBoss.status);
                setEditingBossDueDate(currentBoss.dueDate || '');
                setEditingParentBoss(currentBoss.parentGoalId || '');
                setShowEditBossModal(true);
              }}
            />
          )}

          {/* Add Task Form */}
          <AddTaskForm
            task={task}
            setTask={setTask}
            recurrenceDays={recurrenceDays}
            setRecurrenceDays={setRecurrenceDays}
            selectedDifficulty={selectedDifficulty}
            setSelectedDifficulty={setSelectedDifficulty}
            selectedParentTask={selectedParentTask}
            setSelectedParentTask={setSelectedParentTask}
            saveTask={saveTask}
            editingTaskId={editingTaskId}
            tasks={tasks}
            DIFFICULTY_DAMAGE_MAP={DIFFICULTY_DAMAGE_MAP}
          />

          <BossList
            bossList={bosses}
            allTasks={tasks}
            currentBossId={currentBossId}
            setCurrentBossId={setCurrentBossId}
            collapsedBosses={collapsedBosses}
            toggleBossCollapse={toggleBossCollapse}
            toggleTask={toggleTask}
            editTask={editTask}
            deleteTask={deleteTask}
          />

        {/* Right Panel */}
        <div className="col-md-3">
          <PlayerInfoCard playerHp={playerHp} handleSignOut={handleSignOut} />
        </div>
      </div>
    </div>
  );
}

export default App;



