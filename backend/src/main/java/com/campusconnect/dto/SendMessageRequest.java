package com.campusconnect.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

/**
 * Request body for {@code POST /api/conversations/{conversationId}/messages}
 * and for STOMP {@code /app/chat.send} messages.
 *
 * @param content     The message text. Must not be blank and max 4000 characters.
 * @param clientMsgId Client-generated UUID (v4) for deduplication. Must be provided.
 */
public record SendMessageRequest(
        @NotBlank(message = "Message content must not be blank")
        @Size(max = 4000, message = "Message content must not exceed 4000 characters")
        String content,

        @NotBlank(message = "clientMsgId is required for deduplication")
        @Size(max = 36, message = "clientMsgId must be a UUID (max 36 characters)")
        String clientMsgId
) {}
