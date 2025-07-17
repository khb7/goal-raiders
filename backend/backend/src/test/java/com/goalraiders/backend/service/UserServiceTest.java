package com.goalraiders.backend.service;

import com.goalraiders.backend.User;
import com.goalraiders.backend.UserRepository;
import com.goalraiders.backend.dto.UserDto;
import com.goalraiders.backend.dto.mapper.UserMapper;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContext;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;

import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class UserServiceTest {

    @Mock
    private UserRepository userRepository;

    @Mock
    private UserMapper userMapper;

    @InjectMocks
    private UserService userService;

    @Mock
    private SecurityContext securityContext;

    @Mock
    private Authentication authentication;

    @Mock
    private UserDetails userDetails;

    private User testUser;
    private UserDto testUserDto;

    @BeforeEach
    void setUp() {
        // Mock SecurityContextHolder for authenticated user
        when(securityContext.getAuthentication()).thenReturn(authentication);
        SecurityContextHolder.setContext(securityContext);
        when(authentication.getPrincipal()).thenReturn(userDetails);
        when(userDetails.getUsername()).thenReturn("testFirebaseUid");

        testUser = new User();
        testUser.setId(1L);
        testUser.setFirebaseUid("testFirebaseUid");
        testUser.setUsername("User_testF");
        testUser.setEmail("testFirebaseUid@example.com");
        testUser.setLevel(1);
        testUser.setExperience(0);
        testUser.setCurrentHp(100);
        testUser.setMaxHp(100);

        testUserDto = new UserDto(1L, "User_testF", "testFirebaseUid@example.com", 1, 0, 100, 100);
    }

    @Test
    void getOrCreateCurrentUser_existingUser() {
        when(userRepository.findByFirebaseUid("testFirebaseUid")).thenReturn(Optional.of(testUser));
        when(userMapper.toDto(testUser)).thenReturn(testUserDto);

        UserDto result = userService.getOrCreateCurrentUser();

        assertNotNull(result);
        assertEquals(testUserDto.getId(), result.getId());
        assertEquals(testUserDto.getUsername(), result.getUsername());
        verify(userRepository, times(1)).findByFirebaseUid("testFirebaseUid");
        verify(userRepository, never()).save(any(User.class));
        verify(userMapper, times(1)).toDto(testUser);
    }

    @Test
    void getOrCreateCurrentUser_newUser() {
        when(userRepository.findByFirebaseUid("testFirebaseUid")).thenReturn(Optional.empty());
        when(userRepository.save(any(User.class))).thenReturn(testUser);
        when(userMapper.toDto(testUser)).thenReturn(testUserDto);

        UserDto result = userService.getOrCreateCurrentUser();

        assertNotNull(result);
        assertEquals(testUserDto.getId(), result.getId());
        assertEquals(testUserDto.getUsername(), result.getUsername());
        verify(userRepository, times(1)).findByFirebaseUid("testFirebaseUid");
        verify(userRepository, times(1)).save(any(User.class));
        verify(userMapper, times(1)).toDto(testUser);
    }

    @Test
    void getCurrentUserEntity_existingUser() {
        when(userRepository.findByFirebaseUid("testFirebaseUid")).thenReturn(Optional.of(testUser));

        User result = userService.getCurrentUserEntity();

        assertNotNull(result);
        assertEquals(testUser.getId(), result.getId());
        verify(userRepository, times(1)).findByFirebaseUid("testFirebaseUid");
        verify(userRepository, never()).save(any(User.class));
    }

    @Test
    void getCurrentUserEntity_newUser() {
        when(userRepository.findByFirebaseUid("testFirebaseUid")).thenReturn(Optional.empty());
        when(userRepository.save(any(User.class))).thenReturn(testUser);

        User result = userService.getCurrentUserEntity();

        assertNotNull(result);
        assertEquals(testUser.getId(), result.getId());
        verify(userRepository, times(1)).findByFirebaseUid("testFirebaseUid");
        verify(userRepository, times(1)).save(any(User.class));
    }

    @Test
    void addExperience_userNotFound() {
        when(userRepository.findByFirebaseUid("nonExistentUid")).thenReturn(Optional.empty());

        RuntimeException exception = assertThrows(RuntimeException.class, () -> {
            userService.addExperience("nonExistentUid", 10);
        });

        assertEquals("User not found", exception.getMessage());
        verify(userRepository, times(1)).findByFirebaseUid("nonExistentUid");
        verify(userRepository, never()).save(any(User.class));
    }

    @Test
    void addExperience_addsExperienceWithoutLevelUp() {
        testUser.setExperience(50);
        when(userRepository.findByFirebaseUid("testFirebaseUid")).thenReturn(Optional.of(testUser));
        when(userRepository.save(any(User.class))).thenReturn(testUser);

        userService.addExperience("testFirebaseUid", 30);

        assertEquals(80, testUser.getExperience());
        assertEquals(1, testUser.getLevel());
        verify(userRepository, times(1)).findByFirebaseUid("testFirebaseUid");
        verify(userRepository, times(1)).save(testUser);
    }

    @Test
    void addExperience_levelsUp() {
        testUser.setExperience(90);
        when(userRepository.findByFirebaseUid("testFirebaseUid")).thenReturn(Optional.of(testUser));
        when(userRepository.save(any(User.class))).thenReturn(testUser);

        userService.addExperience("testFirebaseUid", 20);

        assertEquals(10, testUser.getExperience()); // 90 + 20 = 110, 110 - 100 = 10
        assertEquals(2, testUser.getLevel()); // Level up from 1 to 2
        verify(userRepository, times(1)).findByFirebaseUid("testFirebaseUid");
        verify(userRepository, times(1)).save(testUser);
    }
}
