package com.goalraiders.backend;

import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface GoalRepository extends JpaRepository<Goal, Long> {
    List<Goal> findByUserId(Long userId);
    List<Goal> findByUserIdAndParentGoalIsNull(Long userId);
    List<Goal> findByParentGoalId(Long parentGoalId);
    List<Goal> findByUserFirebaseUid(String firebaseUid);
}
