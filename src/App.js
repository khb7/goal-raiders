import React, { useState, useEffect, useCallback } from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import { Modal, Button, Form } from 'react-bootstrap'; // Import Modal, Button, Form

import Boss from './Boss';

import { auth, db } from './index'; // auth, db 객체 import
import { onAuthStateChanged, signOut } from 'firebase/auth';
import { collection, addDoc, getDocs, updateDoc, doc, deleteDoc, query, where } from 'firebase/firestore';
import { useNavigate } from 'react-router-dom';

function App() {
  const [bosses, setBosses] = useState([]);
  const [currentBossId, setCurrentBossId] = useState(null);
  const [newBossName, setNewBossName] = useState('');
  const [newBossHp, setNewBossHp] = useState(100);
  const [tasks, setTasks] = useState([]);
  const [task, setTask] = useState('');
  const [recurrenceDays, setRecurrenceDays] = useState(0); // 0 for no recurrence
  const [selectedDifficulty, setSelectedDifficulty] = useState('Medium'); // Default difficulty
  const [selectedParentTask, setSelectedParentTask] = useState(''); // For sub-tasks
  const [takingDamage, setTakingDamage] = useState(false);
  const [userId, setUserId] = useState(''); // User ID for data persistence
  const [editingTaskId, setEditingTaskId] = useState(null); // State to hold the ID of the task being edited
  const [showBossSettingsModal, setShowBossSettingsModal] = useState(false); // State for modal visibility
  const [selectedBossDifficulty, setSelectedBossDifficulty] = useState('Medium'); // New state for boss difficulty
  const [user, setUser] = useState(null); // User state for login status
  const navigate = useNavigate();

  // Listen for authentication state changes
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      if (currentUser) {
        setUserId(currentUser.uid); // Set userId when user is logged in
      } else {
        setUserId(''); // Clear userId when user is logged out
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
    if (task && currentBossId && userId) { // Ensure userId is available
      if (editingTaskId) {
        // Update existing task in Firestore
        try {
          const taskRef = doc(db, "tasks", editingTaskId);
          await updateDoc(taskRef, {
            name: task,
            recurrenceDays: parseInt(recurrenceDays),
            difficulty: selectedDifficulty,
            parentId: selectedParentTask || null,
          });
          setTasks(tasks.map(t => 
            t.id === editingTaskId
              ? { 
                  ...t, 
                  name: task, 
                  recurrenceDays: parseInt(recurrenceDays), 
                  difficulty: selectedDifficulty,
                  parentId: selectedParentTask || null,
                }
              : t
          ));
          setEditingTaskId(null);
        } catch (error) {
          console.error("Error updating task in Firestore:", error);
        }
      } else {
        // Add new task to Firestore
        const newTaskData = {
          name: task,
          completed: false,
          recurrenceDays: parseInt(recurrenceDays),
          lastCompleted: null,
          difficulty: selectedDifficulty,
          parentId: selectedParentTask || null,
          bossId: currentBossId,
          userId: userId, // Associate task with the current user
        };
        try {
          const docRef = await addDoc(collection(db, "tasks"), newTaskData);
          setTasks([...tasks, { id: docRef.id, ...newTaskData }]);
        } catch (error) {
          console.error("Error adding task to Firestore:", error);
        }
      }
      setTask('');
      setRecurrenceDays(0);
      setSelectedDifficulty('Medium');
      setSelectedParentTask('');
    }
  };

  const toggleTask = async (id) => {
    const taskIndex = tasks.findIndex(t => t.id === id);
    if (taskIndex === -1) return;

    const newTasks = [...tasks];
    if (!newTasks[taskIndex].completed) {
        setTakingDamage(true);
        const damage = DIFFICULTY_DAMAGE_MAP[newTasks[taskIndex].difficulty];
        const updatedBosses = bosses.map(boss => 
            boss.id === currentBossId 
            ? { ...boss, currentHp: boss.currentHp - damage } 
            : boss
        );
        setBosses(updatedBosses);

        // Update boss HP in Firestore
        try {
          const bossRef = doc(db, "bosses", currentBossId);
          await updateDoc(bossRef, { currentHp: updatedBosses.find(b => b.id === currentBossId).currentHp });
        } catch (error) {
          console.error("Error updating boss HP in Firestore:", error);
        }

        newTasks[taskIndex].completed = true;
        newTasks[taskIndex].lastCompleted = new Date().toISOString().split('T')[0]; // YYYY-MM-DD
        setTimeout(() => setTakingDamage(false), 500); 
    } else {
        // If uncompleting a task, allow it to be re-completed
        newTasks[taskIndex].completed = false;
        newTasks[taskIndex].lastCompleted = null; // Reset last completed date
    }
    setTasks(newTasks);
  };

  const editTask = async (id) => {
    const taskToEdit = tasks.find(t => t.id === id);
    if (taskToEdit) {
      setTask(taskToEdit.name);
      setRecurrenceDays(taskToEdit.recurrenceDays);
      setSelectedDifficulty(taskToEdit.difficulty);
      setSelectedParentTask(taskToEdit.parentId || '');
      setEditingTaskId(id);
    }
  };

  const deleteTask = async (id) => {
    const tasksToDelete = [id];
    const findChildren = (parentId) => {
      tasks.forEach(t => {
        if (t.parentId === parentId) {
          tasksToDelete.push(t.id);
          findChildren(t.id);
        }
      });
    };
    findChildren(id);

    // Delete tasks from Firestore
    try {
      const deletePromises = tasksToDelete.map(taskId => deleteDoc(doc(db, "tasks", taskId)));
      await Promise.all(deletePromises);
      setTasks(tasks.filter(t => !tasksToDelete.includes(t.id)));
    } catch (error) {
      console.error("Error deleting tasks from Firestore:", error);
    }
  };

  const loadData = async () => {
    if (userId) {
      // Load bosses from Firestore
      const bossesCollectionRef = collection(db, "bosses");
      const q = query(bossesCollectionRef, where("userId", "==", userId));
      const querySnapshot = await getDocs(q);
      const fetchedBosses = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setBosses(fetchedBosses);

      // Load tasks from Firestore (assuming tasks are also user-specific)
      const tasksCollectionRef = collection(db, "tasks");
      const tasksQuery = query(tasksCollectionRef, where("userId", "==", userId));
      const tasksSnapshot = await getDocs(tasksQuery);
      const fetchedTasks = tasksSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setTasks(fetchedTasks);
    }
  };

  

  

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
          body: `Time to complete: ${task.name}`,
        });
      }
    });
  }, [tasks]);

  const resetGame = async () => {
    // Delete all bosses for the current user from Firestore
    if (userId) {
      const bossesCollectionRef = collection(db, "bosses");
      const q = query(bossesCollectionRef, where("userId", "==", userId));
      const querySnapshot = await getDocs(q);
      const deletePromises = querySnapshot.docs.map(docToDelete => deleteDoc(doc(db, "bosses", docToDelete.id)));
      await Promise.all(deletePromises);

      // Delete all tasks for the current user from Firestore
      const tasksCollectionRef = collection(db, "tasks");
      const tasksQuery = query(tasksCollectionRef, where("userId", "==", userId));
      const tasksSnapshot = await getDocs(tasksQuery);
      const deleteTasksPromises = tasksSnapshot.docs.map(docToDelete => deleteDoc(doc(db, "tasks", docToDelete.id)));
      await Promise.all(deleteTasksPromises);
    }

    setBosses([]);
    setCurrentBossId(null);
    setNewBossName('');
    setNewBossHp(100);
    setTasks([]);
    setTask('');
    setRecurrenceDays(0);
    setSelectedDifficulty('Medium');
    setSelectedParentTask('');
    setEditingTaskId(null); // Clear editing task ID
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

  const addBoss = async () => {
    if (!newBossName) {
      alert('보스 이름을 입력해주세요.');
      return;
    }
    if (!userId) {
      alert('로그인 후 보스를 추가할 수 있습니다.');
      return;
    }

    const finalBossHp = newBossHp > 0 && newBossHp !== 100 ? parseInt(newBossHp) : BOSS_HP_MAP[selectedBossDifficulty];
    const newBossData = {
      name: newBossName,
      maxHp: finalBossHp,
      currentHp: finalBossHp,
      userId: userId, // Associate boss with the current user
    };

    try {
      const docRef = await addDoc(collection(db, "bosses"), newBossData);
      const addedBoss = { id: docRef.id, ...newBossData };
      setBosses([...bosses, addedBoss]);
      setCurrentBossId(addedBoss.id);
      setNewBossName('');
      setNewBossHp(100); // Reset to default for next time
      setSelectedBossDifficulty('Medium'); // Reset to default
      setShowBossSettingsModal(false); // Close modal after adding boss
    } catch (e) {
      console.error("Error adding document: ", e);
    }
  };

  if (isVictory) {
      return (
          <div className="container text-center mt-5">
              <h1 className="display-1 text-success">VICTORY!</h1>
              <p className="lead">You have defeated the {currentBoss.name}!</p>
              <div>
                <Boss bossName={currentBoss.name} currentHp={0} maxHp={currentBoss.maxHp} takingDamage={false} isDefeated={true} />
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
            {task.name} ({task.difficulty} - {DIFFICULTY_DAMAGE_MAP[task.difficulty]} HP)
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
          {currentBoss && (
            <div className="d-flex align-items-center">
              <span className="me-2">Current Boss: <strong>{currentBoss.name}</strong></span>
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
          )}
          <div>
            <button className="btn btn-outline-primary btn-sm" onClick={resetGame}>New Game</button>
          </div>
        </div>
      </div>

      {/* Page Title Area */}
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
                          <Form.Label htmlFor="newBossHpInput">New Boss Max HP:</Form.Label>
                          <Form.Control
                              type="number"
                              id="newBossHpInput"
                              value={newBossHp}
                              onChange={(e) => setNewBossHp(e.target.value)}
                              placeholder="Enter new boss HP (optional)"
                          />
                          <Form.Text className="text-muted">
                              Leave blank to use HP based on selected difficulty.
                          </Form.Text>
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
              <label htmlFor="selectBoss" className="form-label">Select Boss:</label>
              <select
                  id="selectBoss"
                  className="form-select"
                  value={currentBossId || ''}
                  onChange={(e) => setCurrentBossId(parseInt(e.target.value))}
              >
                  <option value="">Select a Boss</option>
                  {bosses.map(boss => (
                      <option key={boss.id} value={boss.id}>{boss.name}</option>
                  ))}
              </select>
          </div>

          {currentBoss && (
              <Boss bossName={currentBoss.name} currentHp={currentBoss.currentHp} maxHp={currentBoss.maxHp} takingDamage={takingDamage} />
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