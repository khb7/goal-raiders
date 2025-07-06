package com.goalraiders.backend;

import jakarta.persistence.*;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "goals")
public class Goal {

    @Id
    @GeneratedValue(strategy = GenerationType.AUTO)
    private Long id;

    private String title;
    private String description;
    private String status;

    @ManyToOne
    @JoinColumn(name = "user_id")
    private User user;

    @ManyToOne
    @JoinColumn(name = "parent_goal_id")
    private Goal parentGoal;

    @OneToMany(mappedBy = "parentGoal", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<Goal> subGoals = new ArrayList<>();

    private LocalDate dueDate;

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

    public User getUser() {
        return user;
    }

    public void setUser(User user) {
        this.user = user;
    }

    public Goal getParentGoal() {
        return parentGoal;
    }

    public void setParentGoal(Goal parentGoal) {
        this.parentGoal = parentGoal;
    }

    public List<Goal> getSubGoals() {
        return subGoals;
    }

    public void setSubGoals(List<Goal> subGoals) {
        this.subGoals = subGoals;
    }

    public LocalDate getDueDate() {
        return dueDate;
    }

    public void setDueDate(LocalDate dueDate) {
        this.dueDate = dueDate;
    }
}
