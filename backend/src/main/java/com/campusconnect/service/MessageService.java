package com.campusconnect.service;

import com.campusconnect.dto.MessageDto;
import com.campusconnect.dto.SendMessageRequest;
import com.campusconnect.entity.Conversation;
import com.campusconnect.entity.Message;
import com.campusconnect.entity.User;
import com.campusconnect.repository.MessageRepository;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

/**
 * Business logic for messages.
 *
 * <h3>Deduplication</h3>
 * <p>Before persisting a new message, the service checks whether a message with the
 * same {@code clientMsgId} already exists.  If it does, the existing saved message
 * is returned without creating a duplicate.  This handles WebSocket reconnect retries
 * and REST double-submits gracefully.</p>
 */
@Service
@Transactional
public class MessageService {

    /** Maximum messages returned per page when fetching history. */
    public static final int PAGE_SIZE = 50;

    private final MessageRepository messageRepo;
    private final ConversationService conversationService;

    public MessageService(MessageRepository messageRepo, ConversationService conversationService) {
        this.messageRepo = messageRepo;
        this.conversationService = conversationService;
    }

    // ── Public API ────────────────────────────────────────────────────────────

    /**
     * Retrieves a page of message history for the given conversation.
     * The caller must already have verified membership via {@link ConversationService}.
     *
     * @param conversation The verified conversation.
     * @param page         Zero-based page index.
     * @return A page of {@link MessageDto} objects, oldest first.
     */
    @Transactional(readOnly = true)
    public Page<MessageDto> getHistory(Conversation conversation, int page) {
        return messageRepo.findByConversationId(
                        conversation.getId(),
                        PageRequest.of(page, PAGE_SIZE, Sort.by("sentAt").ascending()))
                .map(this::toDto);
    }

    /**
     * Sends a message in the given conversation on behalf of the authenticated user.
     *
     * <p>If a message with {@code request.clientMsgId()} already exists in the database,
     * it is returned as-is (deduplication).  Otherwise a new message is persisted.</p>
     *
     * @param conversation   The verified conversation (membership already checked).
     * @param sender         The authenticated user sending the message.
     * @param request        The validated send request.
     * @return The persisted (or pre-existing) message as a DTO.
     */
    public MessageDto send(Conversation conversation, User sender, SendMessageRequest request) {
        // Deduplication check
        return messageRepo.findByClientMsgId(request.clientMsgId())
                .map(this::toDto)
                .orElseGet(() -> {
                    Message message = new Message(
                            conversation,
                            sender,
                            request.content().strip(),
                            request.clientMsgId()
                    );
                    return toDto(messageRepo.save(message));
                });
    }

    // ── Mapping helpers ───────────────────────────────────────────────────────

    public MessageDto toDto(Message message) {
        return new MessageDto(
                message.getId(),
                message.getConversation().getId(),
                message.getSender().getId(),
                message.getSender().getEmail(),
                message.getSender().getName(),
                message.getContent(),
                message.getSentAt(),
                message.getClientMsgId()
        );
    }
}
