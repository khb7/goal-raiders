package com.goalraiders.backend.dto;

import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.NotEmpty;
import java.util.Map;

public class GameConfigDto {

    @NotNull(message = "Difficulty damage map cannot be null")
    @NotEmpty(message = "Difficulty damage map cannot be empty")
    private Map<String, Integer> difficultyDamageMap;

    @NotNull(message = "Boss HP map cannot be null")
    @NotEmpty(message = "Boss HP map cannot be empty")
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