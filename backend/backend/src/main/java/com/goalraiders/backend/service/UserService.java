package com.goalraiders.backend.service;

import com.goalraiders.backend.User;
import com.goalraiders.backend.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.stereotype.Service;

import java.util.Optional;

@Service
public class UserService {

    @Autowired
    private UserRepository userRepository;

    public User getOrCreateCurrentUser() {
        String firebaseUid = ((UserDetails) SecurityContextHolder.getContext().getAuthentication().getPrincipal()).getUsername();
        Optional<User> existingUser = userRepository.findByFirebaseUid(firebaseUid);

        if (existingUser.isPresent()) {
            return existingUser.get();
        } else {
            User newUser = new User();
            newUser.setFirebaseUid(firebaseUid);
            newUser.setUsername("User_" + firebaseUid.substring(0, 8));
            newUser.setEmail(firebaseUid + "@example.com"); // Consider a more robust way to handle email
            return userRepository.save(newUser);
        }
    }
}
