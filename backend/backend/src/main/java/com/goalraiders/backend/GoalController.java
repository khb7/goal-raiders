package com.goalraiders.backend;

import com.goalraiders.backend.dto.GoalDto;
import com.goalraiders.backend.service.GoalService;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/goals")
public class GoalController {

    @Autowired
    private GoalService goalService;

    @GetMapping
    @PreAuthorize("hasRole('USER')")
    public ResponseEntity<List<GoalDto>> getAllGoalsForCurrentUser() {
        return ResponseEntity.ok(goalService.getAllGoalsForCurrentUser());
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasRole('USER')")
    public ResponseEntity<GoalDto> getGoalById(@PathVariable Long id) {
        return ResponseEntity.ok(goalService.getGoalById(id));
    }

    @PostMapping
    @PreAuthorize("hasRole('USER')")
    public ResponseEntity<GoalDto> createGoal(@RequestBody GoalDto goalDto) {
        return ResponseEntity.ok(goalService.createGoal(goalDto));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('USER')")
    public ResponseEntity<GoalDto> updateGoal(@PathVariable Long id, @RequestBody GoalDto goalDto) {
        return ResponseEntity.ok(goalService.updateGoal(id, goalDto));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('USER')")
    public ResponseEntity<Void> deleteGoal(@PathVariable Long id) {
        goalService.deleteGoal(id);
        return ResponseEntity.noContent().build();
    }

    @PostMapping("/{goalId}/damage")
    @PreAuthorize("hasRole('USER')")
    public ResponseEntity<GoalDto> applyDamageToGoal(@PathVariable Long goalId, @RequestParam String difficulty) {
        return ResponseEntity.ok(goalService.applyDamageToGoal(goalId, difficulty));
    }
}
