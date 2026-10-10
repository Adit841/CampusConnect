package com.campusconnect.dto;

import java.time.LocalDateTime;

import com.campusconnect.entity.EventCategory;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import jakarta.validation.constraints.Size;

public record CreateEventRequest(
    @NotBlank(message = "Title is required")
    @Size(min = 3, max = 255, message = "Title must be between 3 and 255 characters")
    String title,

    Long clubId,

    @NotNull(message = "Category is required")
    EventCategory category,

    @NotBlank(message = "Description is required")
    String description,

    @NotBlank(message = "Venue is required")
    String venue,

    Boolean online,
    String meetingLink,

    @NotNull(message = "Start date time is required")
    LocalDateTime startDateTime,

    @NotNull(message = "End date time is required")
    LocalDateTime endDateTime,

    LocalDateTime registrationDeadline,

    @Positive(message = "Capacity must be a positive integer")
    Integer capacity,

    Boolean featured,
    String imageUrl
) {}
