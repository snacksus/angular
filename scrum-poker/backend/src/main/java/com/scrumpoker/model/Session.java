package com.scrumpoker.model;

import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;
import java.util.UUID;

public class Session {
    private String id;
    private String name;
    private Map<String, Player> players;
    private boolean revealed;
    private String currentTopic;

    public Session() {
        this.id = UUID.randomUUID().toString().substring(0, 8);
        this.players = new ConcurrentHashMap<>();
        this.revealed = false;
    }

    public Session(String name) {
        this();
        this.name = name;
    }

    public String getId() { return id; }
    public void setId(String id) { this.id = id; }

    public String getName() { return name; }
    public void setName(String name) { this.name = name; }

    public Map<String, Player> getPlayers() { return players; }
    public void setPlayers(Map<String, Player> players) { this.players = players; }

    public boolean isRevealed() { return revealed; }
    public void setRevealed(boolean revealed) { this.revealed = revealed; }

    public String getCurrentTopic() { return currentTopic; }
    public void setCurrentTopic(String currentTopic) { this.currentTopic = currentTopic; }

    public void addPlayer(Player player) {
        this.players.put(player.getId(), player);
    }

    public void removePlayer(String playerId) {
        this.players.remove(playerId);
    }

    public void resetVotes() {
        this.revealed = false;
        this.players.values().forEach(p -> p.setVote(null));
    }
}
