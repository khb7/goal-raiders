package com.goalraiders.backend;

import com.goalraiders.backend.dto.TaskDto;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/tasks")
public class TaskController {

    @Autowired
    private TaskRepository taskRepository;

    @Autowired
    private GoalRepository goalRepository;

    @Autowired
    private UserRepository userRepository;

    // 현재 인증된 사용자 가져오기 또는 생성
    private User getOrCreateCurrentUser() {
        String firebaseUid = ((UserDetails) SecurityContextHolder.getContext().getAuthentication().getPrincipal()).getUsername();
        Optional<User> existingUser = userRepository.findByFirebaseUid(firebaseUid);

        if (existingUser.isPresent()) {
            return existingUser.get();
        } else {
            User newUser = new User();
            newUser.setFirebaseUid(firebaseUid);
            newUser.setUsername("User_" + firebaseUid.substring(0, 8));
            newUser.setEmail(firebaseUid + "@example.com");
            return userRepository.save(newUser);
        }
    }

    // Task 엔티티를 DTO로 변환
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

    // 모든 할 일 조회
    @GetMapping
    public ResponseEntity<List<TaskDto>> getAllTasksForCurrentUser() {
        User currentUser = getOrCreateCurrentUser();
        List<Task> tasks = taskRepository.findByUserFirebaseUid(currentUser.getFirebaseUid());
        return ResponseEntity.ok(tasks.stream().map(this::convertToDto).collect(Collectors.toList()));
    }

    // 특정 할 일 조회
    @GetMapping("/{id}")
    public ResponseEntity<TaskDto> getTaskById(@PathVariable Long id) {
        User currentUser = getOrCreateCurrentUser();
        Optional<Task> task = taskRepository.findById(id);
        if (task.isEmpty() || !task.get().getUser().getFirebaseUid().equals(currentUser.getFirebaseUid())) {
            return ResponseEntity.notFound().build();
        }
        return ResponseEntity.ok(convertToDto(task.get()));
    }

    // 새로운 할 일 생성
    @PostMapping
    public ResponseEntity<TaskDto> createTask(@RequestBody TaskDto taskDto) {
        User currentUser = getOrCreateCurrentUser();
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
                return ResponseEntity.badRequest().build();
            }
            task.setGoal(goal.get());
        }

        if (taskDto.getParentTaskId() != null) {
            Optional<Task> parentTask = taskRepository.findById(Long.parseLong(taskDto.getParentTaskId()));
            if (parentTask.isEmpty() || !parentTask.get().getUser().getFirebaseUid().equals(currentUser.getFirebaseUid())) {
                return ResponseEntity.badRequest().build();
            }
            task.setParentTask(parentTask.get());
        }

        Task savedTask = taskRepository.save(task);
        return ResponseEntity.ok(convertToDto(savedTask));
    }

    // 할 일 업데이트
    @PutMapping("/{id}")
    public ResponseEntity<TaskDto> updateTask(@PathVariable Long id, @RequestBody TaskDto taskDto) {
        User currentUser = getOrCreateCurrentUser();
        Optional<Task> existingTask = taskRepository.findById(id);

        if (existingTask.isEmpty() || !existingTask.get().getUser().getId().equals(currentUser.getId())) {
            return ResponseEntity.notFound().build();
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
                return ResponseEntity.badRequest().build();
            }
            taskToUpdate.setGoal(goal.get());
        } else {
            taskToUpdate.setGoal(null);
        }

        if (taskDto.getParentTaskId() != null) {
            Optional<Task> parentTask = taskRepository.findById(Long.parseLong(taskDto.getParentTaskId()));
            if (parentTask.isEmpty() || !parentTask.get().getUser().getFirebaseUid().equals(currentUser.getFirebaseUid())) {
                return ResponseEntity.badRequest().build();
            }
            taskToUpdate.setParentTask(parentTask.get());
        } else {
            taskToUpdate.setParentTask(null);
        }

        Task updatedTask = taskRepository.save(taskToUpdate);
        return ResponseEntity.ok(convertToDto(updatedTask));
    }

    // 할 일 삭제
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteTask(@PathVariable Long id) {
        User currentUser = getOrCreateCurrentUser();
        Optional<Task> task = taskRepository.findById(id);

        if (task.isEmpty() || !task.get().getUser().getFirebaseUid().equals(currentUser.getFirebaseUid())) {
            return ResponseEntity.notFound().build();
        }

        taskRepository.delete(task.get());
        return ResponseEntity.noContent().build();
    }

    // 할 일 완료 처리 (Cloud Function 대체)
    @PostMapping("/{taskId}/complete")
    public ResponseEntity<TaskDto> completeTask(@PathVariable Long taskId) {
        User currentUser = getOrCreateCurrentUser();
        Optional<Task> taskOptional = taskRepository.findById(taskId);

        if (taskOptional.isEmpty() || !taskOptional.get().getUser().getFirebaseUid().equals(currentUser.getFirebaseUid())) {
            return ResponseEntity.notFound().build();
        }

        Task task = taskOptional.get();
        if (task.isCompleted()) {
            // Already completed, handle recurrence
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

            // Apply damage to goal (boss)
            if (task.getGoal() != null) {
                Goal goal = task.getGoal();
                int damage = GoalController.DIFFICULTY_DAMAGE_MAP.getOrDefault(task.getDifficulty(), 0);
                int newHp = goal.getCurrentHp() - damage;
                goal.setCurrentHp(Math.max(0, newHp));
                goalRepository.save(goal);
            }
        }

        Task updatedTask = taskRepository.save(task);
        return ResponseEntity.ok(convertToDto(updatedTask));
    }
}