package com.scrumpoker.service;

import com.scrumpoker.dto.PlayerState;
import com.scrumpoker.dto.SessionState;
import com.scrumpoker.model.Player;
import com.scrumpoker.model.Session;
import org.springframework.stereotype.Service;

import java.util.Map;
import java.util.UUID;
import java.util.concurrent.ConcurrentHashMap;
import java.util.stream.Collectors;

@Service
public class SessionService {

    private final Map<String, Session> sessions = new ConcurrentHashMap<>();

    public Session createSession(String sessionName, String playerName) {
        Session session = new Session(sessionName);
        Player scrumMaster = new Player(
                UUID.randomUUID().toString().substring(0, 8),
                playerName,
                true
        );
        session.addPlayer(scrumMaster);
        sessions.put(session.getId(), session);
        return session;
    }

    public Player joinSession(String sessionId, String playerName) {
        Session session = sessions.get(sessionId);
        if (session == null) {
            throw new IllegalArgumentException("Session not found: " + sessionId);
        }
        Player player = new Player(
                UUID.randomUUID().toString().substring(0, 8),
                playerName,
                false
        );
        session.addPlayer(player);
        return player;
    }

    public void removePlayer(String sessionId, String playerId) {
        Session session = sessions.get(sessionId);
        if (session != null) {
            session.removePlayer(playerId);
            if (session.getPlayers().isEmpty()) {
                sessions.remove(sessionId);
            }
        }
    }

    public void vote(String sessionId, String playerId, String vote) {
        Session session = sessions.get(sessionId);
        if (session == null) {
            throw new IllegalArgumentException("Session not found: " + sessionId);
        }
        Player player = session.getPlayers().get(playerId);
        if (player != null) {
            player.setVote(vote);
        }
    }

    public void revealVotes(String sessionId) {
        Session session = sessions.get(sessionId);
        if (session != null) {
            session.setRevealed(true);
        }
    }

    public void resetVotes(String sessionId) {
        Session session = sessions.get(sessionId);
        if (session != null) {
            session.resetVotes();
        }
    }

    public void setTopic(String sessionId, String topic) {
        Session session = sessions.get(sessionId);
        if (session != null) {
            session.setCurrentTopic(topic);
        }
    }

    public Session getSession(String sessionId) {
        return sessions.get(sessionId);
    }

    public SessionState getSessionState(String sessionId) {
        Session session = sessions.get(sessionId);
        if (session == null) {
            return null;
        }

        SessionState state = new SessionState();
        state.setSessionId(session.getId());
        state.setSessionName(session.getName());
        state.setRevealed(session.isRevealed());
        state.setCurrentTopic(session.getCurrentTopic());
        state.setPlayers(
                session.getPlayers().values().stream()
                        .map(p -> {
                            PlayerState ps = new PlayerState();
                            ps.setId(p.getId());
                            ps.setName(p.getName());
                            ps.setScrumMaster(p.isScrumMaster());
                            ps.setHasVoted(p.getVote() != null);
                            // Only show actual vote value when revealed
                            ps.setVote(session.isRevealed() ? p.getVote() : null);
                            return ps;
                        })
                        .collect(Collectors.toList())
        );

        return state;
    }

    public String getScrumMasterId(String sessionId) {
        Session session = sessions.get(sessionId);
        if (session == null) return null;
        return session.getPlayers().values().stream()
                .filter(Player::isScrumMaster)
                .map(Player::getId)
                .findFirst()
                .orElse(null);
    }
}
