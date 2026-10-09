package com.campusconnect.dto;

import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;

/**
 * Request body for {@code POST /api/conversations}.
 *
 * @param targetUserId The ID of the user to start a conversation with.
 *                     Must not be the current user's own ID (validated in service).
 */
public record CreateConversationRequest(
        @NotNull(message = "targetUserId is required")
        @Positive(message = "targetUserId must be a positive number")
        Long targetUserId
) {}
