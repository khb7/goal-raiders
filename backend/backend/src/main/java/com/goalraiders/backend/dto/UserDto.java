package com.goalraiders.backend.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public class UserDto {
    private Long id;
    @NotBlank(message = "Username cannot be blank")
    @Size(max = 50, message = "Username cannot exceed 50 characters")
    private String username;
    @NotBlank(message = "Email cannot be blank")
    @Email(message = "Invalid email format")
    @Size(max = 100, message = "Email cannot exceed 100 characters")
    private String email;
    @Min(value = 0, message = "Level cannot be negative")
    private Integer level;
    @Min(value = 0, message = "Experience cannot be negative")
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