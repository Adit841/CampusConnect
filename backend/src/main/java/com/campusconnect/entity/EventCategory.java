package com.campusconnect.entity;

public enum EventCategory {
    CULTURAL("Cultural Events"),
    TECHNICAL("Technical Events"),
    ACADEMIC("Academic Events"),
    SPORTS("Sports Events");

    private final String displayName;

    EventCategory(String displayName) {
        this.displayName = displayName;
    }

    public String getDisplayName() {
        return displayName;
    }
}
