import React, { createContext, useContext } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../../lib/api';
import { useUser } from '../../contexts/UserContext';

const TaskContext = createContext(null);

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
      queryClient.invalidateQueries({ queryKey: ['bosses', userId] });
    },
  });

  const value = {
    tasks,
    addTask: (taskData) => {
      if (!idToken) {
        console.warn("Cannot add task: idToken not available.");
        return Promise.reject(new Error("idToken not available"));
      }
      return addTaskMutation.mutateAsync({ taskData, idToken });
    },
    updateTask: (taskId, taskData) => {
      if (!idToken) {
        console.warn("Cannot update task: idToken not available.");
        return Promise.reject(new Error("idToken not available"));
      }
      return updateTaskMutation.mutateAsync({ taskId, taskData, idToken });
    },
    deleteTask: (taskId) => {
      if (!idToken) {
        console.warn("Cannot delete task: idToken not available.");
        return Promise.reject(new Error("idToken not available"));
      }
      return deleteTaskMutation.mutateAsync({ taskId, idToken });
    },
    completeTask: (taskId) => {
      if (!idToken) {
        console.warn("Cannot complete task: idToken not available.");
        return Promise.reject(new Error("idToken not available"));
      }
      return completeTaskMutation.mutateAsync({ taskId, idToken });
    },
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
