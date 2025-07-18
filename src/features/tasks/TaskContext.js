import React, { createContext, useState, useEffect, useContext, useCallback } from 'react';
import { useUser } from '../../contexts/UserContext';
import { useBoss } from '../../features/bosses/BossContext';
import { DIFFICULTY_DAMAGE_MAP } from '../../utils/constants';

const TaskContext = createContext(null);

export const TaskProvider = ({ children }) => {
  const { userId, idToken } = useUser();
  const { currentBossId, loadBosses } = useBoss();
  const [tasks, setTasks] = useState([]);
  const [task, setTask] = useState('');
  const [recurrenceDays, setRecurrenceDays] = useState(0);
  const [selectedDifficulty, setSelectedDifficulty] = useState('Medium');
  const [selectedParentTask, setSelectedParentTask] = useState('');
  const [editingTaskId, setEditingTaskId] = useState(null);
  const [takingDamage, setTakingDamage] = useState(false);

  const loadTasks = useCallback(async () => {
    if (userId && idToken) {
      try {
        const tasksResponse = await fetch('http://localhost:8080/api/tasks', {
          headers: {
            'Authorization': `Bearer ${idToken}`,
          },
        });
        if (tasksResponse.ok) {
          const fetchedTasks = await tasksResponse.json();
          setTasks(fetchedTasks.map(t => ({ ...t, name: t.title })));
        } else {
          console.error("Failed to fetch tasks:", tasksResponse.status, await tasksResponse.text());
        }
      } catch (error) {
        console.error("Error loading tasks:", error);
      }
    }
  }, [userId, idToken]);

  const saveTask = useCallback(async () => {
    if (!currentBossId) {
      alert("Please select a boss before adding a task.");
      return;
    }
    if (task && userId) {
      const taskData = {
        title: task,
        completed: false,
        recurrenceDays: parseInt(recurrenceDays),
        lastCompleted: null,
        difficulty: selectedDifficulty,
        parentTaskId: selectedParentTask || null,
        goalId: currentBossId,
        userId: userId,
      };

      try {
        let response;
        if (editingTaskId) {
          response = await fetch(`http://localhost:8080/api/tasks/${editingTaskId}`, {
            method: 'PUT',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${idToken}`,
            },
            body: JSON.stringify(taskData),
          });
        } else {
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
  }, [task, userId, idToken, recurrenceDays, selectedDifficulty, selectedParentTask, currentBossId, editingTaskId, tasks]);

  const toggleTask = useCallback(async (id) => {
    if (!idToken) {
      alert("로그인이 필요합니다.");
      return;
    }

    setTakingDamage(true);

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
            ? { ...updatedTask, name: updatedTask.title }
            : t
        ));
        if (updatedTask.goalId) {
          loadBosses();
        }
      } else {
        const errorText = await response.text();
        alert(`Failed to complete task: ${errorText}`);
      }
    } catch (error) {
      console.error("Error completing task:", error);
      alert(`Failed to complete task: ${error.message}`);
    } finally {
      setTimeout(() => setTakingDamage(false), 500);
    }
  }, [idToken, loadBosses]);

  const editTask = useCallback(async (id) => {
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
  }, [idToken]);

  const deleteTask = useCallback(async (id) => {
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
  }, [idToken, tasks]);

  useEffect(() => {
    if (userId && idToken) {
      loadTasks();
    }
  }, [userId, idToken, loadTasks]);

  const checkRecurrence = useCallback(() => {
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
  }, []);

  useEffect(() => {
    checkRecurrence();

    const midnight = new Date();
    midnight.setHours(24, 0, 0, 0);
    const timeToMidnight = midnight.getTime() - new Date().getTime();

    const timeoutId = setTimeout(() => {
      checkRecurrence();
      const intervalId = setInterval(checkRecurrence, 24 * 60 * 60 * 1000);
      return () => clearInterval(intervalId);
    }, timeToMidnight);

    return () => clearTimeout(timeoutId);
  }, [checkRecurrence]);

  useEffect(() => {
    tasks.forEach(task => {
      if (task.isDue && Notification.permission === "granted") {
        new Notification("Task Due!", {
          body: `Time to complete: ${task.title}`,
        });
      }
    });
  }, [tasks]);

  const renderTasks = (taskList, parentId = null, indent = 0) => {
    return taskList
      .filter(task => task.parentTaskId === parentId)
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

  return (
    <TaskContext.Provider
      value={{
        tasks,
        task,
        setTask,
        recurrenceDays,
        setRecurrenceDays,
        selectedDifficulty,
        setSelectedDifficulty,
        selectedParentTask,
        setSelectedParentTask,
        editingTaskId,
        setEditingTaskId,
        takingDamage,
        setTakingDamage,
        saveTask,
        toggleTask,
        editTask,
        deleteTask,
        loadTasks,
        renderTasks,
      }}
    >
      {children}
    </TaskContext.Provider>
  );
};

export const useTask = () => useContext(TaskContext);
