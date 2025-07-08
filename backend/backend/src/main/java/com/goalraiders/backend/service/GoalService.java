package com.goalraiders.backend.service;

import com.goalraiders.backend.Goal;
import com.goalraiders.backend.GoalRepository;
import com.goalraiders.backend.User;
import com.goalraiders.backend.config.GameConfigProperties;
import com.goalraiders.backend.dto.GoalDto;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
public class GoalService {

    @Autowired
    private GoalRepository goalRepository;

    @Autowired
    private UserService userService;

    @Autowired
    private GameConfigProperties gameConfigProperties;

    public List<GoalDto> getAllGoalsForCurrentUser() {
        User currentUser = userService.getOrCreateCurrentUser();
        List<Goal> goals = goalRepository.findByUserFirebaseUid(currentUser.getFirebaseUid());
        return goals.stream().map(this::convertToDto).collect(Collectors.toList());
    }

    public Optional<GoalDto> getGoalById(Long id) {
        User currentUser = userService.getOrCreateCurrentUser();
        Optional<Goal> goal = goalRepository.findById(id);
        if (goal.isEmpty() || !goal.get().getUser().getFirebaseUid().equals(currentUser.getFirebaseUid())) {
            return Optional.empty();
        }
        return Optional.of(convertToDto(goal.get()));
    }

    public GoalDto createGoal(GoalDto goalDto) {
        User currentUser = userService.getOrCreateCurrentUser();
        Goal goal = new Goal();
        goal.setTitle(goalDto.getTitle());
        goal.setDescription(goalDto.getDescription());
        goal.setStatus(goalDto.getStatus());
        goal.setUser(currentUser);
        goal.setDueDate(goalDto.getDueDate());

        int finalMaxHp = goalDto.getMaxHp() > 0 ? goalDto.getMaxHp() : gameConfigProperties.getBossHpMap().getOrDefault(goalDto.getStatus(), 100);
        goal.setMaxHp(finalMaxHp);
        goal.setCurrentHp(finalMaxHp);

        if (goalDto.getParentGoalId() != null) {
            Optional<Goal> parentGoal = goalRepository.findById(Long.parseLong(goalDto.getParentGoalId()));
            if (parentGoal.isEmpty() || !parentGoal.get().getUser().getFirebaseUid().equals(currentUser.getFirebaseUid())) {
                throw new IllegalArgumentException("Invalid parent goal id");
            }
            goal.setParentGoal(parentGoal.get());
        }

        Goal savedGoal = goalRepository.save(goal);
        return convertToDto(savedGoal);
    }

    public Optional<GoalDto> updateGoal(Long id, GoalDto goalDto) {
        User currentUser = userService.getOrCreateCurrentUser();
        Optional<Goal> existingGoal = goalRepository.findById(id);

        if (existingGoal.isEmpty() || !existingGoal.get().getUser().getId().equals(currentUser.getId())) {
            return Optional.empty();
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
                 throw new IllegalArgumentException("Invalid parent goal id");
            }
            goalToUpdate.setParentGoal(parentGoal.get());
        } else {
            goalToUpdate.setParentGoal(null);
        }

        Goal updatedGoal = goalRepository.save(goalToUpdate);
        return Optional.of(convertToDto(updatedGoal));
    }

    public boolean deleteGoal(Long id) {
        User currentUser = userService.getOrCreateCurrentUser();
        Optional<Goal> goal = goalRepository.findById(id);

        if (goal.isEmpty() || !goal.get().getUser().getFirebaseUid().equals(currentUser.getFirebaseUid())) {
            return false;
        }

        goalRepository.delete(goal.get());
        return true;
    }

    public Optional<GoalDto> applyDamageToGoal(Long goalId, String difficulty) {
        User currentUser = userService.getOrCreateCurrentUser();
        Optional<Goal> goalOptional = goalRepository.findById(goalId);

        if (goalOptional.isEmpty() || !goalOptional.get().getUser().getFirebaseUid().equals(currentUser.getFirebaseUid())) {
            return Optional.empty();
        }

        Goal goal = goalOptional.get();
        int damage = gameConfigProperties.getDifficultyDamageMap().getOrDefault(difficulty, 0);
        int newHp = goal.getCurrentHp() - damage;
        goal.setCurrentHp(Math.max(0, newHp));

        Goal updatedGoal = goalRepository.save(goal);
        return Optional.of(convertToDto(updatedGoal));
    }

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
}
