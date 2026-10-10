package com.campusconnect.dto;

import java.time.LocalDateTime;

import com.campusconnect.entity.EventCategory;
import com.campusconnect.entity.EventStatus;
import com.campusconnect.entity.RegistrationStatus;

public record EventRegistrationDto(
    Long id,
    Long eventId,
    String eventTitle,
    String eventSlug,
    EventCategory eventCategory,
    String eventVenue,
    boolean eventOnline,
    LocalDateTime eventStartDateTime,
    LocalDateTime eventEndDateTime,
    EventStatus eventStatus,
    RegistrationStatus status,
    LocalDateTime registeredAt,
    LocalDateTime cancelledAt
) {}
