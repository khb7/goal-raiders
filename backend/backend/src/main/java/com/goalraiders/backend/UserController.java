package com.goalraiders.backend;

import com.goalraiders.backend.dto.UserDto;
import com.goalraiders.backend.service.UserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/users")
public class UserController {

    @Autowired
    private UserService userService;

    @GetMapping("/me")
    public ResponseEntity<UserDto> getCurrentUser() {
        return ResponseEntity.ok(userService.getOrCreateCurrentUser());
    }

    @PostMapping("/me/experience")
    public ResponseEntity<UserDto> addExperience(@RequestBody Map<String, Integer> payload) {
        Integer experience = payload.get("experience");
        return ResponseEntity.ok(userService.addExperience(experience));
    }
}
