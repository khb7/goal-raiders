package com.goalraiders.backend.dto;

public class UserDto {
    private Long id;
    private String username;
    private String email;
    private Integer level;
    private Integer experience;

    public UserDto(Long id, String username, String email, Integer level, Integer experience) {
        this.id = id;
        this.username = username;
        this.email = email;
        this.level = level;
        this.experience = experience;
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
}
