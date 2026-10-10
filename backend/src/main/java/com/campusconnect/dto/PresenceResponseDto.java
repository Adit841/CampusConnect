package com.campusconnect.dto;

/**
 * REST response for user presence queries.
 */
public record PresenceResponseDto(
        Long userId,
        String status
) {}
