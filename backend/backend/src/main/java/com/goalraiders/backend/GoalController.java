package com.goalraiders.backend;

import com.goalraiders.backend.dto.GoalDto;
import com.goalraiders.backend.service.GoalService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/goals")
public class GoalController {

    @Autowired
    private GoalService goalService;

    @GetMapping
    public ResponseEntity<List<GoalDto>> getAllGoals(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(defaultValue = "id,asc") String[] sort) {
        return ResponseEntity.ok(goalService.getAllGoalsForCurrentUser(page, size, sort));
    }

    @GetMapping("/{id}")
    public ResponseEntity<GoalDto> getGoalById(@PathVariable Long id) {
        return ResponseEntity.ok(goalService.getGoalById(id));
    }

    @PostMapping
    public ResponseEntity<GoalDto> createGoal(@Valid @RequestBody GoalDto goalDto) {
        return new ResponseEntity<>(goalService.createGoal(goalDto), HttpStatus.CREATED);
    }

    @PutMapping("/{id}")
    public ResponseEntity<GoalDto> updateGoal(@PathVariable Long id, @Valid @RequestBody GoalDto goalDto) {
        return ResponseEntity.ok(goalService.updateGoal(id, goalDto));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteGoal(@PathVariable Long id) {
        goalService.deleteGoal(id);
        return ResponseEntity.noContent().build();
    }

    @PostMapping("/{id}/damage")
    public ResponseEntity<GoalDto> applyDamage(@PathVariable Long id, @RequestBody Map<String, String> payload) {
        String difficulty = payload.get("difficulty");
        return ResponseEntity.ok(goalService.applyDamageToGoal(id, difficulty));
    }

    @PostMapping("/{id}/defeat")
    public ResponseEntity<GoalDto> defeatGoal(@PathVariable Long id) {
        return ResponseEntity.ok(goalService.defeatGoal(id));
    }

    @PostMapping("/{id}/revive")
    public ResponseEntity<GoalDto> reviveGoal(@PathVariable Long id) {
        return ResponseEntity.ok(goalService.reviveGoal(id));
    }
}
