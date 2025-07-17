import React, { createContext, useContext } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../services/api';
import { useUser } from './UserContext';

const TaskContext = createContext(null);

// API functions
const fetchTasks = async (idToken) => api.get('/tasks', { idToken });
const addTask = async ({ taskData, idToken }) => api.post('/tasks', taskData, { idToken });
const updateTask = async ({ taskId, taskData, idToken }) => api.put(`/tasks/${taskId}`, taskData, { idToken });
const deleteTask = async ({ taskId, idToken }) => api.delete(`/tasks/${taskId}`, { idToken });
const completeTask = async ({ taskId, idToken }) => api.post(`/tasks/${taskId}/complete`, {}, { idToken });

export const TaskProvider = ({ children }) => {
  const { userId, idToken } = useUser();
  const queryClient = useQueryClient();

  const { data: tasks = [] } = useQuery({
    queryKey: ['tasks', userId],
    queryFn: () => fetchTasks(idToken),
    enabled: !!userId && !!idToken,
  });

  const taskMutationOptions = {
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks', userId] });
    },
  };

  const addTaskMutation = useMutation({ mutationFn: addTask, ...taskMutationOptions });
  const updateTaskMutation = useMutation({ mutationFn: updateTask, ...taskMutationOptions });
  const deleteTaskMutation = useMutation({ mutationFn: deleteTask, ...taskMutationOptions });
  
  const completeTaskMutation = useMutation({
    mutationFn: completeTask,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks', userId] });
      queryClient.invalidateQueries({ queryKey: ['bosses', userId] }); // Invalidate bosses query as well
    },
  });

  const value = {
    tasks,
    addTask: (taskData) => addTaskMutation.mutate({ taskData, idToken }),
    updateTask: (taskId, taskData) => updateTaskMutation.mutate({ taskId, taskData, idToken }),
    deleteTask: (taskId) => deleteTaskMutation.mutate({ taskId, idToken }),
    completeTask: (taskId) => completeTaskMutation.mutate({ taskId, idToken }),
    isLoading: addTaskMutation.isLoading || updateTaskMutation.isLoading || deleteTaskMutation.isLoading || completeTaskMutation.isLoading,
  };

  return <TaskContext.Provider value={value}>{children}</TaskContext.Provider>;
};

export const useTask = () => {
  const context = useContext(TaskContext);
  if (!context) {
    throw new Error('useTask must be used within a TaskProvider');
  }
  return context;
};
