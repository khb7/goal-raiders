package com.goalraiders.backend.service;

import com.goalraiders.backend.User;
import com.goalraiders.backend.UserRepository;
import com.goalraiders.backend.dto.UserDto;
import com.goalraiders.backend.dto.mapper.UserMapper;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.stereotype.Service;

import java.util.Optional;

@Service
public class UserService {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private UserMapper userMapper;

    public UserDto getOrCreateCurrentUser() {
        String firebaseUid = ((UserDetails) SecurityContextHolder.getContext().getAuthentication().getPrincipal()).getUsername();
        Optional<User> existingUser = userRepository.findByFirebaseUid(firebaseUid);

        User user = existingUser.orElseGet(() -> {
            User newUser = new User();
            newUser.setFirebaseUid(firebaseUid);
            newUser.setUsername("User_" + firebaseUid.substring(0, 8));
            newUser.setEmail(firebaseUid + "@example.com");
            return userRepository.save(newUser);
        });

        return userMapper.toDto(user);
    }

    public User getCurrentUserEntity() {
        String firebaseUid = ((UserDetails) SecurityContextHolder.getContext().getAuthentication().getPrincipal()).getUsername();
        return userRepository.findByFirebaseUid(firebaseUid).orElseGet(() -> {
            User newUser = new User();
            newUser.setFirebaseUid(firebaseUid);
            newUser.setUsername("User_" + firebaseUid.substring(0, 8));
            newUser.setEmail(firebaseUid + "@example.com");
            return userRepository.save(newUser);
        });
    }

    public void addExperience(String firebaseUid, int experience) {
        User user = userRepository.findByFirebaseUid(firebaseUid).orElseThrow(() -> new RuntimeException("User not found"));
        int newExperience = user.getExperience() + experience;
        int newLevel = user.getLevel();

        if (newExperience >= 100) {
            newLevel += 1;
            newExperience -= 100;
        }

        user.setExperience(newExperience);
        user.setLevel(newLevel);
        userRepository.save(user);
    }
}
