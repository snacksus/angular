package com.scrumpoker.controller;

import com.scrumpoker.dto.CreateSessionRequest;
import com.scrumpoker.dto.JoinSessionRequest;
import com.scrumpoker.dto.SessionState;
import com.scrumpoker.model.Player;
import com.scrumpoker.model.Session;
import com.scrumpoker.service.SessionService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/sessions")
public class SessionController {

    private final SessionService sessionService;

    public SessionController(SessionService sessionService) {
        this.sessionService = sessionService;
    }

    @PostMapping
    public ResponseEntity<Map<String, Object>> createSession(@RequestBody CreateSessionRequest request) {
        Session session = sessionService.createSession(request.getSessionName(), request.getPlayerName());
        Player scrumMaster = session.getPlayers().values().stream()
                .filter(Player::isScrumMaster)
                .findFirst()
                .orElseThrow();

        Map<String, Object> response = new HashMap<>();
        response.put("sessionId", session.getId());
        response.put("playerId", scrumMaster.getId());
        return ResponseEntity.ok(response);
    }

    @PostMapping("/{sessionId}/join")
    public ResponseEntity<Map<String, Object>> joinSession(
            @PathVariable String sessionId,
            @RequestBody JoinSessionRequest request) {
        try {
            Player player = sessionService.joinSession(sessionId, request.getPlayerName());
            Map<String, Object> response = new HashMap<>();
            response.put("playerId", player.getId());
            response.put("sessionId", sessionId);
            return ResponseEntity.ok(response);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.notFound().build();
        }
    }

    @GetMapping("/{sessionId}")
    public ResponseEntity<SessionState> getSession(@PathVariable String sessionId) {
        SessionState state = sessionService.getSessionState(sessionId);
        if (state == null) {
            return ResponseEntity.notFound().build();
        }
        return ResponseEntity.ok(state);
    }
}
