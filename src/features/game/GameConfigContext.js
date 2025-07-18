import React, { createContext, useContext } from 'react';
import { useQuery } from '@tanstack/react-query';
import api from '../../lib/api';

const GameConfigContext = createContext(null);

const fetchGameConfig = async (idToken) => {
  return api.get('/config/game', { idToken });
};

export const GameConfigProvider = ({ children, idToken }) => {
  const { data: gameConfig, isSuccess: isGameConfigLoaded } = useQuery({
    queryKey: ['gameConfig'],
    queryFn: () => fetchGameConfig(idToken),
    staleTime: Infinity,
  });

  const value = { 
    gameConfig: gameConfig || { difficultyDamageMap: {}, bossHpMap: {} }, 
    isGameConfigLoaded 
  };

  return (
    <GameConfigContext.Provider value={value}>
      {children}
    </GameConfigContext.Provider>
  );
};

export const useGameConfig = () => {
  const context = useContext(GameConfigContext);
  if (!context) {
    throw new Error('useGameConfig must be used within a GameConfigProvider');
  }
  return context;
};
