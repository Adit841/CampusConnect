package com.campusconnect.dto;

import java.time.Instant;

import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

/**
 * Create/update payload for an assignment. Publication state is never set directly: {@code publish = true}
 * publishes a draft as part of the same request, and published assignments cannot be reverted to drafts.
 */
public record AssignmentRequest(
        @NotNull(message = "Subject is required")
        Long subjectId,

        @NotBlank(message = "Title is required")
        @Size(max = 200, message = "Title must not exceed 200 characters")
        String title,

        @Size(max = 10000, message = "Description must not exceed 10000 characters")
        String description,

        @Size(max = 10000, message = "Instructions must not exceed 10000 characters")
        String instructions,

        @NotNull(message = "Maximum marks are required")
        @Min(value = 1, message = "Maximum marks must be at least 1")
        @Max(value = 1000, message = "Maximum marks must not exceed 1000")
        Integer maxMarks,

        @NotNull(message = "Deadline is required")
        Instant dueAt,

        Boolean allowLateSubmissions,

        Boolean publish
) {}
