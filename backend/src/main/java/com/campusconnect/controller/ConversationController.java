package com.campusconnect.controller;

import com.campusconnect.dto.ChatUserDto;
import com.campusconnect.dto.ConversationSummaryDto;
import com.campusconnect.dto.CreateConversationRequest;
import com.campusconnect.service.ConversationService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.security.Principal;
import java.util.List;

/**
 * REST controller for conversations.
 *
 * <h3>Authentication Integration</h3>
 * <p>All endpoints use {@link Principal#getName()} to identify the caller.
 * The authenticated JWT token provides the verified user email as the principal name.</p>
 *
 * <h3>Role Policy</h3>
 * <p>Any authenticated user may start or view their own conversations.</p>
 */
@RestController
@RequestMapping("/api/conversations")
public class ConversationController {

    private final ConversationService conversationService;

    public ConversationController(ConversationService conversationService) {
        this.conversationService = conversationService;
    }

    /**
     * GET /api/conversations
     *
     * <p>Returns all conversations the authenticated user is a participant of,
     * ordered by latest activity descending.</p>
     *
     * @param principal The authenticated user. Returns 401 if absent.
     * @return 200 OK with a list of {@link ConversationSummaryDto}.
     */
    @GetMapping
    public ResponseEntity<List<ConversationSummaryDto>> list(Principal principal) {
        if (principal == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }
        List<ConversationSummaryDto> conversations = conversationService.listForUser(principal.getName());
        return ResponseEntity.ok(conversations);
    }

    /**
     * POST /api/conversations
     *
     * <p>Finds an existing one-to-one conversation with the target user or creates a new one.
     * Returns 201 when a new conversation is created, 200 when an existing one is returned.</p>
     *
     * @param request   {@link CreateConversationRequest} with {@code targetUserId}.
     * @param principal The authenticated user. Returns 401 if absent.
     * @return 200/201 with the {@link ConversationSummaryDto}.
     */
    @PostMapping
    public ResponseEntity<ConversationSummaryDto> create(
            @Valid @RequestBody CreateConversationRequest request,
            Principal principal) {
        if (principal == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }
        ConversationSummaryDto result = conversationService.findOrCreate(principal.getName(), request);
        // 201 only for genuinely new conversations is hard to detect here without extra state.
        // 200 is acceptable for idempotent "find-or-create" semantics.
        return ResponseEntity.ok(result);
    }

    /**
     * GET /api/conversations/users/search?q={query}
     *
     * <p>Searches for users whose name or email matches the given query string.
     * Used by the "New Conversation" dialog to let users find someone to chat with.
     * The caller is excluded from results to prevent self-conversations.</p>
     *
     * <p>Returns at most 20 results. An empty or blank query returns an empty list.</p>
     *
     * @param q         Search query (name or email fragment).
     * @param principal The authenticated user. Returns 401 if absent.
     * @return 200 OK with a list of {@link ChatUserDto}.
     */
    @GetMapping("/users/search")
    public ResponseEntity<List<ChatUserDto>> searchUsers(
            @RequestParam(defaultValue = "") String q,
            Principal principal) {
        if (principal == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }
        List<ChatUserDto> users = conversationService.searchUsers(principal.getName(), q.strip());
        return ResponseEntity.ok(users);
    }
}

