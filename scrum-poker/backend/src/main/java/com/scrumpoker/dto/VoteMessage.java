package com.scrumpoker.dto;

public class VoteMessage {
    private String type;
    private String playerId;
    private String vote;
    private String topic;

    public String getType() { return type; }
    public void setType(String type) { this.type = type; }

    public String getPlayerId() { return playerId; }
    public void setPlayerId(String playerId) { this.playerId = playerId; }

    public String getVote() { return vote; }
    public void setVote(String vote) { this.vote = vote; }

    public String getTopic() { return topic; }
    public void setTopic(String topic) { this.topic = topic; }
}
