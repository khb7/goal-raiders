package com.goalraiders.backend.dto;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

import java.time.LocalDate;

public class TaskDto {
    private Long id;
    @NotBlank(message = "Title cannot be blank")
    @Size(max = 255, message = "Title cannot exceed 255 characters")
    private String title;
    private boolean completed;
    private String goalId;
    private String parentTaskId;
    @NotBlank(message = "User ID cannot be blank")
    private String userId;
    @Min(value = 0, message = "Recurrence days cannot be negative")
    private int recurrenceDays;
    private LocalDate lastCompleted;
    @NotBlank(message = "Difficulty cannot be blank")
    private String difficulty;

    // Getters and Setters
    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getTitle() {
        return title;
    }

    public void setTitle(String title) {
        this.title = title;
    }

    public boolean isCompleted() {
        return completed;
    }

    public void setCompleted(boolean completed) {
        this.completed = completed;
    }

    public String getGoalId() {
        return goalId;
    }

    public void setGoalId(String goalId) {
        this.goalId = goalId;
    }

    public int getRecurrenceDays() {
        return recurrenceDays;
    }

    public void setRecurrenceDays(int recurrenceDays) {
        this.recurrenceDays = recurrenceDays;
    }

    public LocalDate getLastCompleted() {
        return lastCompleted;
    }

    public void setLastCompleted(LocalDate lastCompleted) {
        this.lastCompleted = lastCompleted;
    }

    public String getDifficulty() {
        return difficulty;
    }

    public void setDifficulty(String difficulty) {
        this.difficulty = difficulty;
    }

    public String getParentTaskId() {
        return parentTaskId;
    }

    public void setParentTaskId(String parentTaskId) {
        this.parentTaskId = parentTaskId;
    }

    public String getUserId() {
        return userId;
    }

    public void setUserId(String userId) {
        this.userId = userId;
    }
}