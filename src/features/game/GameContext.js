import React, { createContext, useState, useEffect, useContext, useCallback } from 'react';
import { useUser } from '../../contexts/UserContext';
import { useBoss } from '../../features/bosses/BossContext';
import { useTask } from '../../features/tasks/TaskContext';

const GameContext = createContext(null);

export const GameProvider = ({ children }) => {
  const { userId, idToken } = useUser();
  const { currentBoss, loadBosses } = useBoss();
  const { loadTasks } = useTask();

  const [userInfo, setUserInfo] = useState(null);
  const [playerHp, setPlayerHp] = useState(100);

  const isVictory = currentBoss && currentBoss.currentHp <= 0;

  const loadUserInfo = useCallback(async () => {
    if (userId && idToken) {
      try {
        const userResponse = await fetch('http://localhost:8080/api/users/me', {
            headers: {
                'Authorization': `Bearer ${idToken}`,
            },
        });
        if (userResponse.ok) {
            const fetchedUser = await userResponse.json();
            setUserInfo(fetchedUser);
        } else {
            console.error("Failed to fetch user info:", userResponse.status, await userResponse.text());
        }
      } catch (error) {
        console.error("Error loading user info:", error);
      }
    }
  }, [userId, idToken]);

  const resetGame = useCallback(async () => {
    if (!userId || !idToken) {
      alert("로그인이 필요합니다.");
      return;
    }

    if (!window.confirm('정말로 게임을 초기화하시겠습니까? 모든 보스와 태스크가 삭제됩니다.')) {
      return;
    }

    try {
      // Fetch and delete all bosses for the current user from backend
      const bossesResponse = await fetch('http://localhost:8080/api/goals', {
        headers: {
          'Authorization': `Bearer ${idToken}`,
        },
      });
      if (bossesResponse.ok) {
        const fetchedBosses = await bossesResponse.json();
        const deleteBossPromises = fetchedBosses.map(boss =>
          fetch(`http://localhost:8080/api/goals/${boss.id}`, {
            method: 'DELETE',
            headers: {
              'Authorization': `Bearer ${idToken}`,
            },
          })
        );
        await Promise.all(deleteBossPromises);
      } else {
        console.error("Failed to fetch bosses for deletion:", await bossesResponse.text());
      }

      // Fetch and delete all tasks for the current user from backend
      const tasksResponse = await fetch('http://localhost:8080/api/tasks', {
        headers: {
          'Authorization': `Bearer ${idToken}`,
        },
      });
      if (tasksResponse.ok) {
        const fetchedTasks = await tasksResponse.json();
        const deleteTaskPromises = fetchedTasks.map(task =>
          fetch(`http://localhost:8080/api/tasks/${task.id}`, {
            method: 'DELETE',
            headers: {
              'Authorization': `Bearer ${idToken}`,
            },
          })
        );
        await Promise.all(deleteTaskPromises);
      } else {
        console.error("Failed to fetch tasks for deletion:", await tasksResponse.text());
      }

      // Reload data after reset
      loadBosses();
      loadTasks();
      loadUserInfo();

    } catch (error) {
      console.error("Error resetting game:", error);
      alert(`Failed to reset game: ${error.message}`);
    }
  }, [userId, idToken, loadBosses, loadTasks, loadUserInfo]);

  useEffect(() => {
    if (userId && idToken) {
      loadUserInfo();
    }
  }, [userId, idToken, loadUserInfo]);

  return (
    <GameContext.Provider
      value={{
        userInfo,
        playerHp,
        isVictory,
        resetGame,
      }}
    >
      {children}
    </GameContext.Provider>
  );
};

export const useGame = () => useContext(GameContext);
