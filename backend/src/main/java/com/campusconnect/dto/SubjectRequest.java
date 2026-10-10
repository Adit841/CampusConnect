package com.campusconnect.dto;

import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;

/**
 * Create/update payload for a subject. {@code teacherId} is honoured only for administrators;
 * teachers always own the subjects they create.
 */
public record SubjectRequest(
        @NotBlank(message = "Subject name is required")
        @Size(max = 150, message = "Subject name must not exceed 150 characters")
        String name,

        @NotBlank(message = "Subject code is required")
        @Size(max = 30, message = "Subject code must not exceed 30 characters")
        @Pattern(regexp = "^[A-Za-z0-9][A-Za-z0-9 _-]*$", message = "Subject code may contain only letters, digits, spaces, '-' and '_'")
        String code,

        @Size(max = 5000, message = "Description must not exceed 5000 characters")
        String description,

        @Min(value = 0, message = "Credits cannot be negative")
        @Max(value = 20, message = "Credits must not exceed 20")
        Integer credits,

        @NotBlank(message = "Department is required")
        @Size(max = 255, message = "Department must not exceed 255 characters")
        String department,

        @Size(max = 255, message = "Course must not exceed 255 characters")
        String course,

        @Min(value = 1, message = "Year must be between 1 and 10")
        @Max(value = 10, message = "Year must be between 1 and 10")
        Integer year,

        @Size(max = 50, message = "Section must not exceed 50 characters")
        String section,

        Long teacherId
) {}
