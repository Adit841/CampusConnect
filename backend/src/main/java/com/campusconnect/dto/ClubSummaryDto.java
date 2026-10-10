package com.campusconnect.dto;

import com.campusconnect.entity.ClubCategory;

public record ClubSummaryDto(
    Long id,
    String name,
    String slug,
    ClubCategory category,
    String tagline,
    String logoUrl,
    boolean active,
    boolean sampleData,
    int memberCount,
    String currentMemberStatus, // null, PENDING, APPROVED, REJECTED
    String currentMemberRole,   // null, MEMBER, COORDINATOR, LEAD
    String nextEventTitle,
    String nextEventDate
) {}
