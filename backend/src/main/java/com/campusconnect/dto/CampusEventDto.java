package com.campusconnect.dto;

import java.time.LocalDateTime;

import com.campusconnect.entity.EventCategory;
import com.campusconnect.entity.EventStatus;

public record CampusEventDto(
    Long id,
    String title,
    String slug,
    Long clubId,
    String clubName,
    String clubSlug,
    EventCategory category,
    String description,
    String venue,
    boolean online,
    String meetingLink,
    LocalDateTime startDateTime,
    LocalDateTime endDateTime,
    LocalDateTime registrationDeadline,
    Integer capacity,
    int registeredCount,
    Integer remainingCapacity,
    EventStatus status,
    boolean featured,
    String imageUrl,
    boolean sampleData,
    Long organizerId,
    String organizerName,
    boolean userRegistered,
    String userRegistrationStatus,
    LocalDateTime userRegisteredAt,
    LocalDateTime createdAt
) {}
