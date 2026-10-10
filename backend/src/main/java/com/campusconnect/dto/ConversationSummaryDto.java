package com.campusconnect.dto;

import java.time.Instant;

/**
 * Response DTO representing a user's conversation in the conversation list.
 *
 * <p>Fields are designed so the frontend can render the list item without
 * making additional API calls.</p>
 *
 * @param id                  Conversation ID.
 * @param otherParticipantId  User ID of the other participant.
 * @param otherParticipantUsername Username of the other participant.
 * @param otherParticipantDisplayName Display name of the other participant.
 * @param lastMessageContent  Preview of the most recent message, or {@code null} if no messages.
 * @param lastMessageAt       Timestamp of the most recent message, or conversation creation time if empty.
 * @param unreadCount         Future use — always 0 for now.
 * @param lastMessageSenderId User ID of the sender of the most recent message, or {@code null} if empty.
 */
public record ConversationSummaryDto(
        Long id,
        Long otherParticipantId,
        String otherParticipantUsername,
        String otherParticipantDisplayName,
        String lastMessageContent,
        Instant lastMessageAt,
        int unreadCount,
        Long lastMessageSenderId
) {
    public ConversationSummaryDto(
            Long id,
            Long otherParticipantId,
            String otherParticipantUsername,
            String otherParticipantDisplayName,
            String lastMessageContent,
            Instant lastMessageAt,
            int unreadCount
    ) {
        this(id, otherParticipantId, otherParticipantUsername, otherParticipantDisplayName, lastMessageContent, lastMessageAt, unreadCount, null);
    }
}
