import React, { useState, useEffect, useCallback } from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import { Modal, Button, Form } from 'react-bootstrap'; // Import Modal, Button, Form



import { auth } from './index'; // auth 객체 import
import { onAuthStateChanged, signOut } from 'firebase/auth';
import { useNavigate } from 'react-router-dom';
import Boss from './Boss';

function App() {
  
  const [tasks, setTasks] = useState([]);
  const [task, setTask] = useState('');
  const [recurrenceDays, setRecurrenceDays] = useState(0); // 0 for no recurrence
  const [selectedDifficulty, setSelectedDifficulty] = useState('Medium'); // Default difficulty
  const [selectedParentTask, setSelectedParentTask] = useState(''); // For sub-tasks
  const [selectedParentBoss, setSelectedParentBoss] = useState(''); // For sub-bosses
  const [userId, setUserId] = useState(null); // User ID state
  const [bosses, setBosses] = useState([]); // Bosses state
  const [currentBossId, setCurrentBossId] = useState(null); // Current boss ID state
  const [newBossName, setNewBossName] = useState(''); // New boss name state
  const [selectedBossDifficulty, setSelectedBossDifficulty] = useState('Medium'); // New boss difficulty state
  const [newBossDueDate, setNewBossDueDate] = useState(''); // New boss due date state
  const [showBossSettingsModal, setShowBossSettingsModal] = useState(false); // Boss settings modal state
  const [editingTaskId, setEditingTaskId] = useState(null); // Editing task ID state
  const [takingDamage, setTakingDamage] = useState(false); // Taking damage animation state

  const [user, setUser] = useState(null); // User state for login status
  const [idToken, setIdToken] = useState(null); // Firebase ID Token
  const navigate = useNavigate();

  // Listen for authentication state changes
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      setUser(currentUser);
      if (currentUser) {
        setUserId(currentUser.uid); // Set userId when user is logged in
        const token = await currentUser.getIdToken();
        setIdToken(token); // Store the ID token
        console.log("Firebase User:", currentUser);
        console.log("Fetched ID Token:", token);
      } else {
        setUserId(''); // Clear userId when user is logged out
        setIdToken(null); // Clear ID token
        console.log("User logged out.");
      }
    });
    return () => unsubscribe(); // Cleanup subscription on unmount
  }, []);

  const DIFFICULTY_DAMAGE_MAP = {
    Easy: 5,
    Medium: 10,
    Hard: 20,
    Epic: 50,
  };

  const BOSS_HP_MAP = {
    Easy: 50,
    Medium: 100,
    Hard: 200,
    Epic: 500,
  };

  const currentBoss = currentBossId ? bosses.find(boss => boss.id === currentBossId) : null;
  const isVictory = currentBoss && currentBoss.currentHp <= 0;

  const saveTask = async () => {
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
        let response;
        if (editingTaskId) {
          // Update existing task
          response = await fetch(`http://localhost:8080/api/tasks/${editingTaskId}`, {
            method: 'PUT',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${idToken}`,
            },
            body: JSON.stringify(taskData),
          });
        } else {
          // Add new task
          response = await fetch('http://localhost:8080/api/tasks', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${idToken}`,
            },
            body: JSON.stringify(taskData),
          });
        }

        if (response.ok) {
          const savedTask = await response.json();
          if (editingTaskId) {
            setTasks(tasks.map(t => (t.id === editingTaskId ? savedTask : t)));
            setEditingTaskId(null);
          } else {
            setTasks([...tasks, savedTask]);
          }
        } else {
          const errorText = await response.text();
          console.error("Error saving task:", errorText);
          alert(`Failed to save task: ${errorText}`);
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
      const response = await fetch(`http://localhost:8080/api/tasks/${id}/complete`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${idToken}`,
        },
      });

      if (response.ok) {
        const updatedTask = await response.json();
        setTasks(prevTasks => prevTasks.map(t =>
          t.id === updatedTask.id
            ? { ...updatedTask, name: updatedTask.title } // Map title to name for consistency
            : t
        ));

        // Fetch updated boss data after task completion
        if (updatedTask.goalId) {
          const bossResponse = await fetch(`http://localhost:8080/api/goals/${updatedTask.goalId}`, {
            headers: {
              'Authorization': `Bearer ${idToken}`,
            },
          });
          if (bossResponse.ok) {
            const updatedBoss = await bossResponse.json();
            setBosses(prevBosses => prevBosses.map(boss =>
              boss.id === updatedBoss.id
                ? updatedBoss
                : boss
            ));
          } else {
            console.error("Failed to fetch updated boss data");
          }
        }
      } else {
        const errorText = await response.text();
        alert(`Failed to complete task: ${errorText}`);
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
      const response = await fetch(`http://localhost:8080/api/tasks/${id}`, {
        headers: {
          'Authorization': `Bearer ${idToken}`,
        },
      });
      if (response.ok) {
        const taskToEdit = await response.json();
        setTask(taskToEdit.title);
        setRecurrenceDays(taskToEdit.recurrenceDays);
        setSelectedDifficulty(taskToEdit.difficulty);
        setSelectedParentTask(taskToEdit.parentTaskId || '');
        setEditingTaskId(id);
      } else {
        const errorText = await response.text();
        console.error("Error fetching task for edit:", errorText);
        alert(`Failed to fetch task for edit: ${errorText}`);
      }
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
      const response = await fetch(`http://localhost:8080/api/tasks/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${idToken}`,
        },
      });
      if (response.ok) {
        setTasks(tasks.filter(t => t.id !== id));
      } else {
        const errorText = await response.text();
        console.error("Error deleting task:", errorText);
        alert(`Failed to delete task: ${errorText}`);
      }
    } catch (error) {
      console.error("Error deleting task:", error);
      alert(`Failed to delete task: ${error.message}`);
    }
  };

  const loadData = useCallback(async () => {
    if (userId && idToken) {
      try {
        // Load bosses from backend
        const bossesResponse = await fetch('http://localhost:8080/api/goals', {
          headers: {
            'Authorization': `Bearer ${idToken}`,
          },
        });
        if (bossesResponse.ok) {
          const fetchedBosses = await bossesResponse.json();
          setBosses(fetchedBosses);
          if (fetchedBosses.length > 0) {
            setCurrentBossId(fetchedBosses[0].id); // Set first boss as current
          }
        } else {
          console.error("Failed to fetch bosses:", await bossesResponse.text());
        }

        // Load tasks from backend
        const tasksResponse = await fetch('http://localhost:8080/api/tasks', {
          headers: {
            'Authorization': `Bearer ${idToken}`,
          },
        });
        if (tasksResponse.ok) {
          const fetchedTasks = await tasksResponse.json();
          setTasks(fetchedTasks.map(t => ({ ...t, name: t.title }))); // Map title to name for consistency
        } else {
          console.error("Failed to fetch tasks:", await tasksResponse.text());
        }
      } catch (error) {
        console.error("Error loading data:", error);
      }
    }
  }, [userId, idToken]);

  

  

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
      const bossesResponse = await fetch('http://localhost:8080/api/goals', {
        headers: {
          'Authorization': `Bearer ${idToken}`,
        },
      });
      if (bossesResponse.ok) {
        const fetchedBosses = await bossesResponse.json();
        const deleteBossPromises = fetchedBosses.map(boss =>
          fetch(`http://localhost:8080/api/goals/${boss.id}`, {
            method: 'DELETE',
            headers: {
              'Authorization': `Bearer ${idToken}`,
            },
          })
        );
        await Promise.all(deleteBossPromises);
      } else {
        console.error("Failed to fetch bosses for deletion:", await bossesResponse.text());
      }

      // Fetch and delete all tasks for the current user from backend
      const tasksResponse = await fetch('http://localhost:8080/api/tasks', {
        headers: {
          'Authorization': `Bearer ${idToken}`,
        },
      });
      if (tasksResponse.ok) {
        const fetchedTasks = await tasksResponse.json();
        const deleteTaskPromises = fetchedTasks.map(task =>
          fetch(`http://localhost:8080/api/tasks/${task.id}`, {
            method: 'DELETE',
            headers: {
              'Authorization': `Bearer ${idToken}`,
            },
          })
        );
        await Promise.all(deleteTaskPromises);
      } else {
        console.error("Failed to fetch tasks for deletion:", await tasksResponse.text());
      }

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
      const response = await fetch('http://localhost:8080/api/test', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${idToken}`,
          'Content-Type': 'application/json',
        },
      });
      if (response.ok) {
        const data = await response.text();
        alert(`백엔드 응답: ${data}`);
      } else {
        const errorText = await response.text();
        alert(`백엔드 호출 실패: ${response.status} - ${errorText}`);
      }
    } catch (error) {
      console.error("백엔드 호출 오류:", error);
      alert("백엔드 호출 중 오류가 발생했습니다.");
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

    const bossData = {
      title: newBossName,
      maxHp: BOSS_HP_MAP[selectedBossDifficulty],
      currentHp: BOSS_HP_MAP[selectedBossDifficulty],
      userId: userId,
      parentGoalId: selectedParentBoss || null,
      dueDate: newBossDueDate || null,
      status: selectedBossDifficulty, // Using difficulty as status for now
    };

    try {
      const response = await fetch('http://localhost:8080/api/goals', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${idToken}`,
        },
        body: JSON.stringify(bossData),
      });

      if (response.ok) {
        const addedBoss = await response.json();
        setBosses([...bosses, addedBoss]);
        setCurrentBossId(addedBoss.id);
        setNewBossName('');
        setSelectedBossDifficulty('Medium');
        setSelectedParentBoss('');
        setNewBossDueDate('');
        setShowBossSettingsModal(false);
      } else {
        const errorText = await response.text();
        console.error("Error adding boss:", errorText);
        alert(`Failed to add boss: ${errorText}`);
      }
    } catch (e) {
      console.error("Error adding boss:", e);
      alert(`Failed to add boss: ${e.message}`);
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

  const renderTasks = (taskList, parentId = null, indent = 0) => {
    return taskList
      .filter(task => task.parentId === parentId)
      .map(task => (
        <React.Fragment key={task.id}>
          <li
            className={`list-group-item d-flex justify-content-between align-items-center ${
              task.completed ? 'list-group-item-secondary text-decoration-line-through' : ''
            } ${task.isDue ? 'list-group-item-info' : ''}`}
            style={{ paddingLeft: `${20 + indent * 20}px` }}
          >
            {task.title} ({task.difficulty} - {DIFFICULTY_DAMAGE_MAP[task.difficulty]} HP)
            <div>
              <button
                className={`btn ${task.completed ? 'btn-warning' : 'btn-success'}`}
                onClick={() => toggleTask(task.id)}
                disabled={task.completed}
              >
                {task.completed ? 'Completed' : 'Complete Task'}
              </button>
              <button
                className="btn btn-info ms-2"
                onClick={() => editTask(task.id)}
              >
                Edit
              </button>
              <button
                className="btn btn-danger ms-2"
                onClick={() => deleteTask(task.id)}
              >
                Delete
              </button>
            </div>
          </li>
          {renderTasks(taskList, task.id, indent + 1)}
        </React.Fragment>
      ));
  };

  

  const renderBosses = (bossList, parentId = null, indent = 0) => {
    return bossList
      .filter(boss => boss.parentId === parentId)
      .map(boss => (
        <React.Fragment key={boss.id}>
          <li
            className={`list-group-item d-flex justify-content-between align-items-center ${boss.id === currentBossId ? 'active' : ''}`}
            style={{ paddingLeft: `${20 + indent * 20}px` }}
            onClick={() => setCurrentBossId(boss.id)}
          >
            {boss.title} ({boss.currentHp} / {boss.maxHp} HP)
            <div>
              {/* Add boss specific actions here if needed */}
            </div>
          </li>
          {renderBosses(bossList, boss.id, indent + 1)}
        </React.Fragment>
      ));
  };

  return (
    <div className="container-fluid mt-3 app-main-background d-flex flex-column min-vh-100">
      {/* Header */}
      <div className="row mb-3">
        <div className="col-md-12 p-3 d-flex justify-content-between align-items-center">
          <h1 className="h3 mb-0">Goal Raiders</h1>
          <div>
            {user ? (
              <>
                <span className="me-2">Welcome, {user.email}</span>
                <button className="btn btn-outline-secondary btn-sm" onClick={handleSignOut}>Logout</button>
              </>
            ) : (
              <button className="btn btn-outline-primary btn-sm" onClick={() => navigate('/auth')}>Login / Sign Up</button>
            )}
          </div>
          <div>
            <button className="btn btn-outline-primary btn-sm" onClick={resetGame}>New Game</button>
          </div>
        </div>
      </div>
          {currentBoss && (
            <div>
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
      <div className="bg-light p-4 mb-4 rounded-3">
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
          <div className="mb-4">
              <Button variant="primary" onClick={() => setShowBossSettingsModal(true)}>
                  Boss Settings
              </Button>
          </div>

          <Modal show={showBossSettingsModal} onHide={() => setShowBossSettingsModal(false)}>
              <Modal.Header closeButton>
                  <Modal.Title>Boss Settings</Modal.Title>
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
                                  <option key={boss.id} value={boss.id}>{boss.name}</option>
                              ))}
                          </Form.Select>
                      </Form.Group>
                  </Form>
              </Modal.Body>
              <Modal.Footer>
                  <Button variant="secondary" onClick={() => setShowBossSettingsModal(false)}>
                      Cancel
                  </Button>
                  <Button variant="primary" onClick={addBoss}>
                      Add Boss
                  </Button>
              </Modal.Footer>
          </Modal>

          <div className="mb-4">
              <h3 className="card-title">Bosses</h3>
              <ul className="list-group">
                  {renderBosses(bosses)}
              </ul>
          </div>

          {currentBoss && (
              <Boss bossName={currentBoss.title} currentHp={currentBoss.currentHp} maxHp={currentBoss.maxHp} takingDamage={takingDamage} dueDate={currentBoss.dueDate} />
          )}

          <div className="card">
              <div className="card-body">
                  <h3 className="card-title">Tasks (Your Attacks)</h3>
                  <div className="input-group mb-3">
                      <input
                      type="text"
                      className="form-control"
                      value={task}
                      onChange={(e) => setTask(e.target.value)}
                      placeholder="Enter a new task to damage the boss"
                      onKeyPress={(e) => e.key === 'Enter' && saveTask()}
                      />
                  </div>
                  <div className="input-group mb-3">
                      <input
                          type="number"
                          className="form-control"
                          value={recurrenceDays}
                          onChange={(e) => setRecurrenceDays(e.target.value)}
                          placeholder="Recurrence (days, 0 for none)"
                      />
                  </div>
                  <div className="input-group mb-3">
                      <select
                          className="form-select"
                          value={selectedDifficulty}
                          onChange={(e) => setSelectedDifficulty(e.target.value)}
                      >
                          {Object.keys(DIFFICULTY_DAMAGE_MAP).map(difficulty => (
                              <option key={difficulty} value={difficulty}>{difficulty}</option>
                          ))}
                      </select>
                  </div>
                  <div className="input-group mb-3">
                      <select
                          className="form-select"
                          value={selectedParentTask}
                          onChange={(e) => setSelectedParentTask(e.target.value)}
                      >
                          <option value="">No Parent Task</option>
                          {tasks.filter(t => t.bossId === currentBossId).map(t => (
                              <option key={t.id} value={t.id}>{t.name}</option>
                          ))}
                      </select>
                      <button className="btn btn-primary" onClick={saveTask}>
                      {editingTaskId ? 'Save Task' : 'Add Task'}
                      </button>
                  </div>
                  <ul className="list-group">
                      {renderTasks(tasks.filter(t => t.bossId === currentBossId))}
                  </ul>
              </div>
          </div>
        </div>

        {/* Right Panel */}
        <div className="col-md-3">
          <div className="card">
            <div className="card-body">
              <h5 className="card-title">오른쪽 패널</h5>
              <p className="card-text">여기에 활동 로그나 통계 등을 추가할 수 있습니다.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;