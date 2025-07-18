package com.goalraiders.backend.service;

import com.goalraiders.backend.*;
import com.goalraiders.backend.config.GameConfigProperties;
import com.goalraiders.backend.dto.TaskDto;
import com.goalraiders.backend.dto.mapper.TaskMapper;
import com.goalraiders.backend.exception.InvalidInputException;
import com.goalraiders.backend.exception.ResourceNotFoundException;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.LocalDate;
import java.util.Arrays;
import java.util.HashMap;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class TaskServiceTest {

    @Mock
    private TaskRepository taskRepository;

    @Mock
    private GoalRepository goalRepository;

    @Mock
    private UserService userService;

    @Mock
    private GameConfigProperties gameConfigProperties;

    @Mock
    private TaskMapper taskMapper;

    @InjectMocks
    private TaskService taskService;

    private User currentUser;
    private Task testTask;
    private TaskDto testTaskDto;
    private Goal testGoal;

    @BeforeEach
    void setUp() {
        currentUser = new User();
        currentUser.setId(1L);
        currentUser.setFirebaseUid("testFirebaseUid");
        currentUser.setExperience(0);
        currentUser.setLevel(1);

        testGoal = new Goal();
        testGoal.setId(10L);
        testGoal.setTitle("Boss Goal");
        testGoal.setUser(currentUser);
        testGoal.setCurrentHp(100);
        testGoal.setMaxHp(100);
        testGoal.setDefeated(false);
        testGoal.setStatus("Medium");

        testTask = new Task();
        testTask.setId(1L);
        testTask.setTitle("Test Task");
        testTask.setCompleted(false);
        testTask.setRecurrenceDays(0);
        testTask.setDifficulty("Easy");
        testTask.setUser(currentUser);
        testTask.setGoal(testGoal);

        testTaskDto = new TaskDto();
        testTaskDto.setId(1L);
        testTaskDto.setTitle("Test Task");
        testTaskDto.setCompleted(false);
        testTaskDto.setRecurrenceDays(0);
        testTaskDto.setDifficulty("Easy");
        testTaskDto.setUserId("testFirebaseUid");
        testTaskDto.setGoalId("10");

        when(userService.getCurrentUserEntity()).thenReturn(currentUser);
        when(taskMapper.toDto(any(Task.class))).thenReturn(testTaskDto);
        when(taskMapper.toEntity(any(TaskDto.class))).thenReturn(testTask);
        doNothing().when(taskMapper).updateTaskFromDto(any(TaskDto.class), any(Task.class));

        HashMap<String, Integer> damageMap = new HashMap<>();
        damageMap.put("Easy", 5);
        damageMap.put("Medium", 10);
        when(gameConfigProperties.getDifficultyDamageMap()).thenReturn(damageMap);

        HashMap<String, Integer> xpRewardMap = new HashMap<>();
        xpRewardMap.put("Medium", 50);
        when(gameConfigProperties.getBossXpRewardMap()).thenReturn(xpRewardMap);
    }

    @Test
    void getAllTasksForCurrentUser() {
        List<Task> tasks = Arrays.asList(testTask);
        when(taskRepository.findByUserFirebaseUid(currentUser.getFirebaseUid())).thenReturn(tasks);

        List<TaskDto> result = taskService.getAllTasksForCurrentUser();

        assertNotNull(result);
        assertEquals(1, result.size());
        assertEquals(testTaskDto.getTitle(), result.get(0).getTitle());
        verify(taskRepository, times(1)).findByUserFirebaseUid(currentUser.getFirebaseUid());
        verify(taskMapper, times(1)).toDto(testTask);
    }

    @Test
    void getTaskById_success() {
        when(taskRepository.findById(1L)).thenReturn(Optional.of(testTask));

        TaskDto result = taskService.getTaskById(1L);

        assertNotNull(result);
        assertEquals(testTaskDto.getTitle(), result.getTitle());
        verify(taskRepository, times(1)).findById(1L);
        verify(taskMapper, times(1)).toDto(testTask);
    }

    @Test
    void getTaskById_notFound() {
        when(taskRepository.findById(anyLong())).thenReturn(Optional.empty());

        assertThrows(ResourceNotFoundException.class, () -> taskService.getTaskById(1L));
        verify(taskRepository, times(1)).findById(1L);
        verify(taskMapper, never()).toDto(any(Task.class));
    }

    @Test
    void getTaskById_accessDenied() {
        User otherUser = new User();
        otherUser.setFirebaseUid("otherUid");
        testTask.setUser(otherUser);
        when(taskRepository.findById(1L)).thenReturn(Optional.of(testTask));

        assertThrows(ResourceNotFoundException.class, () -> taskService.getTaskById(1L));
        verify(taskRepository, times(1)).findById(1L);
        verify(taskMapper, never()).toDto(any(Task.class));
    }

    @Test
    void createTask_noParentNoGoal() {
        testTaskDto.setGoalId(null);
        testTaskDto.setParentTaskId(null);
        testTask.setGoal(null);
        testTask.setParentTask(null);
        when(taskRepository.save(any(Task.class))).thenReturn(testTask);

        TaskDto result = taskService.createTask(testTaskDto);

        assertNotNull(result);
        assertEquals(testTaskDto.getTitle(), result.getTitle());
        verify(taskRepository, times(1)).save(any(Task.class));
        verify(taskMapper, times(1)).toEntity(testTaskDto);
        verify(taskMapper, times(1)).toDto(testTask);
    }

    @Test
    void createTask_withGoal_success() {
        when(goalRepository.findById(10L)).thenReturn(Optional.of(testGoal));
        when(taskRepository.save(any(Task.class))).thenReturn(testTask);

        TaskDto result = taskService.createTask(testTaskDto);

        assertNotNull(result);
        assertEquals(testTaskDto.getTitle(), result.getTitle());
        verify(goalRepository, times(1)).findById(10L);
        verify(taskRepository, times(1)).save(any(Task.class));
    }

    @Test
    void createTask_withGoal_invalidGoal() {
        testTaskDto.setGoalId("99");
        when(goalRepository.findById(99L)).thenReturn(Optional.empty());

        assertThrows(InvalidInputException.class, () -> taskService.createTask(testTaskDto));
        verify(goalRepository, times(1)).findById(99L);
        verify(taskRepository, never()).save(any(Task.class));
    }

    @Test
    void createTask_withParentTask_success() {
        Task parentTask = new Task();
        parentTask.setId(2L);
        parentTask.setUser(currentUser);
        testTaskDto.setParentTaskId("2");
        testTaskDto.setGoalId(null);
        testTask.setGoal(null);

        when(taskRepository.findById(2L)).thenReturn(Optional.of(parentTask));
        when(taskRepository.save(any(Task.class))).thenReturn(testTask);

        TaskDto result = taskService.createTask(testTaskDto);

        assertNotNull(result);
        assertEquals(testTaskDto.getTitle(), result.getTitle());
        verify(taskRepository, times(1)).findById(2L);
        verify(taskRepository, times(1)).save(any(Task.class));
    }

    @Test
    void createTask_withParentTask_invalidParentTask() {
        testTaskDto.setParentTaskId("99");
        when(taskRepository.findById(99L)).thenReturn(Optional.empty());

        assertThrows(InvalidInputException.class, () -> taskService.createTask(testTaskDto));
        verify(taskRepository, times(1)).findById(99L);
        verify(taskRepository, never()).save(any(Task.class));
    }

    @Test
    void updateTask_success() {
        TaskDto updatedDto = new TaskDto();
        updatedDto.setTitle("Updated Task");
        updatedDto.setCompleted(true);
        updatedDto.setRecurrenceDays(7);
        updatedDto.setDifficulty("Hard");
        updatedDto.setUserId(currentUser.getFirebaseUid());
        updatedDto.setGoalId("10");

        when(taskRepository.findById(1L)).thenReturn(Optional.of(testTask));
        when(goalRepository.findById(10L)).thenReturn(Optional.of(testGoal));
        when(taskRepository.save(any(Task.class))).thenReturn(testTask);

        TaskDto result = taskService.updateTask(1L, updatedDto);

        assertNotNull(result);
        assertEquals(updatedDto.getTitle(), result.getTitle());
        verify(taskRepository, times(1)).findById(1L);
        verify(taskRepository, times(1)).save(testTask);
        verify(taskMapper, times(1)).updateTaskFromDto(updatedDto, testTask);
        verify(taskMapper, times(1)).toDto(testTask);
    }

    @Test
    void updateTask_notFound() {
        when(taskRepository.findById(anyLong())).thenReturn(Optional.empty());

        assertThrows(ResourceNotFoundException.class, () -> taskService.updateTask(1L, testTaskDto));
        verify(taskRepository, times(1)).findById(1L);
        verify(taskRepository, never()).save(any(Task.class));
    }

    @Test
    void updateTask_accessDenied() {
        User otherUser = new User();
        otherUser.setId(2L);
        testTask.setUser(otherUser);
        when(taskRepository.findById(1L)).thenReturn(Optional.of(testTask));

        assertThrows(ResourceNotFoundException.class, () -> taskService.updateTask(1L, testTaskDto));
        verify(taskRepository, times(1)).findById(1L);
        verify(taskRepository, never()).save(any(Task.class));
    }

    @Test
    void deleteTask_success() {
        when(taskRepository.findById(1L)).thenReturn(Optional.of(testTask));
        doNothing().when(taskRepository).delete(testTask);

        taskService.deleteTask(1L);

        verify(taskRepository, times(1)).findById(1L);
        verify(taskRepository, times(1)).delete(testTask);
    }

    @Test
    void deleteTask_notFound() {
        when(taskRepository.findById(anyLong())).thenReturn(Optional.empty());

        assertThrows(ResourceNotFoundException.class, () -> taskService.deleteTask(1L));
        verify(taskRepository, times(1)).findById(1L);
        verify(taskRepository, never()).delete(any(Task.class));
    }

    @Test
    void deleteTask_accessDenied() {
        User otherUser = new User();
        otherUser.setFirebaseUid("otherUid");
        testTask.setUser(otherUser);
        when(taskRepository.findById(1L)).thenReturn(Optional.of(testTask));

        assertThrows(ResourceNotFoundException.class, () -> taskService.deleteTask(1L));
        verify(taskRepository, times(1)).findById(1L);
        verify(taskRepository, never()).delete(any(Task.class));
    }

    @Test
    void completeTask_notCompleted_appliesDamageAndXp() {
        when(taskRepository.findById(1L)).thenReturn(Optional.of(testTask));
        when(taskRepository.save(any(Task.class))).thenReturn(testTask);
        when(goalRepository.save(any(Goal.class))).thenReturn(testGoal);
        doNothing().when(userService).addExperience(anyString(), anyInt());

        TaskDto result = taskService.completeTask(1L);

        assertTrue(testTask.isCompleted());
        assertNotNull(testTask.getLastCompleted());
        assertEquals(95, testGoal.getCurrentHp()); // 100 - 5 (Easy damage)
        verify(taskRepository, times(1)).findById(1L);
        verify(taskRepository, times(1)).save(testTask);
        verify(goalRepository, times(1)).save(testGoal);
        verify(userService, never()).addExperience(anyString(), anyInt()); // Boss not defeated yet
        verify(taskMapper, times(1)).toDto(testTask);
    }

    @Test
    void completeTask_notCompleted_bossDefeated_appliesDamageAndXp() {
        testGoal.setCurrentHp(5);
        testTask.setDifficulty("Easy");
        when(taskRepository.findById(1L)).thenReturn(Optional.of(testTask));
        when(taskRepository.save(any(Task.class))).thenReturn(testTask);
        when(goalRepository.save(any(Goal.class))).thenReturn(testGoal);
        doNothing().when(userService).addExperience(anyString(), anyInt());

        TaskDto result = taskService.completeTask(1L);

        assertTrue(testTask.isCompleted());
        assertNotNull(testTask.getLastCompleted());
        assertEquals(0, testGoal.getCurrentHp()); // 5 - 5 = 0
        assertTrue(testGoal.isDefeated());
        verify(taskRepository, times(1)).findById(1L);
        verify(taskRepository, times(1)).save(testTask);
        verify(goalRepository, times(1)).save(testGoal);
        verify(userService, times(1)).addExperience(currentUser.getFirebaseUid(), 50); // Boss defeated, XP awarded
        verify(taskMapper, times(1)).toDto(testTask);
    }

    @Test
    void completeTask_alreadyCompleted_notRecurring_noChange() {
        testTask.setCompleted(true);
        testTask.setLastCompleted(LocalDate.now());
        testTask.setRecurrenceDays(0);

        when(taskRepository.findById(1L)).thenReturn(Optional.of(testTask));

        TaskDto result = taskService.completeTask(1L);

        assertTrue(testTask.isCompleted());
        assertNotNull(testTask.getLastCompleted());
        verify(taskRepository, times(1)).findById(1L);
        verify(taskRepository, never()).save(any(Task.class)); // Should not save if no change
        verify(goalRepository, never()).save(any(Goal.class));
        verify(userService, never()).addExperience(anyString(), anyInt());
        verify(taskMapper, times(1)).toDto(testTask);
    }

    @Test
    void completeTask_alreadyCompleted_recurring_dueToday() {
        testTask.setCompleted(true);
        testTask.setRecurrenceDays(1);
        testTask.setLastCompleted(LocalDate.now().minusDays(1)); // Completed yesterday, due today

        when(taskRepository.findById(1L)).thenReturn(Optional.of(testTask));
        when(taskRepository.save(any(Task.class))).thenReturn(testTask);
        when(goalRepository.save(any(Goal.class))).thenReturn(testGoal);
        doNothing().when(userService).addExperience(anyString(), anyInt());

        TaskDto result = taskService.completeTask(1L);

        assertTrue(testTask.isCompleted()); // Task is completed again
        assertNotNull(testTask.getLastCompleted()); // Last completed date updated
        assertEquals(95, testGoal.getCurrentHp()); // Damage applied again
        verify(taskRepository, times(1)).findById(1L);
        verify(taskRepository, times(1)).save(testTask);
        verify(goalRepository, times(1)).save(testGoal);
        verify(taskMapper, times(1)).toDto(testTask);
    }

    @Test
    void completeTask_alreadyCompleted_recurring_notYetDue() {
        testTask.setCompleted(true);
        testTask.setRecurrenceDays(7);
        testTask.setLastCompleted(LocalDate.now()); // Completed today, not yet due

        when(taskRepository.findById(1L)).thenReturn(Optional.of(testTask));

        TaskDto result = taskService.completeTask(1L);

        assertTrue(testTask.isCompleted());
        assertEquals(LocalDate.now(), testTask.getLastCompleted());
        verify(taskRepository, times(1)).findById(1L);
        verify(taskRepository, never()).save(any(Task.class));
        verify(goalRepository, never()).save(any(Goal.class));
        verify(userService, never()).addExperience(anyString(), anyInt());
        verify(taskMapper, times(1)).toDto(testTask);
    }

    @Test
    void completeTask_notFound() {
        when(taskRepository.findById(anyLong())).thenReturn(Optional.empty());

        assertThrows(ResourceNotFoundException.class, () -> taskService.completeTask(1L));
        verify(taskRepository, times(1)).findById(1L);
        verify(taskRepository, never()).save(any(Task.class));
    }

    @Test
    void completeTask_accessDenied() {
        User otherUser = new User();
        otherUser.setFirebaseUid("otherUid");
        testTask.setUser(otherUser);
        when(taskRepository.findById(1L)).thenReturn(Optional.of(testTask));

        assertThrows(ResourceNotFoundException.class, () -> taskService.completeTask(1L));
        verify(taskRepository, times(1)).findById(1L);
        verify(taskRepository, never()).save(any(Task.class));
    }
}
