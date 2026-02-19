package com.scrumpoker.model;

public class Player {
    private String id;
    private String name;
    private boolean scrumMaster;
    private String vote;

    public Player() {}

    public Player(String id, String name, boolean scrumMaster) {
        this.id = id;
        this.name = name;
        this.scrumMaster = scrumMaster;
        this.vote = null;
    }

    public String getId() { return id; }
    public void setId(String id) { this.id = id; }

    public String getName() { return name; }
    public void setName(String name) { this.name = name; }

    public boolean isScrumMaster() { return scrumMaster; }
    public void setScrumMaster(boolean scrumMaster) { this.scrumMaster = scrumMaster; }

    public String getVote() { return vote; }
    public void setVote(String vote) { this.vote = vote; }
}
