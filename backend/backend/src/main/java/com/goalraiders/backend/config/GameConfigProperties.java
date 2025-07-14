package com.goalraiders.backend.config;

import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.stereotype.Component;

import java.util.HashMap;
import java.util.Map;

@Component
@ConfigurationProperties(prefix = "game")
public class GameConfigProperties {

    private Map<String, Integer> difficultyDamageMap = new HashMap<>();
    private Map<String, Integer> bossHpMap = new HashMap<>();
    private Map<String, Integer> bossXpRewardMap = new HashMap<>();

    public Map<String, Integer> getBossXpRewardMap() {
        return bossXpRewardMap;
    }

    public void setBossXpRewardMap(Map<String, Integer> bossXpRewardMap) {
        this.bossXpRewardMap = bossXpRewardMap;
    }

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
