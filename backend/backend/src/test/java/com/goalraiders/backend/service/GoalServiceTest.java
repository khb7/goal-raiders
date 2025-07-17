package com.goalraiders.backend.service;

import com.goalraiders.backend.Goal;
import com.goalraiders.backend.GoalRepository;
import com.goalraiders.backend.User;
import com.goalraiders.backend.config.GameConfigProperties;
import com.goalraiders.backend.dto.GoalDto;
import com.goalraiders.backend.dto.mapper.GoalMapper;
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
class GoalServiceTest {

    @Mock
    private GoalRepository goalRepository;

    @Mock
    private UserService userService;

    @Mock
    private GameConfigProperties gameConfigProperties;

    @Mock
    private GoalMapper goalMapper;

    @InjectMocks
    private GoalService goalService;

    private User currentUser;
    private Goal testGoal;
    private GoalDto testGoalDto;

    @BeforeEach
    void setUp() {
        currentUser = new User();
        currentUser.setId(1L);
        currentUser.setFirebaseUid("testFirebaseUid");

        testGoal = new Goal();
        testGoal.setId(1L);
        testGoal.setTitle("Test Goal");
        testGoal.setDescription("Description");
        testGoal.setStatus("Medium");
        testGoal.setUser(currentUser);
        testGoal.setMaxHp(100);
        testGoal.setCurrentHp(100);

        testGoalDto = new GoalDto();
        testGoalDto.setId(1L);
        testGoalDto.setTitle("Test Goal");
        testGoalDto.setDescription("Description");
        testGoalDto.setStatus("Medium");
        testGoalDto.setUserId("testFirebaseUid");
        testGoalDto.setMaxHp(100);
        testGoalDto.setCurrentHp(100);

        when(userService.getCurrentUserEntity()).thenReturn(currentUser);
        when(goalMapper.toDto(any(Goal.class))).thenReturn(testGoalDto);
        when(goalMapper.toEntity(any(GoalDto.class))).thenReturn(testGoal);
        doNothing().when(goalMapper).toEntity(any(GoalDto.class), any(Goal.class));

        HashMap<String, Integer> bossHpMap = new HashMap<>();
        bossHpMap.put("Medium", 100);
        when(gameConfigProperties.getBossHpMap()).thenReturn(bossHpMap);

        HashMap<String, Integer> damageMap = new HashMap<>();
        damageMap.put("Easy", 5);
        damageMap.put("Medium", 10);
        when(gameConfigProperties.getDifficultyDamageMap()).thenReturn(damageMap);
    }

    @Test
    void getAllGoalsForCurrentUser() {
        List<Goal> goals = Arrays.asList(testGoal);
        when(goalRepository.findByUserFirebaseUid(currentUser.getFirebaseUid())).thenReturn(goals);

        List<GoalDto> result = goalService.getAllGoalsForCurrentUser();

        assertNotNull(result);
        assertEquals(1, result.size());
        assertEquals(testGoalDto.getTitle(), result.get(0).getTitle());
        verify(goalRepository, times(1)).findByUserFirebaseUid(currentUser.getFirebaseUid());
        verify(goalMapper, times(1)).toDto(testGoal);
    }

    @Test
    void getGoalById_success() {
        when(goalRepository.findById(1L)).thenReturn(Optional.of(testGoal));

        GoalDto result = goalService.getGoalById(1L);

        assertNotNull(result);
        assertEquals(testGoalDto.getTitle(), result.getTitle());
        verify(goalRepository, times(1)).findById(1L);
        verify(goalMapper, times(1)).toDto(testGoal);
    }

    @Test
    void getGoalById_notFound() {
        when(goalRepository.findById(anyLong())).thenReturn(Optional.empty());

        assertThrows(ResourceNotFoundException.class, () -> goalService.getGoalById(1L));
        verify(goalRepository, times(1)).findById(1L);
        verify(goalMapper, never()).toDto(any(Goal.class));
    }

    @Test
    void getGoalById_accessDenied() {
        User otherUser = new User();
        otherUser.setFirebaseUid("otherUid");
        testGoal.setUser(otherUser);
        when(goalRepository.findById(1L)).thenReturn(Optional.of(testGoal));

        assertThrows(ResourceNotFoundException.class, () -> goalService.getGoalById(1L));
        verify(goalRepository, times(1)).findById(1L);
        verify(goalMapper, never()).toDto(any(Goal.class));
    }

    @Test
    void createGoal_noParent() {
        when(goalRepository.save(any(Goal.class))).thenReturn(testGoal);

        GoalDto result = goalService.createGoal(testGoalDto);

        assertNotNull(result);
        assertEquals(testGoalDto.getTitle(), result.getTitle());
        verify(goalRepository, times(1)).save(any(Goal.class));
        verify(goalMapper, times(1)).toEntity(testGoalDto);
        verify(goalMapper, times(1)).toDto(testGoal);
    }

    @Test
    void createGoal_withParent_success() {
        Goal parentGoal = new Goal();
        parentGoal.setId(2L);
        parentGoal.setUser(currentUser);
        testGoalDto.setParentGoalId("2");

        when(goalRepository.findById(2L)).thenReturn(Optional.of(parentGoal));
        when(goalRepository.save(any(Goal.class))).thenReturn(testGoal);

        GoalDto result = goalService.createGoal(testGoalDto);

        assertNotNull(result);
        assertEquals(testGoalDto.getTitle(), result.getTitle());
        verify(goalRepository, times(1)).findById(2L);
        verify(goalRepository, times(1)).save(any(Goal.class));
    }

    @Test
    void createGoal_withParent_invalidParent() {
        testGoalDto.setParentGoalId("99");
        when(goalRepository.findById(99L)).thenReturn(Optional.empty());

        assertThrows(InvalidInputException.class, () -> goalService.createGoal(testGoalDto));
        verify(goalRepository, times(1)).findById(99L);
        verify(goalRepository, never()).save(any(Goal.class));
    }

    @Test
    void updateGoal_success() {
        GoalDto updatedDto = new GoalDto();
        updatedDto.setTitle("Updated Goal");
        updatedDto.setDescription("Updated Desc");
        updatedDto.setStatus("Hard");
        updatedDto.setDueDate(LocalDate.now());
        updatedDto.setMaxHp(200);
        updatedDto.setCurrentHp(150);
        updatedDto.setUserId(currentUser.getFirebaseUid());

        when(goalRepository.findById(1L)).thenReturn(Optional.of(testGoal));
        when(goalRepository.save(any(Goal.class))).thenReturn(testGoal);

        GoalDto result = goalService.updateGoal(1L, updatedDto);

        assertNotNull(result);
        assertEquals(updatedDto.getTitle(), result.getTitle());
        verify(goalRepository, times(1)).findById(1L);
        verify(goalRepository, times(1)).save(testGoal);
        verify(goalMapper, times(1)).toEntity(updatedDto, testGoal);
        verify(goalMapper, times(1)).toDto(testGoal);
    }

    @Test
    void updateGoal_notFound() {
        when(goalRepository.findById(anyLong())).thenReturn(Optional.empty());

        assertThrows(ResourceNotFoundException.class, () -> goalService.updateGoal(1L, testGoalDto));
        verify(goalRepository, times(1)).findById(1L);
        verify(goalRepository, never()).save(any(Goal.class));
    }

    @Test
    void updateGoal_accessDenied() {
        User otherUser = new User();
        otherUser.setId(2L);
        testGoal.setUser(otherUser);
        when(goalRepository.findById(1L)).thenReturn(Optional.of(testGoal));

        assertThrows(ResourceNotFoundException.class, () -> goalService.updateGoal(1L, testGoalDto));
        verify(goalRepository, times(1)).findById(1L);
        verify(goalRepository, never()).save(any(Goal.class));
    }

    @Test
    void deleteGoal_success() {
        when(goalRepository.findById(1L)).thenReturn(Optional.of(testGoal));
        doNothing().when(goalRepository).delete(testGoal);

        goalService.deleteGoal(1L);

        verify(goalRepository, times(1)).findById(1L);
        verify(goalRepository, times(1)).delete(testGoal);
    }

    @Test
    void deleteGoal_notFound() {
        when(goalRepository.findById(anyLong())).thenReturn(Optional.empty());

        assertThrows(ResourceNotFoundException.class, () -> goalService.deleteGoal(1L));
        verify(goalRepository, times(1)).findById(1L);
        verify(goalRepository, never()).delete(any(Goal.class));
    }

    @Test
    void deleteGoal_accessDenied() {
        User otherUser = new User();
        otherUser.setFirebaseUid("otherUid");
        testGoal.setUser(otherUser);
        when(goalRepository.findById(1L)).thenReturn(Optional.of(testGoal));

        assertThrows(ResourceNotFoundException.class, () -> goalService.deleteGoal(1L));
        verify(goalRepository, times(1)).findById(1L);
        verify(goalRepository, never()).delete(any(Goal.class));
    }

    @Test
    void applyDamageToGoal_success() {
        testGoal.setCurrentHp(50);
        when(goalRepository.findById(1L)).thenReturn(Optional.of(testGoal));
        when(goalRepository.save(any(Goal.class))).thenReturn(testGoal);

        GoalDto result = goalService.applyDamageToGoal(1L, "Medium");

        assertNotNull(result);
        assertEquals(40, testGoal.getCurrentHp()); // 50 - 10 (Medium damage)
        verify(goalRepository, times(1)).findById(1L);
        verify(goalRepository, times(1)).save(testGoal);
        verify(goalMapper, times(1)).toDto(testGoal);
    }

    @Test
    void applyDamageToGoal_hpDoesNotGoBelowZero() {
        testGoal.setCurrentHp(5);
        when(goalRepository.findById(1L)).thenReturn(Optional.of(testGoal));
        when(goalRepository.save(any(Goal.class))).thenReturn(testGoal);

        GoalDto result = goalService.applyDamageToGoal(1L, "Medium");

        assertNotNull(result);
        assertEquals(0, testGoal.getCurrentHp()); // 5 - 10 = -5, clamped to 0
        verify(goalRepository, times(1)).findById(1L);
        verify(goalRepository, times(1)).save(testGoal);
    }

    @Test
    void applyDamageToGoal_notFound() {
        when(goalRepository.findById(anyLong())).thenReturn(Optional.empty());

        assertThrows(ResourceNotFoundException.class, () -> goalService.applyDamageToGoal(1L, "Medium"));
        verify(goalRepository, times(1)).findById(1L);
        verify(goalRepository, never()).save(any(Goal.class));
    }

    @Test
    void applyDamageToGoal_accessDenied() {
        User otherUser = new User();
        otherUser.setFirebaseUid("otherUid");
        testGoal.setUser(otherUser);
        when(goalRepository.findById(1L)).thenReturn(Optional.of(testGoal));

        assertThrows(ResourceNotFoundException.class, () -> goalService.applyDamageToGoal(1L, "Medium"));
        verify(goalRepository, times(1)).findById(1L);
        verify(goalRepository, never()).save(any(Goal.class));
    }
}
