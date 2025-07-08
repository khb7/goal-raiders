package com.goalraiders.backend.service;

import com.goalraiders.backend.*;
import com.goalraiders.backend.config.GameConfigProperties;
import com.goalraiders.backend.dto.TaskDto;
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

    public List<TaskDto> getAllTasksForCurrentUser() {
        User currentUser = userService.getOrCreateCurrentUser();
        List<Task> tasks = taskRepository.findByUserFirebaseUid(currentUser.getFirebaseUid());
        return tasks.stream().map(this::convertToDto).collect(Collectors.toList());
    }

    public Optional<TaskDto> getTaskById(Long id) {
        User currentUser = userService.getOrCreateCurrentUser();
        Optional<Task> task = taskRepository.findById(id);
        if (task.isEmpty() || !task.get().getUser().getFirebaseUid().equals(currentUser.getFirebaseUid())) {
            return Optional.empty();
        }
        return Optional.of(convertToDto(task.get()));
    }

    public TaskDto createTask(TaskDto taskDto) {
        User currentUser = userService.getOrCreateCurrentUser();
        Task task = new Task();
        task.setTitle(taskDto.getTitle());
        task.setCompleted(taskDto.isCompleted());
        task.setRecurrenceDays(taskDto.getRecurrenceDays());
        task.setLastCompleted(taskDto.getLastCompleted());
        task.setDifficulty(taskDto.getDifficulty());
        task.setUser(currentUser);

        if (taskDto.getGoalId() != null) {
            Optional<Goal> goal = goalRepository.findById(Long.parseLong(taskDto.getGoalId()));
            if (goal.isEmpty() || !goal.get().getUser().getFirebaseUid().equals(currentUser.getFirebaseUid())) {
                throw new IllegalArgumentException("Invalid goal id");
            }
            task.setGoal(goal.get());
        }

        if (taskDto.getParentTaskId() != null) {
            Optional<Task> parentTask = taskRepository.findById(Long.parseLong(taskDto.getParentTaskId()));
            if (parentTask.isEmpty() || !parentTask.get().getUser().getFirebaseUid().equals(currentUser.getFirebaseUid())) {
                throw new IllegalArgumentException("Invalid parent task id");
            }
            task.setParentTask(parentTask.get());
        }

        Task savedTask = taskRepository.save(task);
        return convertToDto(savedTask);
    }

    public Optional<TaskDto> updateTask(Long id, TaskDto taskDto) {
        User currentUser = userService.getOrCreateCurrentUser();
        Optional<Task> existingTask = taskRepository.findById(id);

        if (existingTask.isEmpty() || !existingTask.get().getUser().getId().equals(currentUser.getId())) {
            return Optional.empty();
        }

        Task taskToUpdate = existingTask.get();
        taskToUpdate.setTitle(taskDto.getTitle());
        taskToUpdate.setCompleted(taskDto.isCompleted());
        taskToUpdate.setRecurrenceDays(taskDto.getRecurrenceDays());
        taskToUpdate.setLastCompleted(taskDto.getLastCompleted());
        taskToUpdate.setDifficulty(taskDto.getDifficulty());

        if (taskDto.getGoalId() != null) {
            Optional<Goal> goal = goalRepository.findById(Long.parseLong(taskDto.getGoalId()));
            if (goal.isEmpty() || !goal.get().getUser().getFirebaseUid().equals(currentUser.getFirebaseUid())) {
                throw new IllegalArgumentException("Invalid goal id");
            }
            taskToUpdate.setGoal(goal.get());
        } else {
            taskToUpdate.setGoal(null);
        }

        if (taskDto.getParentTaskId() != null) {
            Optional<Task> parentTask = taskRepository.findById(Long.parseLong(taskDto.getParentTaskId()));
            if (parentTask.isEmpty() || !parentTask.get().getUser().getFirebaseUid().equals(currentUser.getFirebaseUid())) {
                throw new IllegalArgumentException("Invalid parent task id");
            }
            taskToUpdate.setParentTask(parentTask.get());
        } else {
            taskToUpdate.setParentTask(null);
        }

        Task updatedTask = taskRepository.save(taskToUpdate);
        return Optional.of(convertToDto(updatedTask));
    }

    public boolean deleteTask(Long id) {
        User currentUser = userService.getOrCreateCurrentUser();
        Optional<Task> task = taskRepository.findById(id);

        if (task.isEmpty() || !task.get().getUser().getFirebaseUid().equals(currentUser.getFirebaseUid())) {
            return false;
        }

        taskRepository.delete(task.get());
        return true;
    }

    public Optional<TaskDto> completeTask(Long taskId) {
        User currentUser = userService.getOrCreateCurrentUser();
        Optional<Task> taskOptional = taskRepository.findById(taskId);

        if (taskOptional.isEmpty() || !taskOptional.get().getUser().getFirebaseUid().equals(currentUser.getFirebaseUid())) {
            return Optional.empty();
        }

        Task task = taskOptional.get();
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
                goalRepository.save(goal);
            }
        }

        Task updatedTask = taskRepository.save(task);
        return Optional.of(convertToDto(updatedTask));
    }

    private TaskDto convertToDto(Task task) {
        TaskDto dto = new TaskDto();
        dto.setId(task.getId());
        dto.setTitle(task.getTitle());
        dto.setCompleted(task.isCompleted());
        dto.setGoalId(task.getGoal() != null ? String.valueOf(task.getGoal().getId()) : null);
        dto.setRecurrenceDays(task.getRecurrenceDays());
        dto.setLastCompleted(task.getLastCompleted());
        dto.setDifficulty(task.getDifficulty());
        dto.setParentTaskId(task.getParentTask() != null ? String.valueOf(task.getParentTask().getId()) : null);
        dto.setUserId(task.getUser() != null ? task.getUser().getFirebaseUid() : null);
        return dto;
    }
}

