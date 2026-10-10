package com.campusconnect.dto;

import java.time.Instant;

/**
 * Real-time event published to /topic/presence when a user connects or disconnects.
 */
public record PresenceEventDto(
        Long userId,
        String email,
        String status,
        Instant timestamp
) {}
