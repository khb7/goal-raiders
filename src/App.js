import React, { useState, useEffect } from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import Auth from './components/Auth'; // Auth 컴포넌트 import
import Boss from './Boss';

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

  const DIFFICULTY_DAMAGE_MAP = {
    Easy: 5,
    Medium: 10,
    Hard: 20,
    Epic: 50,
  };

  const currentBoss = currentBossId ? bosses.find(boss => boss.id === currentBossId) : null;
  const isVictory = currentBoss && currentBoss.currentHp <= 0;

  const saveTask = () => {
    if (task && currentBossId) {
      if (editingTaskId) {
        // Update existing task
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
      } else {
        // Add new task
        setTasks([...tasks, { 
          id: Date.now(), // Unique ID for each task
          name: task, 
          completed: false, 
          recurrenceDays: parseInt(recurrenceDays), 
          lastCompleted: null, 
          difficulty: selectedDifficulty,
          parentId: selectedParentTask || null,
          bossId: currentBossId, // Associate task with current boss
        }]);
      }
      setTask('');
      setRecurrenceDays(0);
      setSelectedDifficulty('Medium');
      setSelectedParentTask('');
    }
  };

  const toggleTask = (id) => {
    const taskIndex = tasks.findIndex(t => t.id === id);
    if (taskIndex === -1) return;

    const newTasks = [...tasks];
    if (!newTasks[taskIndex].completed) {
        setTakingDamage(true);
        setBosses(prevBosses => prevBosses.map(boss => 
            boss.id === currentBossId 
            ? { ...boss, currentHp: boss.currentHp - DIFFICULTY_DAMAGE_MAP[newTasks[taskIndex].difficulty] } 
            : boss
        ));
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

  const editTask = (id) => {
    const taskToEdit = tasks.find(t => t.id === id);
    if (taskToEdit) {
      setTask(taskToEdit.name);
      setRecurrenceDays(taskToEdit.recurrenceDays);
      setSelectedDifficulty(taskToEdit.difficulty);
      setSelectedParentTask(taskToEdit.parentId || '');
      setEditingTaskId(id);
    }
  };

  const deleteTask = (id) => {
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

    setTasks(tasks.filter(t => !tasksToDelete.includes(t.id)));
  };

  const loadData = () => {
    if (userId) {
      const savedBosses = localStorage.getItem(`bosses_${userId}`);
      const savedTasks = localStorage.getItem(`tasks_${userId}`);
      if (savedBosses) {
        setBosses(JSON.parse(savedBosses));
      }
      if (savedTasks) {
        setTasks(JSON.parse(savedTasks));
      }
    }
  };

  const saveData = () => {
    if (userId) {
      localStorage.setItem(`bosses_${userId}`, JSON.stringify(bosses));
      localStorage.setItem(`tasks_${userId}`, JSON.stringify(tasks));
    }
  };

  useEffect(() => {
    if ("Notification" in window) {
      Notification.requestPermission();
    }
    // Load data when userId changes or on initial mount if userId is already set
    if (userId) {
      loadData();
    }
  }, [userId]);

  useEffect(() => {
    // Save data whenever bosses or tasks change, but only if userId is set
    if (userId) {
      saveData();
    }
  }, [bosses, tasks, userId]);

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

  const resetGame = () => {
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

  const addBoss = () => {
    if (newBossName && newBossHp > 0) {
      const newBoss = {
        id: Date.now(),
        name: newBossName,
        maxHp: parseInt(newBossHp),
        currentHp: parseInt(newBossHp),
      };
      setBosses([...bosses, newBoss]);
      setCurrentBossId(newBoss.id);
      setNewBossName('');
      setNewBossHp(100);
    }
  };

  if (isVictory) {
      return (
          <div className="container text-center mt-5">
              <h1 className="display-1 text-success">VICTORY!</h1>
              <p className="lead">You have defeated the {currentBoss.name}!</p>
              <div style={{transform: 'rotate(90deg)'}}>
                <Boss bossName={currentBoss.name} currentHp={0} maxHp={currentBoss.maxHp} takingDamage={false} />
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
          <Auth /> {/* Auth 컴포넌트 렌더링 */}
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
              <label htmlFor="newBossNameInput" className="form-label">New Boss Name:</label>
              <input
                  type="text"
                  id="newBossNameInput"
                  className="form-control"
                  value={newBossName}
                  onChange={(e) => setNewBossName(e.target.value)}
                  placeholder="Enter new boss name"
              />
              <label htmlFor="newBossHpInput" className="form-label">New Boss Max HP:</label>
              <input
                  type="number"
                  id="newBossHpInput"
                  className="form-control"
                  value={newBossHp}
                  onChange={(e) => setNewBossHp(e.target.value)}
                  placeholder="Enter new boss HP"
              />
              <button className="btn btn-primary mt-2" onClick={addBoss}>Add New Boss</button>
          </div>

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