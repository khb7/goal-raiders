package com.goalraiders.backend.dto;

public class UserDto {
    private Long id;
    private String username;
    private String email;
    private Integer level;
    private Integer experience;
    private Integer currentHp;
    private Integer maxHp;

    public UserDto(Long id, String username, String email, Integer level, Integer experience, Integer currentHp, Integer maxHp) {
        this.id = id;
        this.username = username;
        this.email = email;
        this.level = level;
        this.experience = experience;
        this.currentHp = currentHp;
        this.maxHp = maxHp;
    }

    // Getters and Setters
    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getUsername() {
        return username;
    }

    public void setUsername(String username) {
        this.username = username;
    }

    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email;
    }

    public Integer getLevel() {
        return level;
    }

    public void setLevel(Integer level) {
        this.level = level;
    }

    public Integer getExperience() {
        return experience;
    }

    public void setExperience(Integer experience) {
        this.experience = experience;
    }

    public Integer getCurrentHp() {
        return currentHp;
    }

    public void setCurrentHp(Integer currentHp) {
        this.currentHp = currentHp;
    }

    public Integer getMaxHp() {
        return maxHp;
    }

    public void setMaxHp(Integer maxHp) {
        this.maxHp = maxHp;
    }
}
