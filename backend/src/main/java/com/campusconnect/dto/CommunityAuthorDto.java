package com.campusconnect.dto;

public record CommunityAuthorDto(
        Long id,
        String name,
        String role,
        String department,
        String initials
) {}
