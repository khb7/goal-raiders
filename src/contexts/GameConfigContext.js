import React, { createContext, useContext } from 'react';
import { useQuery } from '@tanstack/react-query';
import api from '../services/api';

const GameConfigContext = createContext(null);

const fetchGameConfig = async () => {
  return api.get('/config/game');
};

export const GameConfigProvider = ({ children }) => {
  const { data: gameConfig, isSuccess: isGameConfigLoaded } = useQuery({
    queryKey: ['gameConfig'],
    queryFn: fetchGameConfig,
    staleTime: Infinity, // Game config is static, so it never becomes stale
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
