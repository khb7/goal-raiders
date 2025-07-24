package com.goalraiders.backend;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import java.util.List;

public interface GoalRepository extends JpaRepository<Goal, Long> {
    List<Goal> findByUserId(Long userId);
    List<Goal> findByUserIdAndParentGoalIsNull(Long userId);
    List<Goal> findByParentGoalId(Long parentGoalId);
    Page<Goal> findByUserFirebaseUid(String firebaseUid, Pageable pageable);
}
