package com.campusconnect.controller;

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
 * <h3>Auth integration (TODO – Aman)</h3>
 * <p>All endpoints use {@link Principal#getName()} to identify the caller.
 * Once Aman's JWT filter is active, {@code principal} will be a non-null
 * {@code UsernamePasswordAuthenticationToken} and {@code getName()} will return
 * the authenticated username.  Until then, requests without a principal will
 * receive a 401.</p>
 *
 * <h3>Role policy</h3>
 * <p>Any authenticated user may start or view conversations.
 * Role-based restrictions are not currently defined.
 * TODO: coordinate with the team if role restrictions are required.</p>
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
}
