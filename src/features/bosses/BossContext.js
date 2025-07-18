import React, { createContext, useContext, useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../../lib/api';
import { useUser } from '../../contexts/UserContext';

const BossContext = createContext(null);

const fetchBosses = async (idToken) => api.get('/goals', { idToken });
const addBoss = async ({ bossData, idToken }) => api.post('/goals', bossData, { idToken });
const updateBoss = async ({ bossId, bossData, idToken }) => api.put(`/goals/${bossId}`, bossData, { idToken });
const deleteBoss = async ({ bossId, idToken }) => api.delete(`/goals/${bossId}`, { idToken });

export const BossProvider = ({ children }) => {
  const { userId, idToken } = useUser();
  const queryClient = useQueryClient();
  const [currentBossId, setCurrentBossId] = useState(null);

  const { data: bosses = [] } = useQuery({
    queryKey: ['bosses', userId],
    queryFn: () => fetchBosses(idToken),
    enabled: !!userId && !!idToken,
    onSuccess: (data) => {
        const previouslySelectedBoss = data.find(boss => boss.id === currentBossId);
        if (previouslySelectedBoss && previouslySelectedBoss.currentHp > 0) {
          setCurrentBossId(previouslySelectedBoss.id);
        } else if (data.length > 0) {
          const firstActiveBoss = data.find(boss => boss.currentHp > 0);
          if (firstActiveBoss) {
            setCurrentBossId(firstActiveBoss.id);
          } else {
            setCurrentBossId(data[0]?.id || null);
          }
        } else {
          setCurrentBossId(null);
        }
    }
  });

  const mutationOptions = {
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['bosses', userId] });
    },
  };

  const addBossMutation = useMutation({ mutationFn: addBoss, ...mutationOptions });
  const updateBossMutation = useMutation({ mutationFn: updateBoss, ...mutationOptions });
  const deleteBossMutation = useMutation({ mutationFn: deleteBoss, ...mutationOptions });

  const value = {
    bosses,
    currentBossId,
    setCurrentBossId,
    addBoss: (bossData) => {
      if (!idToken) {
        console.warn("Cannot add boss: idToken not available.");
        return Promise.reject(new Error("idToken not available"));
      }
      return addBossMutation.mutateAsync({ bossData, idToken });
    },
    updateBoss: (bossId, bossData) => {
      if (!idToken) {
        console.warn("Cannot update boss: idToken not available.");
        return Promise.reject(new Error("idToken not available"));
      }
      return updateBossMutation.mutateAsync({ bossId, bossData, idToken });
    },
    deleteBoss: (bossId) => {
      if (!idToken) {
        console.warn("Cannot delete boss: idToken not available.");
        return Promise.reject(new Error("idToken not available"));
      }
      return deleteBossMutation.mutateAsync({ bossId, idToken });
    },
    currentBoss: currentBossId ? bosses.find(b => b.id === currentBossId) : null,
    isLoading: addBossMutation.isLoading || updateBossMutation.isLoading || deleteBossMutation.isLoading,
  };

  return <BossContext.Provider value={value}>{children}</BossContext.Provider>;
};

export const useBoss = () => {
  const context = useContext(BossContext);
  if (!context) {
    throw new Error('useBoss must be used within a BossProvider');
  }
  return context;
};
