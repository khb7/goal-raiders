import React, { createContext, useState, useEffect, useContext, useCallback } from 'react';
import { useUser } from '../../contexts/UserContext';
import { DIFFICULTY_DAMAGE_MAP, BOSS_DIFFICULTY_COLOR_MAP } from '../../utils/constants';

const BossContext = createContext(null);

export const BossProvider = ({ children }) => {
  const { userId, idToken } = useUser(); // idToken도 UserContext에서 가져와야 함
  const [bosses, setBosses] = useState([]);
  const [currentBossId, setCurrentBossId] = useState(null);
  const [newBossName, setNewBossName] = useState('');
  const [selectedBossDifficulty, setSelectedBossDifficulty] = useState('Medium');
  const [newBossDueDate, setNewBossDueDate] = useState('');
  const [selectedParentBoss, setSelectedParentBoss] = useState('');
  const [showAddBossModal, setShowAddBossModal] = useState(false);
  const [showEditBossModal, setShowEditBossModal] = useState(false);
  const [editingBossId, setEditingBossId] = useState(null);
  const [editingBossName, setEditingBossName] = useState('');
  const [editingBossDifficulty, setEditingBossDifficulty] = useState('Medium');
  const [editingBossDueDate, setEditingBossDueDate] = useState('');
  const [editingParentBoss, setEditingParentBoss] = useState('');
  const [collapsedBosses, setCollapsedBosses] = useState({});

  const toggleBossCollapse = (bossId) => {
    setCollapsedBosses(prev => ({
      ...prev,
      [bossId]: !prev[bossId]
    }));
  };

  const [gameConfig, setGameConfig] = useState({
    difficultyDamageMap: {},
    bossHpMap: {},
  });

  useEffect(() => {
    const fetchGameConfig = async () => {
      try {
        const response = await fetch('http://localhost:8080/api/config/game');
        if (response.ok) {
          const config = await response.json();
          setGameConfig({
            difficultyDamageMap: config.difficultyDamageMap || {},
            bossHpMap: config.bossHpMap || {},
          });
        } else {
          console.error("Failed to fetch game config");
        }
      } catch (error) {
        console.error("Error fetching game config:", error);
      }
    };
    fetchGameConfig();
  }, []);

  const loadBosses = useCallback(async () => {
    if (userId && idToken) {
      try {
        const bossesResponse = await fetch('http://localhost:8080/api/goals', {
          headers: {
            'Authorization': `Bearer ${idToken}`,
          },
        });
        if (bossesResponse.ok) {
          const fetchedBosses = await bossesResponse.json();
          setBosses(fetchedBosses);
          const previouslySelectedBoss = fetchedBosses.find(boss => boss.id === currentBossId);
          if (previouslySelectedBoss && previouslySelectedBoss.currentHp > 0) {
            setCurrentBossId(previouslySelectedBoss.id);
          } else if (fetchedBosses.length > 0) {
            const firstActiveBoss = fetchedBosses.find(boss => boss.currentHp > 0);
            if (firstActiveBoss) {
              setCurrentBossId(firstActiveBoss.id);
            } else {
              setCurrentBossId(fetchedBosses[0].id);
            }
          } else {
            setCurrentBossId(null);
          }
        } else {
          console.error("Failed to fetch bosses:", bossesResponse.status, await bossesResponse.text());
        }
      } catch (error) {
        console.error("Error loading bosses:", error);
      }
    }
  }, [userId, idToken, currentBossId]);

  const addBoss = useCallback(async () => {
    if (!newBossName) {
      alert('보스 이름을 입력해주세요.');
      return;
    }
    if (!userId || !idToken) {
      alert('로그인 후 보스를 추가할 수 있습니다.');
      return;
    }

    const maxHp = gameConfig.bossHpMap[selectedBossDifficulty];
    if (!maxHp) {
      alert('게임 설정이 아직 로드되지 않았습니다. 잠시 후 다시 시도해주세요.');
      return;
    }

    const bossData = {
      title: newBossName,
      maxHp: maxHp,
      currentHp: maxHp,
      userId: userId,
      parentGoalId: selectedParentBoss || null,
      dueDate: newBossDueDate || null,
      status: selectedBossDifficulty,
    };

    try {
      const response = await fetch('http://localhost:8080/api/goals', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${idToken}`,
        },
        body: JSON.stringify(bossData),
      });

      if (response.ok) {
        await loadBosses();
        setNewBossName('');
        setSelectedBossDifficulty('Medium');
        setSelectedParentBoss('');
        setNewBossDueDate('');
        setShowAddBossModal(false);
      } else {
        const errorText = await response.text();
        console.error("Error adding boss:", errorText);
        alert(`Failed to add boss: ${errorText}`);
      }
    } catch (e) {
      console.error("Error adding boss:", e);
      alert(`Failed to add boss: ${e.message}`);
    }
  }, [newBossName, userId, idToken, gameConfig, selectedBossDifficulty, selectedParentBoss, newBossDueDate, loadBosses]);

  const editBoss = useCallback(async () => {
    if (!editingBossId) {
      alert('수정할 보스를 선택해주세요.');
      return;
    }
    if (!editingBossName) {
      alert('보스 이름을 입력해주세요.');
      return;
    }
    if (!userId || !idToken) {
      alert('로그인 후 보스를 수정할 수 있습니다.');
      return;
    }

    const bossData = {
      title: editingBossName,
      userId: userId,
      parentGoalId: editingParentBoss || null,
      dueDate: editingBossDueDate || null,
      status: editingBossDifficulty,
    };

    try {
      const response = await fetch(`http://localhost:8080/api/goals/${editingBossId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${idToken}`,
        },
        body: JSON.stringify(bossData),
      });

      if (response.ok) {
        await loadBosses();
        setShowEditBossModal(false);
      } else {
        const errorText = await response.text();
        console.error("Error editing boss:", errorText);
        alert(`Failed to edit boss: ${errorText}`);
      }
    } catch (e) {
      console.error("Error editing boss:", e);
      alert(`Failed to edit boss: ${e.message}`);
    }
  }, [editingBossId, editingBossName, userId, idToken, editingParentBoss, editingBossDueDate, editingBossDifficulty, loadBosses]);

  const deleteBoss = useCallback(async () => {
    if (!editingBossId) {
      alert('삭제할 보스를 선택해주세요.');
      return;
    }
    if (!userId || !idToken) {
      alert('로그인 후 보스를 삭제할 수 있습니다.');
      return;
    }

    if (!window.confirm('정말로 이 보스를 삭제하시겠습니까? 이 작업은 되돌릴 수 없습니다.')) {
      return;
    }

    try {
      const response = await fetch(`http://localhost:8080/api/goals/${editingBossId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${idToken}`,
        },
      });

      if (response.ok) {
        await loadBosses();
        setShowEditBossModal(false);
        setCurrentBossId(null);
      } else {
        const errorText = await response.text();
        console.error("Error deleting boss:", errorText);
        alert(`Failed to delete boss: ${errorText}`);
      }
    } catch (e) {
      console.error("Error deleting boss:", e);
      alert(`Failed to delete boss: ${e.message}`);
    }
  }, [editingBossId, userId, idToken, loadBosses]);

  useEffect(() => {
    if (userId && idToken) {
      loadBosses();
    }
  }, [userId, idToken, loadBosses]);

  const currentBoss = currentBossId ? bosses.find(boss => boss.id === currentBossId) : null;

  return (
    <BossContext.Provider
      value={{
        bosses,
        currentBossId,
        setCurrentBossId,
        newBossName,
        setNewBossName,
        selectedBossDifficulty,
        setSelectedBossDifficulty,
        newBossDueDate,
        setNewBossDueDate,
        selectedParentBoss,
        setSelectedParentBoss,
        showAddBossModal,
        setShowAddBossModal,
        showEditBossModal,
        setShowEditBossModal,
        editingBossId,
        setEditingBossId,
        editingBossName,
        setEditingBossName,
        editingBossDifficulty,
        setEditingBossDifficulty,
        editingBossDueDate,
        setEditingBossDueDate,
        editingParentBoss,
        setEditingParentBoss,
        addBoss,
        editBoss,
        deleteBoss,
        currentBoss,
        toggleBossCollapse,
        collapsedBosses,
        loadBosses,
        gameConfig,
      }}
    >
      {children}
    </BossContext.Provider>
  );
};

export const useBoss = () => useContext(BossContext);
