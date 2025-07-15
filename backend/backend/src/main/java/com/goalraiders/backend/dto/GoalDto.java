package com.goalraiders.backend.dto;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import java.time.LocalDate;

public class GoalDto {
    private Long id;
    @NotBlank(message = "Title cannot be blank")
    private String title;
    private String description;
    @NotBlank(message = "Status cannot be blank")
    private String status;
    @NotBlank(message = "User ID cannot be blank")
    private String userId;
    private String parentGoalId;
    private LocalDate dueDate;
    @Min(value = 1, message = "Max HP must be at least 1")
    private int maxHp;
    @Min(value = 0, message = "Current HP cannot be negative")
    private int currentHp;

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

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }

    public String getUserId() {
        return userId;
    }

    public void setUserId(String userId) {
        this.userId = userId;
    }

    public String getParentGoalId() {
        return parentGoalId;
    }

    public void setParentGoalId(String parentGoalId) {
        this.parentGoalId = parentGoalId;
    }

    public LocalDate getDueDate() {
        return dueDate;
    }

    public void setDueDate(LocalDate dueDate) {
        this.dueDate = dueDate;
    }

    public int getMaxHp() {
        return maxHp;
    }

    public void setMaxHp(int maxHp) {
        this.maxHp = maxHp;
    }

    public int getCurrentHp() {
        return currentHp;
    }

    public void setCurrentHp(int currentHp) {
        this.currentHp = currentHp;
    }
}
