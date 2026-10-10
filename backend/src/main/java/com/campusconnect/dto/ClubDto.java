package com.campusconnect.dto;

import java.time.LocalDateTime;
import java.util.List;

import com.campusconnect.entity.ClubCategory;

public record ClubDto(
    Long id,
    String name,
    String slug,
    ClubCategory category,
    String tagline,
    String description,
    String activities,
    String logoUrl,
    String bannerUrl,
    String contactEmail,
    Long leadCoordinatorId,
    String leadCoordinatorName,
    boolean active,
    boolean sampleData,
    int memberCount,
    String currentMemberStatus,
    String currentMemberRole,
    LocalDateTime createdAt,
    List<CampusEventSummaryDto> upcomingEvents
) {}
