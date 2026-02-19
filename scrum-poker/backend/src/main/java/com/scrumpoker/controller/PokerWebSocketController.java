package com.scrumpoker.controller;

import com.scrumpoker.dto.SessionState;
import com.scrumpoker.dto.VoteMessage;
import com.scrumpoker.service.SessionService;
import org.springframework.messaging.handler.annotation.DestinationVariable;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Controller;

@Controller
public class PokerWebSocketController {

    private final SessionService sessionService;
    private final SimpMessagingTemplate messagingTemplate;

    public PokerWebSocketController(SessionService sessionService, SimpMessagingTemplate messagingTemplate) {
        this.sessionService = sessionService;
        this.messagingTemplate = messagingTemplate;
    }

    @MessageMapping("/session/{sessionId}/vote")
    public void vote(@DestinationVariable String sessionId, VoteMessage message) {
        sessionService.vote(sessionId, message.getPlayerId(), message.getVote());
        broadcastState(sessionId);
    }

    @MessageMapping("/session/{sessionId}/reveal")
    public void reveal(@DestinationVariable String sessionId, VoteMessage message) {
        sessionService.revealVotes(sessionId);
        broadcastState(sessionId);
    }

    @MessageMapping("/session/{sessionId}/reset")
    public void reset(@DestinationVariable String sessionId, VoteMessage message) {
        sessionService.resetVotes(sessionId);
        broadcastState(sessionId);
    }

    @MessageMapping("/session/{sessionId}/topic")
    public void setTopic(@DestinationVariable String sessionId, VoteMessage message) {
        sessionService.setTopic(sessionId, message.getTopic());
        broadcastState(sessionId);
    }

    @MessageMapping("/session/{sessionId}/leave")
    public void leave(@DestinationVariable String sessionId, VoteMessage message) {
        sessionService.removePlayer(sessionId, message.getPlayerId());
        broadcastState(sessionId);
    }

    private void broadcastState(String sessionId) {
        SessionState state = sessionService.getSessionState(sessionId);
        if (state != null) {
            messagingTemplate.convertAndSend("/topic/session/" + sessionId, state);
        }
    }
}
