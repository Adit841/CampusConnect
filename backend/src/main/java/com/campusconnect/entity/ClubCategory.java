package com.campusconnect.entity;

public enum ClubCategory {
    TECHNICAL("Technical"),
    CULTURAL("Cultural & Arts"),
    SPORTS("Sports & Athletics"),
    ACADEMIC("Academic"),
    SOCIAL("Social & Community");

    private final String displayName;

    ClubCategory(String displayName) {
        this.displayName = displayName;
    }

    public String getDisplayName() {
        return displayName;
    }
}
