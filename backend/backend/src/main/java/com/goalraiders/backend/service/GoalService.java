package com.goalraiders.backend.service;

import com.goalraiders.backend.Goal;
import com.goalraiders.backend.GoalRepository;
import com.goalraiders.backend.User;
import com.goalraiders.backend.config.GameConfigProperties;
import com.goalraiders.backend.dto.GoalDto;
import com.goalraiders.backend.exception.InvalidInputException;
import com.goalraiders.backend.exception.ResourceNotFoundException;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

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

    public List<GoalDto> getAllGoalsForCurrentUser(int page, int size, String[] sort) {
        User currentUser = userService.getCurrentUserEntity();

        Sort sorting = Sort.by(Sort.Direction.ASC, "id"); // Default sort
        if (sort != null && sort.length > 0) {
            sorting = Sort.by(Sort.Direction.fromString(sort[1]), sort[0]);
        }

        Pageable pageable = PageRequest.of(page, size, sorting);
        Page<Goal> goalsPage = goalRepository.findByUserFirebaseUid(currentUser.getFirebaseUid(), pageable);
        return goalsPage.getContent().stream().map(this::convertToDto).collect(Collectors.toList());
    }

    public GoalDto getGoalById(Long id) {
        User currentUser = userService.getCurrentUserEntity();
        Goal goal = goalRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Goal not found with id " + id));
        if (!goal.getUser().getFirebaseUid().equals(currentUser.getFirebaseUid())) {
            throw new ResourceNotFoundException("Goal not found with id " + id); // Or AccessDeniedException
        }
        return convertToDto(goal);
    }

    public GoalDto createGoal(GoalDto goalDto) {
        User currentUser = userService.getCurrentUserEntity();
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
                throw new InvalidInputException("Invalid parent goal id: " + goalDto.getParentGoalId());
            }
            goal.setParentGoal(parentGoal.get());
        }

        Goal savedGoal = goalRepository.save(goal);
        return convertToDto(savedGoal);
    }

    public GoalDto updateGoal(Long id, GoalDto goalDto) {
        User currentUser = userService.getCurrentUserEntity();
        Goal goalToUpdate = goalRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Goal not found with id " + id));

        if (!goalToUpdate.getUser().getId().equals(currentUser.getId())) {
            throw new ResourceNotFoundException("Goal not found with id " + id); // Or AccessDeniedException
        }

        goalToUpdate.setTitle(goalDto.getTitle());
        goalToUpdate.setDescription(goalDto.getDescription());
        goalToUpdate.setStatus(goalDto.getStatus());
        goalToUpdate.setDueDate(goalDto.getDueDate());
        goalToUpdate.setMaxHp(goalDto.getMaxHp());
        goalToUpdate.setCurrentHp(goalDto.getCurrentHp());

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
        return convertToDto(updatedGoal);
    }

    public void deleteGoal(Long id) {
        User currentUser = userService.getCurrentUserEntity();
        Goal goal = goalRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Goal not found with id " + id));

        if (!goal.getUser().getFirebaseUid().equals(currentUser.getFirebaseUid())) {
            throw new ResourceNotFoundException("Goal not found with id " + id); // Or AccessDeniedException
        }

        goalRepository.delete(goal);
    }

    public GoalDto applyDamageToGoal(Long goalId, String difficulty) {
        User currentUser = userService.getCurrentUserEntity();
        Goal goal = goalRepository.findById(goalId)
                .orElseThrow(() -> new ResourceNotFoundException("Goal not found with id " + goalId));

        if (!goal.getUser().getFirebaseUid().equals(currentUser.getFirebaseUid())) {
            throw new ResourceNotFoundException("Goal not found with id " + goalId); // Or AccessDeniedException
        }

        int damage = gameConfigProperties.getDifficultyDamageMap().getOrDefault(difficulty, 0);
        int newHp = goal.getCurrentHp() - damage;
        goal.setCurrentHp(Math.max(0, newHp));

        Goal updatedGoal = goalRepository.save(goal);
        return convertToDto(updatedGoal);
    }

    public GoalDto defeatGoal(Long goalId) {
        User currentUser = userService.getCurrentUserEntity();
        Goal goal = goalRepository.findById(goalId)
            .orElseThrow(() -> new ResourceNotFoundException("Goal not found with id " + goalId));

        if (!goal.getUser().getFirebaseUid().equals(currentUser.getFirebaseUid())) {
            throw new ResourceNotFoundException("Goal not found with id " + goalId);
        }

        goal.setCurrentHp(0);
        // Grant experience to the user
        userService.addExperience(100); // Grant 100 XP

        Goal updatedGoal = goalRepository.save(goal);
        return convertToDto(updatedGoal);
    }

    @Transactional
    public GoalDto reviveGoal(Long goalId) {
        User currentUser = userService.getCurrentUserEntity();
        Goal goal = goalRepository.findById(goalId)
            .orElseThrow(() -> new ResourceNotFoundException("Goal not found with id " + goalId));

        if (!goal.getUser().getFirebaseUid().equals(currentUser.getFirebaseUid())) {
            throw new ResourceNotFoundException("Goal not found with id " + goalId);
        }

        goal.setCurrentHp(goal.getMaxHp()); // Restore HP to max
        Goal updatedGoal = goalRepository.save(goal);
        return convertToDto(updatedGoal);
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