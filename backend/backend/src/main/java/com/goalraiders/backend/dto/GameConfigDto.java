package com.goalraiders.backend.dto;

import java.util.Map;

public class GameConfigDto {

    private Map<String, Integer> difficultyDamageMap;
    private Map<String, Integer> bossHpMap;

    public GameConfigDto(Map<String, Integer> difficultyDamageMap, Map<String, Integer> bossHpMap) {
        this.difficultyDamageMap = difficultyDamageMap;
        this.bossHpMap = bossHpMap;
    }

    // Getters and setters
    public Map<String, Integer> getDifficultyDamageMap() {
        return difficultyDamageMap;
    }

    public void setDifficultyDamageMap(Map<String, Integer> difficultyDamageMap) {
        this.difficultyDamageMap = difficultyDamageMap;
    }

    public Map<String, Integer> getBossHpMap() {
        return bossHpMap;
    }

    public void setBossHpMap(Map<String, Integer> bossHpMap) {
        this.bossHpMap = bossHpMap;
    }
}
