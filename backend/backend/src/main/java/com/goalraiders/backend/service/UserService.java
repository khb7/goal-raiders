package com.goalraiders.backend.service;

import com.goalraiders.backend.User;
import com.goalraiders.backend.UserRepository;
import com.goalraiders.backend.dto.UserDto;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.stereotype.Service;

import java.util.Optional;

@Service
public class UserService {

    @Autowired
    private UserRepository userRepository;

    public UserDto getOrCreateCurrentUser() {
        String firebaseUid = ((UserDetails) SecurityContextHolder.getContext().getAuthentication().getPrincipal()).getUsername();
        Optional<User> existingUser = userRepository.findByFirebaseUid(firebaseUid);

        User user = existingUser.orElseGet(() -> {
            User newUser = new User();
            newUser.setFirebaseUid(firebaseUid);
            newUser.setUsername("User_" + firebaseUid.substring(0, 8));
            newUser.setEmail(firebaseUid + "@example.com"); // Consider a more robust way to handle email
            return userRepository.save(newUser);
        });

        return new UserDto(user.getId(), user.getUsername(), user.getEmail(), user.getLevel(), user.getExperience());
    }

    public User getCurrentUserEntity() {
        String firebaseUid = ((UserDetails) SecurityContextHolder.getContext().getAuthentication().getPrincipal()).getUsername();
        return userRepository.findByFirebaseUid(firebaseUid).orElseGet(() -> {
            User newUser = new User();
            newUser.setFirebaseUid(firebaseUid);
            newUser.setUsername("User_" + firebaseUid.substring(0, 8));
            newUser.setEmail(firebaseUid + "@example.com"); // Consider a more robust way to handle email
            return userRepository.save(newUser);
        });
    }

    public UserDto addExperience(int experience) {
        User currentUser = getCurrentUserEntity();
        int newExperience = currentUser.getExperience() + experience;
        int newLevel = currentUser.getLevel();

        while (newExperience >= 100) { // Loop to handle multiple level-ups
            newLevel += 1;
            newExperience -= 100;
        }

        currentUser.setExperience(newExperience);
        currentUser.setLevel(newLevel);
        userRepository.save(currentUser);
        return new UserDto(currentUser.getId(), currentUser.getUsername(), currentUser.getEmail(), currentUser.getLevel(), currentUser.getExperience());
    }
}
