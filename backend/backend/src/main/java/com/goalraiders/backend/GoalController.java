package com.goalraiders.backend;

import com.goalraiders.backend.dto.GoalDto;
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
@RequestMapping("/api/goals")
public class GoalController {

    @Autowired
    private GoalRepository goalRepository;

    @Autowired
    private UserRepository userRepository;

    // Difficulty to damage mapping (from frontend)
    public static final java.util.Map<String, Integer> DIFFICULTY_DAMAGE_MAP = new java.util.HashMap<>();
    static {
        DIFFICULTY_DAMAGE_MAP.put("Easy", 5);
        DIFFICULTY_DAMAGE_MAP.put("Medium", 10);
        DIFFICULTY_DAMAGE_MAP.put("Hard", 20);
        DIFFICULTY_DAMAGE_MAP.put("Epic", 50);
    }

    // Boss HP mapping (from frontend)
    private static final java.util.Map<String, Integer> BOSS_HP_MAP = new java.util.HashMap<>();
    static {
        BOSS_HP_MAP.put("Easy", 50);
        BOSS_HP_MAP.put("Medium", 100);
        BOSS_HP_MAP.put("Hard", 200);
        BOSS_HP_MAP.put("Epic", 500);
    }

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

    // Goal 엔티티를 DTO로 변환
    private GoalDto convertToDto(Goal goal) {
        GoalDto dto = new GoalDto();
        dto.setId(goal.getId());
        dto.setTitle(goal.getTitle());
        dto.setDescription(goal.getDescription());
        dto.setStatus(goal.getStatus());
        dto.setUserId(goal.getUser() != null ? goal.getUser().getFirebaseUid() : null);
        dto.setParentGoalId(goal.getParentGoal() != null ? String.valueOf(goal.getParentGoal().getId()) : null);
        dto.setDueDate(goal.getDueDate());
        dto.setMaxHp(goal.getMaxHp());
        dto.setCurrentHp(goal.getCurrentHp());
        return dto;
    }

    // 모든 목표 조회
    @GetMapping
    public ResponseEntity<List<GoalDto>> getAllGoalsForCurrentUser() {
        User currentUser = getOrCreateCurrentUser();
        List<Goal> goals = goalRepository.findByUserFirebaseUid(currentUser.getFirebaseUid());
        return ResponseEntity.ok(goals.stream().map(this::convertToDto).collect(Collectors.toList()));
    }

    // 특정 목표 조회
    @GetMapping("/{id}")
    public ResponseEntity<GoalDto> getGoalById(@PathVariable Long id) {
        User currentUser = getOrCreateCurrentUser();
        Optional<Goal> goal = goalRepository.findById(id);
        if (goal.isEmpty() || !goal.get().getUser().getFirebaseUid().equals(currentUser.getFirebaseUid())) {
            return ResponseEntity.notFound().build();
        }
        return ResponseEntity.ok(convertToDto(goal.get()));
    }

    // 새로운 목표 생성
    @PostMapping
    public ResponseEntity<GoalDto> createGoal(@RequestBody GoalDto goalDto) {
        User currentUser = getOrCreateCurrentUser();
        Goal goal = new Goal();
        goal.setTitle(goalDto.getTitle());
        goal.setDescription(goalDto.getDescription());
        goal.setStatus(goalDto.getStatus());
        goal.setUser(currentUser);
        goal.setDueDate(goalDto.getDueDate());

        // Set HP based on difficulty if not provided
        int finalMaxHp = goalDto.getMaxHp() > 0 ? goalDto.getMaxHp() : BOSS_HP_MAP.getOrDefault(goalDto.getStatus(), 100); // Assuming status can be difficulty
        goal.setMaxHp(finalMaxHp);
        goal.setCurrentHp(finalMaxHp);

        if (goalDto.getParentGoalId() != null) {
            Optional<Goal> parentGoal = goalRepository.findById(Long.parseLong(goalDto.getParentGoalId()));
            if (parentGoal.isEmpty() || !parentGoal.get().getUser().getFirebaseUid().equals(currentUser.getFirebaseUid())) {
                return ResponseEntity.badRequest().build();
            }
            goal.setParentGoal(parentGoal.get());
        }

        Goal savedGoal = goalRepository.save(goal);
        return ResponseEntity.ok(convertToDto(savedGoal));
    }

    // 목표 업데이트
    @PutMapping("/{id}")
    public ResponseEntity<GoalDto> updateGoal(@PathVariable Long id, @RequestBody GoalDto goalDto) {
        User currentUser = getOrCreateCurrentUser();
        Optional<Goal> existingGoal = goalRepository.findById(id);

        if (existingGoal.isEmpty() || !existingGoal.get().getUser().getId().equals(currentUser.getId())) {
            return ResponseEntity.notFound().build();
        }

        Goal goalToUpdate = existingGoal.get();
        goalToUpdate.setTitle(goalDto.getTitle());
        goalToUpdate.setDescription(goalDto.getDescription());
        goalToUpdate.setStatus(goalDto.getStatus());
        goalToUpdate.setDueDate(goalDto.getDueDate());
        goalToUpdate.setMaxHp(goalDto.getMaxHp());
        goalToUpdate.setCurrentHp(goalDto.getCurrentHp());

        if (goalDto.getParentGoalId() != null) {
            Optional<Goal> parentGoal = goalRepository.findById(Long.parseLong(goalDto.getParentGoalId()));
            if (parentGoal.isEmpty() || !parentGoal.get().getUser().getFirebaseUid().equals(currentUser.getFirebaseUid())) {
                return ResponseEntity.badRequest().build();
            }
            goalToUpdate.setParentGoal(parentGoal.get());
        } else {
            goalToUpdate.setParentGoal(null);
        }

        Goal updatedGoal = goalRepository.save(goalToUpdate);
        return ResponseEntity.ok(convertToDto(updatedGoal));
    }

    // 목표 삭제
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteGoal(@PathVariable Long id) {
        User currentUser = getOrCreateCurrentUser();
        Optional<Goal> goal = goalRepository.findById(id);

        if (goal.isEmpty() || !goal.get().getUser().getFirebaseUid().equals(currentUser.getFirebaseUid())) {
            return ResponseEntity.notFound().build();
        }

        goalRepository.delete(goal.get());
        return ResponseEntity.noContent().build();
    }

    // 태스크 완료 시 목표(보스)에 데미지 적용
    @PostMapping("/{goalId}/damage")
    public ResponseEntity<GoalDto> applyDamageToGoal(@PathVariable Long goalId, @RequestParam String difficulty) {
        User currentUser = getOrCreateCurrentUser();
        Optional<Goal> goalOptional = goalRepository.findById(goalId);

        if (goalOptional.isEmpty() || !goalOptional.get().getUser().getFirebaseUid().equals(currentUser.getFirebaseUid())) {
            return ResponseEntity.notFound().build();
        }

        Goal goal = goalOptional.get();
        int damage = DIFFICULTY_DAMAGE_MAP.getOrDefault(difficulty, 0);
        int newHp = goal.getCurrentHp() - damage;
        goal.setCurrentHp(Math.max(0, newHp)); // HP cannot go below 0

        Goal updatedGoal = goalRepository.save(goal);
        return ResponseEntity.ok(convertToDto(updatedGoal));
    }
}