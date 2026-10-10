package com.campusconnect.dto;

import java.time.LocalDateTime;

import com.campusconnect.entity.EventCategory;
import com.campusconnect.entity.EventStatus;

public record CampusEventSummaryDto(
    Long id,
    String title,
    String slug,
    Long clubId,
    String clubName,
    EventCategory category,
    String venue,
    boolean online,
    LocalDateTime startDateTime,
    LocalDateTime endDateTime,
    LocalDateTime registrationDeadline,
    Integer capacity,
    int registeredCount,
    EventStatus status,
    boolean featured,
    String imageUrl,
    boolean sampleData,
    boolean userRegistered,
    String userRegistrationStatus
) {}
