package com.campusconnect.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;

public record UpdateStatusRequest(
        @NotBlank(message = "Status must not be blank")
        @Pattern(regexp = "SUBMITTED|UNDER_REVIEW|RESOLVED", message = "Status must be SUBMITTED, UNDER_REVIEW, or RESOLVED")
        String status
) {}
