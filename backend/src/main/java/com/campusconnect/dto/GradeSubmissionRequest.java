package com.campusconnect.dto;

import java.math.BigDecimal;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.Digits;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

/** The upper bound for {@code marks} is the assignment's maximum marks, checked in the service. */
public record GradeSubmissionRequest(
        @NotNull(message = "Marks are required")
        @DecimalMin(value = "0.00", message = "Marks cannot be negative")
        @Digits(integer = 4, fraction = 2, message = "Marks may have at most 2 decimal places")
        BigDecimal marks,

        @Size(max = 5000, message = "Feedback must not exceed 5000 characters")
        String feedback,

        Boolean returnToStudent
) {}
