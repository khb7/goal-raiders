package com.goalraiders.backend;

import com.goalraiders.backend.config.GameConfigProperties;
import com.goalraiders.backend.dto.GameConfigDto;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/config")
public class GameConfigController {

    private final GameConfigProperties gameConfigProperties;

    @Autowired
    public GameConfigController(GameConfigProperties gameConfigProperties) {
        this.gameConfigProperties = gameConfigProperties;
    }

    @GetMapping("/game")
    public ResponseEntity<GameConfigDto> getGameConfig() {
        GameConfigDto gameConfigDto = new GameConfigDto(
            gameConfigProperties.getDifficultyDamageMap(),
            gameConfigProperties.getBossHpMap()
        );
        return ResponseEntity.ok(gameConfigDto);
    }
}
