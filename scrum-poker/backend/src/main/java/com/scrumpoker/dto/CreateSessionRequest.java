package com.scrumpoker.dto;

public class CreateSessionRequest {
    private String sessionName;
    private String playerName;

    public String getSessionName() { return sessionName; }
    public void setSessionName(String sessionName) { this.sessionName = sessionName; }

    public String getPlayerName() { return playerName; }
    public void setPlayerName(String playerName) { this.playerName = playerName; }
}
