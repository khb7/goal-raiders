package com.goalraiders.backend;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/api")
public class GoalController {

    @Autowired
    private GoalRepository goalRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private TaskRepository taskRepository;

    // 현재 인증된 사용자 가져오기 또는 생성
    private User getOrCreateCurrentUser() {
        String firebaseUid = ((UserDetails) SecurityContextHolder.getContext().getAuthentication().getPrincipal()).getUsername();
        Optional<User> existingUser = userRepository.findByFirebaseUid(firebaseUid);

        if (existingUser.isPresent()) {
            return existingUser.get();
        } else {
            // 새 사용자 생성 (최초 로그인 시)
            User newUser = new User();
            newUser.setFirebaseUid(firebaseUid);
            // TODO: Firebase에서 사용자 프로필 정보 (예: 이메일, 이름)를 가져와 설정할 수 있습니다.
            // 예: FirebaseAuth.getInstance().getUser(firebaseUid).getEmail();
            newUser.setUsername("User_" + firebaseUid.substring(0, 8)); // 임시 사용자 이름
            newUser.setEmail(firebaseUid + "@example.com"); // 임시 이메일
            return userRepository.save(newUser);
        }
    }

    // 현재 인증된 사용자의 모든 상위 목표 조회
    @GetMapping("/goals/top-level")
    public ResponseEntity<List<Goal>> getTopLevelGoalsForCurrentUser() {
        User currentUser = getOrCreateCurrentUser();
        return ResponseEntity.ok(goalRepository.findByUserIdAndParentGoalIsNull(currentUser.getId()));
    }

    // 특정 상위 목표의 하위 목표 조회
    @GetMapping("/goals/{parentGoalId}/subgoals")
    public ResponseEntity<List<Goal>> getSubGoals(@PathVariable Long parentGoalId) {
        User currentUser = getOrCreateCurrentUser();
        Optional<Goal> parentGoal = goalRepository.findById(parentGoalId);

        if (parentGoal.isEmpty() || !parentGoal.get().getUser().getId().equals(currentUser.getId())) {
            return ResponseEntity.notFound().build(); // 부모 목표가 없거나 현재 사용자의 목표가 아님
        }
        return ResponseEntity.ok(goalRepository.findByParentGoalId(parentGoalId));
    }

    // 새로운 목표 생성 (상위 또는 하위 목표)
    @PostMapping("/goals")
    public ResponseEntity<Goal> createGoalForCurrentUser(@RequestBody Goal goalRequest) {
        User currentUser = getOrCreateCurrentUser();
        goalRequest.setUser(currentUser);

        if (goalRequest.getParentGoal() != null && goalRequest.getParentGoal().getId() != null) {
            Optional<Goal> parentGoal = goalRepository.findById(goalRequest.getParentGoal().getId());
            if (parentGoal.isEmpty() || !parentGoal.get().getUser().getId().equals(currentUser.getId())) {
                return ResponseEntity.badRequest().build(); // 유효하지 않은 부모 목표
            }
            goalRequest.setParentGoal(parentGoal.get());
        }

        Goal goal = goalRepository.save(goalRequest);
        return ResponseEntity.ok(goal);
    }

    // 특정 목표의 모든 할 일 조회
    @GetMapping("/goals/{goalId}/tasks")
    public ResponseEntity<List<Task>> getTasksByGoal(@PathVariable Long goalId) {
        User currentUser = getOrCreateCurrentUser();
        Optional<Goal> goal = goalRepository.findById(goalId);

        if (goal.isEmpty() || !goal.get().getUser().getId().equals(currentUser.getId())) {
            return ResponseEntity.notFound().build(); // 목표가 없거나 현재 사용자의 목표가 아님
        }
        return ResponseEntity.ok(taskRepository.findByGoalId(goalId));
    }

    // 새로운 할 일 생성
    @PostMapping("/goals/{goalId}/tasks")
    public ResponseEntity<Task> createTaskForGoal(@PathVariable Long goalId, @RequestBody Task taskRequest) {
        User currentUser = getOrCreateCurrentUser();
        Optional<Goal> goal = goalRepository.findById(goalId);

        if (goal.isEmpty() || !goal.get().getUser().getId().equals(currentUser.getId())) {
            return ResponseEntity.notFound().build(); // 목표가 없거나 현재 사용자의 목표가 아님
        }
        taskRequest.setGoal(goal.get());
        Task task = taskRepository.save(taskRequest);
        return ResponseEntity.ok(task);
    }

    // 할 일 완료/미완료 처리
    @PutMapping("/tasks/{taskId}")
    public ResponseEntity<Task> updateTaskCompletion(@PathVariable Long taskId, @RequestParam boolean completed) {
        User currentUser = getOrCreateCurrentUser();
        Optional<Task> task = taskRepository.findById(taskId);

        if (task.isEmpty() || !task.get().getGoal().getUser().getId().equals(currentUser.getId())) {
            return ResponseEntity.notFound().build(); // 할 일이 없거나 현재 사용자의 할 일이 아님
        }
        task.get().setCompleted(completed);
        Task updatedTask = taskRepository.save(task.get());
        return ResponseEntity.ok(updatedTask);
    }
}