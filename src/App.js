import { useState } from 'react';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

import { useUser } from './contexts/UserContext';
import { GameConfigProvider } from './features/game/GameConfigContext';
import { useBoss } from './features/bosses/BossContext';
import { useTask } from './features/tasks/TaskContext';

import PlayerInfoCard from './features/player/components/PlayerInfoCard';
import BossDisplay from './features/bosses/components/BossDisplay';
import TaskList from './features/tasks/components/TaskList';
import AddBossModal from './features/bosses/components/AddBossModal';
import EditBossModal from './features/bosses/components/EditBossModal';
import EditTaskModal from './features/tasks/components/EditTaskModal';

function App() {
  const [showAddBossModal, setShowAddBossModal] = useState(false);
  const [showEditBossModal, setShowEditBossModal] = useState(false);
  const [editingBoss, setEditingBoss] = useState(null);
  const [showEditTaskModal, setShowEditTaskModal] = useState(false);
  const [editingTask, setEditingTask] = useState(null);
  const [takingDamage, setTakingDamage] = useState(false);


  const { 
    currentBoss,
    addBoss: addBossContext, 
    updateBoss: updateBossContext, 
    deleteBoss: deleteBossContext, 
    isLoading: isBossMutationLoading 
  } = useBoss();

  const { 
    tasks,
    completeTask: completeTaskContext, 
    deleteTask: deleteTaskContext, 
    addTask: addTaskContext, 
    updateTask: updateTaskContext,
    isLoading: isTaskMutationLoading
  } = useTask();

  // ... (local state)

  const handleAddBoss = async (bossData) => {
    toast.promise(
      addBossContext(bossData).then(() => setShowAddBossModal(false)),
      {
        pending: 'Adding new boss...',
        success: 'Boss added successfully! 👌',
        error: 'Failed to add boss. 🤯'
      }
    );
  };

  const handleEditBoss = async (bossData) => {
    toast.promise(
      updateBossContext(editingBoss.id, bossData).then(() => {
        setShowEditBossModal(false);
        setEditingBoss(null);
      }),
      {
        pending: 'Updating boss...',
        success: 'Boss updated successfully! 👌',
        error: 'Failed to update boss. 🤯'
      }
    );
  };

  const handleDeleteBoss = async () => {
    if (!editingBoss || !window.confirm('정말로 이 보스를 삭제하시겠습니까?')) return;
    toast.promise(
      deleteBossContext(editingBoss.id).then(() => {
        setShowEditBossModal(false);
        setEditingBoss(null);
      }),
      {
        pending: 'Deleting boss...',
        success: 'Boss deleted successfully! 👌',
        error: 'Failed to delete boss. 🤯'
      }
    );
  };

  const handleSaveTask = async (taskData) => {
    const action = editingTask ? updateTaskContext(editingTask.id, taskData) : addTaskContext(taskData);
    toast.promise(
      action.then(() => {
        setShowEditTaskModal(false);
        setEditingTask(null);
      }),
      {
        pending: 'Saving task...',
        success: 'Task saved successfully! 👌',
        error: 'Failed to save task. 🤯'
      }
    );
  };

  const handleDeleteTask = async (taskId) => {
    toast.promise(
      deleteTaskContext(taskId),
      {
        pending: 'Deleting task...',
        success: 'Task deleted successfully! 👌',
        error: 'Failed to delete task. 🤯'
      }
    );
  };

  const handleCompleteTask = async (taskId) => {
    setTakingDamage(true);
    toast.promise(
      completeTaskContext(taskId),
      {
        pending: 'Completing task...',
        success: 'Task completed! Great job! ✨',
        error: 'Failed to complete task. 🤯'
      }
    ).finally(() => {
      setTimeout(() => setTakingDamage(false), 500);
    });
  };

  // ... (rest of the component)

  const { user, idToken } = useUser();

  return (
    <GameConfigProvider idToken={idToken}>
      <div className="container-fluid mt-3 app-main-background d-flex flex-column min-vh-100">
      <ToastContainer position="top-right" autoClose={3000} hideProgressBar={false} />
      <div className="row flex-grow-1">
        <div className="col-md-4 col-lg-3">
          <PlayerInfoCard />
          <button className="btn btn-primary w-100 mt-3" onClick={() => setShowAddBossModal(true)}>
            Add New Boss
          </button>
        </div>
        <div className="col-md-8 col-lg-9">
          <BossDisplay 
            boss={currentBoss}
            takingDamage={takingDamage} 
            onEditBoss={() => setShowEditBossModal(true)} 
          />
          <TaskList 
            tasks={tasks}
            onEditTask={(task) => {
              setEditingTask(task);
              setShowEditTaskModal(true);
            }}
            onDeleteTask={handleDeleteTask}
            onCompleteTask={handleCompleteTask}
            onAddTask={() => {
              setEditingTask(null);
              setShowEditTaskModal(true);
            }}
          />
        </div>
      </div>

      {showAddBossModal && (
        <AddBossModal 
          onClose={() => setShowAddBossModal(false)} 
          onSave={handleAddBoss} 
        />
      )}

      {showEditBossModal && editingBoss && (
        <EditBossModal
          boss={editingBoss}
          onClose={() => setShowEditBossModal(false)}
          onSave={handleEditBoss}
          onDelete={handleDeleteBoss}
        />
      )}

      {showEditTaskModal && (
        <EditTaskModal
          task={editingTask}
          onClose={() => {
            setShowEditTaskModal(false);
            setEditingTask(null);
          }}
          onSave={handleSaveTask}
        />
      )}
    </div>
  );
}

export default App;