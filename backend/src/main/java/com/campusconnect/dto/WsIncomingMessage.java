package com.campusconnect.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import jakarta.validation.constraints.Size;

/**
 * STOMP message payload received at {@code /app/chat.send}.
 *
 * <p>This is the WebSocket equivalent of {@link SendMessageRequest} but also
 * carries the target conversation ID, which the STOMP endpoint reads from the
 * message payload rather than from a URL path variable.</p>
 *
 * @param conversationId  The conversation to post the message to.
 * @param content         Message text.
 * @param clientMsgId     Client deduplication UUID.
 */
public record WsIncomingMessage(
        @NotNull(message = "conversationId is required")
        @Positive(message = "conversationId must be positive")
        Long conversationId,

        @NotBlank(message = "Message content must not be blank")
        @Size(max = 4000, message = "Message content must not exceed 4000 characters")
        String content,

        @NotBlank(message = "clientMsgId is required for deduplication")
        @Size(max = 36, message = "clientMsgId must be a UUID (max 36 characters)")
        String clientMsgId
) {}
