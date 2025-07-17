import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

import { useUser } from './features/player/UserContext';
import { useBoss } from './features/bosses/BossContext';
import { useTask } from './features/tasks/TaskContext';
import { useGameConfig } from './features/game/GameConfigContext';
import PlayerInfoCard from './features/player/components/PlayerInfoCard';
import BossDisplay from './features/bosses/components/BossDisplay';
import TaskList from './features/tasks/components/TaskList';
import AddBossModal from './features/bosses/components/AddBossModal';
import EditBossModal from './features/bosses/components/EditBossModal';
import EditTaskModal from './features/tasks/components/EditTaskModal';

function App() {
  // ... (hooks)

  const { 
    addBoss: addBossContext, 
    updateBoss: updateBossContext, 
    deleteBoss: deleteBossContext, 
    isLoading: isBossMutationLoading 
  } = useBoss();

  const { 
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

  return (
    <div className="container-fluid mt-3 app-main-background d-flex flex-column min-vh-100">
      <ToastContainer position="top-right" autoClose={3000} hideProgressBar={false} />
      {/* ... (rest of the JSX) */}
    </div>
  );
}




