import React, { useState, useEffect, useCallback } from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import { Modal, Button, Form } from 'react-bootstrap'; // Import Modal, Button, Form



import './App.css';
import { auth } from './index'; // auth 객체 import
import { onAuthStateChanged, signOut } from 'firebase/auth';
import { useNavigate } from 'react-router-dom';
import Boss from './Boss';

const DIFFICULTY_DAMAGE_MAP = {
  Easy: 10,
  Medium: 20,
  Hard: 30,
  "Very Hard": 50,
};

const BOSS_DIFFICULTY_COLOR_MAP = {
  Easy: '#2E7D32',
  Medium: '#673AB7',
  Hard: '#C62828',
  "Very Hard": '#212121',
};

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
  const [showAddBossModal, setShowAddBossModal] = useState(false); // Add boss modal state
  const [showEditBossModal, setShowEditBossModal] = useState(false); // Edit boss modal state
  const [editingBossId, setEditingBossId] = useState(null); // ID of boss being edited
  const [editingBossName, setEditingBossName] = useState(''); // Name of boss being edited
  const [editingBossDifficulty, setEditingBossDifficulty] = useState('Medium'); // Difficulty of boss being edited
  const [editingBossDueDate, setEditingBossDueDate] = useState(''); // Due date of boss being edited
  const [editingParentBoss, setEditingParentBoss] = useState(''); // Parent boss of boss being edited
  const [showBossSelectionModal, setShowBossSelectionModal] = useState(false); // Boss selection modal state
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

  const [gameConfig, setGameConfig] = useState({
    difficultyDamageMap: {},
    bossHpMap: {},
  });

  useEffect(() => {
    const fetchGameConfig = async () => {
      try {
        const response = await fetch('http://localhost:8080/api/config/game');
        if (response.ok) {
          const config = await response.json();
          setGameConfig({
            difficultyDamageMap: config.difficultyDamageMap || {},
            bossHpMap: config.bossHpMap || {},
          });
        } else {
          console.error("Failed to fetch game config");
        }
      } catch (error) {
        console.error("Error fetching game config:", error);
      }
    };
    fetchGameConfig();
  }, []);

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
    console.log("loadData called.");
    if (userId && idToken) {
      console.log("userId and idToken are present. Proceeding with fetch.");
      try {
        // Load bosses from backend
        console.log("Fetching bosses from /api/goals...");
        const bossesResponse = await fetch('http://localhost:8080/api/goals', {
          headers: {
            'Authorization': `Bearer ${idToken}`,
          },
        });
        console.log("Bosses fetch response status:", bossesResponse.status, "ok:", bossesResponse.ok);
        if (bossesResponse.ok) {
          const fetchedBosses = await bossesResponse.json();
          console.log("Fetched bosses data:", fetchedBosses);
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
        } else {
          console.error("Failed to fetch bosses:", bossesResponse.status, await bossesResponse.text());
        }

        // Load tasks from backend
        console.log("Fetching tasks from /api/tasks...");
        const tasksResponse = await fetch('http://localhost:8080/api/tasks', {
          headers: {
            'Authorization': `Bearer ${idToken}`,
          },
        });
        console.log("Tasks fetch response status:", tasksResponse.status, "ok:", tasksResponse.ok);
        if (tasksResponse.ok) {
          const fetchedTasks = await tasksResponse.json();
          console.log("Fetched tasks data:", fetchedTasks);
          setTasks(fetchedTasks.map(t => ({ ...t, name: t.title }))); // Map title to name for consistency
        } else {
          console.error("Failed to fetch tasks:", tasksResponse.status, await tasksResponse.text());
        }
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
  }, [userId, idToken, loadData]);

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
      const response = await fetch('http://localhost:8080/api/goals', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${idToken}`,
        },
        body: JSON.stringify(bossData),
      });

      if (response.ok) {
        // Reload all data to ensure UI is in sync with backend
        await loadData(); 

        // Reset form and close modal
        setNewBossName('');
        setSelectedBossDifficulty('Medium');
        setSelectedParentBoss('');
        setNewBossDueDate('');
        setShowAddBossModal(false);
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
      const response = await fetch(`http://localhost:8080/api/goals/${editingBossId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${idToken}`,
        },
        body: JSON.stringify(bossData),
      });

      if (response.ok) {
        await loadData(); // Reload all data to ensure UI is in sync with backend
        setShowEditBossModal(false);
      } else {
        const errorText = await response.text();
        console.error("Error editing boss:", errorText);
        alert(`Failed to edit boss: ${errorText}`);
      }
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
      const response = await fetch(`http://localhost:8080/api/goals/${editingBossId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${idToken}`,
        },
      });

      if (response.ok) {
        await loadData(); // Reload all data to ensure UI is in sync with backend
        setShowEditBossModal(false);
        setCurrentBossId(null); // Clear current boss if deleted
      } else {
        const errorText = await response.text();
        console.error("Error deleting boss:", errorText);
        alert(`Failed to delete boss: ${errorText}`);
      }
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
            style={{
              paddingLeft: `${20 + indent * 20}px`,
              backgroundColor: BOSS_DIFFICULTY_COLOR_MAP[boss.status] || 'transparent',
            }}
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
      <div className="row mb-3 app-header-container">
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
          <div className="mb-4 d-flex justify-content-between">
              <Button variant="primary" onClick={() => setShowAddBossModal(true)}>
                  Add New Boss
              </Button>
              <Button variant="secondary" onClick={() => setShowBossSelectionModal(true)}>
                  Change Boss
              </Button>
          </div>

          {/* Boss Selection Modal */}
          <Modal show={showBossSelectionModal} onHide={() => setShowBossSelectionModal(false)}>
              <Modal.Header closeButton>
                  <Modal.Title>Select a Boss</Modal.Title>
              </Modal.Header>
              <Modal.Body>
                  <ul className="list-group">
                      {bosses.map(boss => (
                          <li 
                              key={boss.id} 
                              className="list-group-item list-group-item-action" 
                              onClick={() => { 
                                  setCurrentBossId(boss.id); 
                                  setShowBossSelectionModal(false); 
                              }}
                              style={{cursor: 'pointer'}}
                          >
                              {boss.title} ({boss.currentHp} / {boss.maxHp} HP)
                          </li>
                      ))}
                  </ul>
              </Modal.Body>
          </Modal>

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

          <div className="mb-4">
              <h3 className="card-title">Bosses</h3>
              <ul className="list-group">
                  {renderBosses(bosses)}
              </ul>
          </div>

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