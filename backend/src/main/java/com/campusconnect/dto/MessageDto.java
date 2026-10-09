package com.campusconnect.dto;

import java.time.Instant;

/**
 * Response DTO for a single chat message.
 *
 * @param id            Server-assigned message ID.
 * @param conversationId Conversation this message belongs to.
 * @param senderId      User ID of the sender.
 * @param senderUsername Username of the sender.
 * @param senderDisplayName Display name of the sender.
 * @param content       Message text.
 * @param sentAt        Server-side timestamp when the message was persisted.
 * @param clientMsgId   Client deduplication UUID echoed back so the frontend can
 *                      correlate an optimistic placeholder with the saved message.
 */
public record MessageDto(
        Long id,
        Long conversationId,
        Long senderId,
        String senderUsername,
        String senderDisplayName,
        String content,
        Instant sentAt,
        String clientMsgId
) {}
