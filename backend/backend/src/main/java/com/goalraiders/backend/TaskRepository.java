package com.goalraiders.backend;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import java.util.List;

public interface TaskRepository extends JpaRepository<Task, Long> {
    List<Task> findByGoalId(Long goalId);
    List<Task> findByUserId(Long userId);
    Page<Task> findByUserFirebaseUid(String firebaseUid, Pageable pageable);
}
