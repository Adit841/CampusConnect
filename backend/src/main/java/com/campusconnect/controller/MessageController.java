package com.campusconnect.controller;

import com.campusconnect.dto.MessageDto;
import com.campusconnect.dto.SendMessageRequest;
import com.campusconnect.entity.Conversation;
import com.campusconnect.entity.User;
import com.campusconnect.service.ConversationService;
import com.campusconnect.service.MessageService;
import jakarta.validation.Valid;
import org.springframework.data.domain.Page;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.security.Principal;

/**
 * REST controller for messages within a conversation.
 *
 * <p>All endpoints enforce that the authenticated user is a member of the
 * requested conversation before returning data or persisting messages.</p>
 */
@RestController
@RequestMapping("/api/conversations/{conversationId}/messages")
public class MessageController {

    private final ConversationService conversationService;
    private final MessageService messageService;

    public MessageController(ConversationService conversationService, MessageService messageService) {
        this.conversationService = conversationService;
        this.messageService = messageService;
    }

    /**
     * GET /api/conversations/{conversationId}/messages?page={page}
     *
     * <p>Returns a paginated list of messages for the conversation, oldest first.
     * Default page size is {@link MessageService#PAGE_SIZE} (50).</p>
     *
     * @param conversationId The conversation to retrieve messages from.
     * @param page           Zero-based page index (default 0).
     * @param principal      The authenticated user. Returns 401 if absent.
     * @return 200 OK with a {@link Page} of {@link MessageDto}.
     */
    @GetMapping
    public ResponseEntity<Page<MessageDto>> list(
            @PathVariable Long conversationId,
            @RequestParam(defaultValue = "0") int page,
            Principal principal) {
        if (principal == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }
        Conversation conversation = conversationService.requireMembership(conversationId, principal.getName());
        Page<MessageDto> messages = messageService.getHistory(conversation, page);
        return ResponseEntity.ok(messages);
    }

    /**
     * POST /api/conversations/{conversationId}/messages
     *
     * <p>Sends a message in the given conversation. The sender identity is derived
     * from the authenticated principal — the client-supplied sender ID is ignored.</p>
     *
     * <p>This REST endpoint is the persistence path.  The WebSocket path
     * ({@code /app/chat.send}) also persists messages and broadcasts them in real time.
     * Clients should prefer the WebSocket path when connected and fall back to this
     * REST endpoint when the WebSocket is unavailable.</p>
     *
     * @param conversationId The conversation to post to.
     * @param request        The validated send request.
     * @param principal      The authenticated user. Returns 401 if absent.
     * @return 200 OK with the persisted {@link MessageDto}.
     */
    @PostMapping
    public ResponseEntity<MessageDto> send(
            @PathVariable Long conversationId,
            @Valid @RequestBody SendMessageRequest request,
            Principal principal) {
        if (principal == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }
        Conversation conversation = conversationService.requireMembership(conversationId, principal.getName());
        User sender = conversationService.requireUser(principal.getName());
        MessageDto saved = messageService.send(conversation, sender, request);
        return ResponseEntity.ok(saved);
    }
}
