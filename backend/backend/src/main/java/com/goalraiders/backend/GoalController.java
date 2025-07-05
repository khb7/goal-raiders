package com.goalraiders.backend;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api")
public class GoalController {

    @Autowired
    private GoalRepository goalRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private TaskRepository taskRepository;

    // 특정 사용자의 모든 목표 조회
    @GetMapping("/users/{userId}/goals")
    public ResponseEntity<List<Goal>> getGoalsByUser(@PathVariable Long userId) {
        if (!userRepository.existsById(userId)) {
            return ResponseEntity.notFound().build();
        }
        return ResponseEntity.ok(goalRepository.findByUserId(userId));
    }

    // 새로운 목표 생성
    @PostMapping("/users/{userId}/goals")
    public ResponseEntity<Goal> createGoal(@PathVariable Long userId, @RequestBody Goal goalRequest) {
        return userRepository.findById(userId).map(user -> {
            goalRequest.setUser(user);
            Goal goal = goalRepository.save(goalRequest);
            return ResponseEntity.ok(goal);
        }).orElse(ResponseEntity.notFound().build());
    }

    // 특정 목표의 모든 할 일 조회
    @GetMapping("/goals/{goalId}/tasks")
    public ResponseEntity<List<Task>> getTasksByGoal(@PathVariable Long goalId) {
        if (!goalRepository.existsById(goalId)) {
            return ResponseEntity.notFound().build();
        }
        return ResponseEntity.ok(taskRepository.findByGoalId(goalId));
    }

    // 새로운 할 일 생성
    @PostMapping("/goals/{goalId}/tasks")
    public ResponseEntity<Task> createTask(@PathVariable Long goalId, @RequestBody Task taskRequest) {
        return goalRepository.findById(goalId).map(goal -> {
            taskRequest.setGoal(goal);
            Task task = taskRepository.save(taskRequest);
            return ResponseEntity.ok(task);
        }).orElse(ResponseEntity.notFound().build());
    }

    // 할 일 완료/미완료 처리
    @PutMapping("/tasks/{taskId}")
    public ResponseEntity<Task> updateTaskCompletion(@PathVariable Long taskId, @RequestParam boolean completed) {
        return taskRepository.findById(taskId).map(task -> {
            task.setCompleted(completed);
            Task updatedTask = taskRepository.save(task);
            return ResponseEntity.ok(updatedTask);
        }).orElse(ResponseEntity.notFound().build());
    }
}
