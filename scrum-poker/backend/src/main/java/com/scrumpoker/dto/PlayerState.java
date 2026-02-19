package com.scrumpoker.dto;

public class PlayerState {
    private String id;
    private String name;
    private boolean scrumMaster;
    private String vote;
    private boolean hasVoted;

    public String getId() { return id; }
    public void setId(String id) { this.id = id; }

    public String getName() { return name; }
    public void setName(String name) { this.name = name; }

    public boolean isScrumMaster() { return scrumMaster; }
    public void setScrumMaster(boolean scrumMaster) { this.scrumMaster = scrumMaster; }

    public String getVote() { return vote; }
    public void setVote(String vote) { this.vote = vote; }

    public boolean isHasVoted() { return hasVoted; }
    public void setHasVoted(boolean hasVoted) { this.hasVoted = hasVoted; }
}
