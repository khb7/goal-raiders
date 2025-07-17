package com.goalraiders.backend.service;

import com.goalraiders.backend.*;
import com.goalraiders.backend.config.GameConfigProperties;
import com.goalraiders.backend.dto.TaskDto;
import com.goalraiders.backend.dto.mapper.TaskMapper;
import com.goalraiders.backend.exception.InvalidInputException;
import com.goalraiders.backend.exception.ResourceNotFoundException;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
public class TaskService {

    @Autowired
    private TaskRepository taskRepository;

    @Autowired
    private GoalRepository goalRepository;

    @Autowired
    private UserService userService;

    @Autowired
    private GameConfigProperties gameConfigProperties;

    @Autowired
    private TaskMapper taskMapper;

    public List<TaskDto> getAllTasksForCurrentUser() {
        User currentUser = userService.getCurrentUserEntity();
        List<Task> tasks = taskRepository.findByUserFirebaseUid(currentUser.getFirebaseUid());
        return tasks.stream().map(taskMapper::toDto).collect(Collectors.toList());
    }

    public TaskDto getTaskById(Long id) {
        User currentUser = userService.getCurrentUserEntity();
        Task task = taskRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Task not found with id " + id));
        if (!task.getUser().getFirebaseUid().equals(currentUser.getFirebaseUid())) {
            throw new ResourceNotFoundException("Task not found with id " + id);
        }
        return taskMapper.toDto(task);
    }

    public TaskDto createTask(TaskDto taskDto) {
        User currentUser = userService.getCurrentUserEntity();
        Task task = taskMapper.toEntity(taskDto);
        task.setUser(currentUser);

        if (taskDto.getGoalId() != null) {
            Optional<Goal> goal = goalRepository.findById(Long.parseLong(taskDto.getGoalId()));
            if (goal.isEmpty() || !goal.get().getUser().getFirebaseUid().equals(currentUser.getFirebaseUid())) {
                throw new InvalidInputException("Invalid goal id: " + taskDto.getGoalId());
            }
            task.setGoal(goal.get());
        }

        if (taskDto.getParentTaskId() != null) {
            Optional<Task> parentTask = taskRepository.findById(Long.parseLong(taskDto.getParentTaskId()));
            if (parentTask.isEmpty() || !parentTask.get().getUser().getFirebaseUid().equals(currentUser.getFirebaseUid())) {
                throw new InvalidInputException("Invalid parent task id: " + taskDto.getParentTaskId());
            }
            task.setParentTask(parentTask.get());
        }

        Task savedTask = taskRepository.save(task);
        return taskMapper.toDto(savedTask);
    }

    public TaskDto updateTask(Long id, TaskDto taskDto) {
        User currentUser = userService.getCurrentUserEntity();
        Task taskToUpdate = taskRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Task not found with id " + id));

        if (!taskToUpdate.getUser().getId().equals(currentUser.getId())) {
            throw new ResourceNotFoundException("Task not found with id " + id);
        }

        taskMapper.toEntity(taskDto, taskToUpdate); // Update existing entity

        if (taskDto.getGoalId() != null) {
            Optional<Goal> goal = goalRepository.findById(Long.parseLong(taskDto.getGoalId()));
            if (goal.isEmpty() || !goal.get().getUser().getFirebaseUid().equals(currentUser.getFirebaseUid())) {
                throw new InvalidInputException("Invalid goal id: " + taskDto.getGoalId());
            }
            taskToUpdate.setGoal(goal.get());
        } else {
            taskToUpdate.setGoal(null);
        }

        if (taskDto.getParentTaskId() != null) {
            Optional<Task> parentTask = taskRepository.findById(Long.parseLong(taskDto.getParentTaskId()));
            if (parentTask.isEmpty() || !parentTask.get().getUser().getFirebaseUid().equals(currentUser.getFirebaseUid())) {
                throw new InvalidInputException("Invalid parent task id: " + taskDto.getParentTaskId());
            }
            taskToUpdate.setParentTask(parentTask.get());
        } else {
            taskToUpdate.setParentTask(null);
        }

        Task updatedTask = taskRepository.save(taskToUpdate);
        return taskMapper.toDto(updatedTask);
    }

    public void deleteTask(Long id) {
        User currentUser = userService.getCurrentUserEntity();
        Task task = taskRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Task not found with id " + id));

        if (!task.getUser().getFirebaseUid().equals(currentUser.getFirebaseUid())) {
            throw new ResourceNotFoundException("Task not found with id " + id);
        }

        taskRepository.delete(task);
    }

    public TaskDto completeTask(Long taskId) {
        User currentUser = userService.getCurrentUserEntity();
        Task task = taskRepository.findById(taskId)
                .orElseThrow(() -> new ResourceNotFoundException("Task not found with id " + taskId));

        if (!task.getUser().getFirebaseUid().equals(currentUser.getFirebaseUid())) {
            throw new ResourceNotFoundException("Task not found with id " + taskId);
        }

        if (task.isCompleted()) {
            if (task.getRecurrenceDays() > 0) {
                LocalDate today = LocalDate.now();
                LocalDate lastCompleted = task.getLastCompleted();
                if (lastCompleted == null || lastCompleted.plusDays(task.getRecurrenceDays()).isBefore(today) || lastCompleted.plusDays(task.getRecurrenceDays()).isEqual(today)) {
                    task.setCompleted(false);
                    task.setLastCompleted(null);
                }
            }
        } else {
            task.setCompleted(true);
            task.setLastCompleted(LocalDate.now());

            if (task.getGoal() != null) {
                Goal goal = task.getGoal();
                int damage = gameConfigProperties.getDifficultyDamageMap().getOrDefault(task.getDifficulty(), 0);
                int newHp = goal.getCurrentHp() - damage;
                goal.setCurrentHp(Math.max(0, newHp));

                if (goal.getCurrentHp() <= 0 && !goal.isDefeated()) {
                    goal.setDefeated(true);
                    int xpReward = gameConfigProperties.getBossXpRewardMap().getOrDefault(goal.getStatus(), 0);
                    userService.addExperience(currentUser.getFirebaseUid(), xpReward);
                }

                goalRepository.save(goal);
            }
        }

        Task updatedTask = taskRepository.save(task);
        return taskMapper.toDto(updatedTask);
    }
}