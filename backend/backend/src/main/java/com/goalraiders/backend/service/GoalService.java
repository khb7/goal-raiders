package com.goalraiders.backend.service;

import com.goalraiders.backend.Goal;
import com.goalraiders.backend.GoalRepository;
import com.goalraiders.backend.User;
import com.goalraiders.backend.config.GameConfigProperties;
import com.goalraiders.backend.dto.GoalDto;
import com.goalraiders.backend.dto.mapper.GoalMapper;
import com.goalraiders.backend.exception.InvalidInputException;
import com.goalraiders.backend.exception.ResourceNotFoundException;
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

    @Autowired
    private GoalMapper goalMapper;

    public List<GoalDto> getAllGoalsForCurrentUser() {
        User currentUser = userService.getCurrentUserEntity();
        List<Goal> goals = goalRepository.findByUserFirebaseUid(currentUser.getFirebaseUid());
        return goals.stream().map(goalMapper::toDto).collect(Collectors.toList());
    }

    public GoalDto getGoalById(Long id) {
        User currentUser = userService.getCurrentUserEntity();
        Goal goal = goalRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Goal not found with id " + id));
        if (!goal.getUser().getFirebaseUid().equals(currentUser.getFirebaseUid())) {
            throw new ResourceNotFoundException("Goal not found with id " + id);
        }
        return goalMapper.toDto(goal);
    }

    public GoalDto createGoal(GoalDto goalDto) {
        User currentUser = userService.getCurrentUserEntity();
        Goal goal = goalMapper.toEntity(goalDto);
        goal.setUser(currentUser);

        int finalMaxHp = goalDto.getMaxHp() > 0 ? goalDto.getMaxHp() : gameConfigProperties.getBossHpMap().getOrDefault(goalDto.getStatus(), 100);
        goal.setMaxHp(finalMaxHp);
        goal.setCurrentHp(finalMaxHp);

        if (goalDto.getParentGoalId() != null) {
            Optional<Goal> parentGoal = goalRepository.findById(Long.parseLong(goalDto.getParentGoalId()));
            if (parentGoal.isEmpty() || !parentGoal.get().getUser().getFirebaseUid().equals(currentUser.getFirebaseUid())) {
                throw new InvalidInputException("Invalid parent goal id: " + goalDto.getParentGoalId());
            }
            goal.setParentGoal(parentGoal.get());
        }

        Goal savedGoal = goalRepository.save(goal);
        return goalMapper.toDto(savedGoal);
    }

    public GoalDto updateGoal(Long id, GoalDto goalDto) {
        User currentUser = userService.getCurrentUserEntity();
        Goal goalToUpdate = goalRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Goal not found with id " + id));

        if (!goalToUpdate.getUser().getId().equals(currentUser.getId())) {
            throw new ResourceNotFoundException("Goal not found with id " + id);
        }

        goalMapper.updateGoalFromDto(goalDto, goalToUpdate); // Update existing entity

        if (goalDto.getParentGoalId() != null) {
            Optional<Goal> parentGoal = goalRepository.findById(Long.parseLong(goalDto.getParentGoalId()));
            if (parentGoal.isEmpty() || !parentGoal.get().getUser().getFirebaseUid().equals(currentUser.getFirebaseUid())) {
                 throw new InvalidInputException("Invalid parent goal id: " + goalDto.getParentGoalId());
            }
            goalToUpdate.setParentGoal(parentGoal.get());
        } else {
            goalToUpdate.setParentGoal(null);
        }

        Goal updatedGoal = goalRepository.save(goalToUpdate);
        return goalMapper.toDto(updatedGoal);
    }

    public void deleteGoal(Long id) {
        User currentUser = userService.getCurrentUserEntity();
        Goal goal = goalRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Goal not found with id " + id));

        if (!goal.getUser().getFirebaseUid().equals(currentUser.getFirebaseUid())) {
            throw new ResourceNotFoundException("Goal not found with id " + id);
        }

        goalRepository.delete(goal);
    }

    public GoalDto applyDamageToGoal(Long goalId, String difficulty) {
        User currentUser = userService.getCurrentUserEntity();
        Goal goal = goalRepository.findById(goalId)
                .orElseThrow(() -> new ResourceNotFoundException("Goal not found with id " + goalId));

        if (!goal.getUser().getFirebaseUid().equals(currentUser.getFirebaseUid())) {
            throw new ResourceNotFoundException("Goal not found with id " + goalId);
        }

        int damage = gameConfigProperties.getDifficultyDamageMap().getOrDefault(difficulty, 0);
        int newHp = goal.getCurrentHp() - damage;
        goal.setCurrentHp(Math.max(0, newHp));

        Goal updatedGoal = goalRepository.save(goal);
        return goalMapper.toDto(updatedGoal);
    }
}