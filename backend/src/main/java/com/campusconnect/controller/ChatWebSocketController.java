package com.campusconnect.controller;

import com.campusconnect.dto.MessageDto;
import com.campusconnect.dto.WsIncomingMessage;
import com.campusconnect.entity.Conversation;
import com.campusconnect.entity.User;
import com.campusconnect.service.ConversationService;
import com.campusconnect.service.MessageService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.handler.annotation.Payload;
import org.springframework.messaging.simp.SimpMessageHeaderAccessor;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Controller;

import java.security.Principal;

/**
 * STOMP WebSocket controller for real-time chat messaging.
 *
 * <h3>Message flow</h3>
 * <ol>
 *   <li>Client connects to {@code /ws} and subscribes to
 *       {@code /topic/conversations/{conversationId}}.</li>
 *   <li>Client sends a {@link WsIncomingMessage} to {@code /app/chat.send}.</li>
 *   <li>This handler validates the payload, verifies the sender's membership,
 *       persists the message, and broadcasts the saved {@link MessageDto} to
 *       {@code /topic/conversations/{conversationId}}.</li>
 * </ol>
 *
 * <h3>Security</h3>
 * <p>Sender identity is derived exclusively from {@link Principal#getName()},
 * which is set by Spring Security during the WebSocket handshake.
 * The {@code conversationId} from the payload is validated server-side — a user
 * cannot post to a conversation they do not belong to.</p>
 *
 * <h3>Errors</h3>
 * <p>Validation and authorization errors are sent to the sender's personal error
 * queue {@code /user/queue/errors} rather than crashing the connection.</p>
 */
@Controller
public class ChatWebSocketController {

    private static final Logger log = LoggerFactory.getLogger(ChatWebSocketController.class);

    private final ConversationService conversationService;
    private final MessageService messageService;
    private final SimpMessagingTemplate messagingTemplate;

    public ChatWebSocketController(ConversationService conversationService,
                                   MessageService messageService,
                                   SimpMessagingTemplate messagingTemplate) {
        this.conversationService = conversationService;
        this.messageService = messageService;
        this.messagingTemplate = messagingTemplate;
    }

    /**
     * Handles incoming STOMP messages sent to {@code /app/chat.send}.
     *
     * @param payload           The incoming message payload.
     * @param headerAccessor    STOMP header accessor (used to retrieve the principal).
     */
    @MessageMapping("/chat.send")
    public void handleChatMessage(
            @Payload WsIncomingMessage payload,
            SimpMessageHeaderAccessor headerAccessor) {

        Principal principal = headerAccessor.getUser();

        // ── Guard: unauthenticated connection ────────────────────────────────
        if (principal == null) {
            log.warn("Unauthenticated WebSocket message to /app/chat.send — rejected");
            // In development mode (permit-all), this shouldn't happen.
            // Once Aman's auth module is integrated, this will reject properly.
            return;
        }

        String senderName = principal.getName();

        try {
            // ── Validate payload fields manually (STOMP doesn't run @Valid) ──
            if (payload.content() == null || payload.content().isBlank()) {
                sendError(senderName, "Message content must not be blank");
                return;
            }
            if (payload.clientMsgId() == null || payload.clientMsgId().isBlank()) {
                sendError(senderName, "clientMsgId is required");
                return;
            }
            if (payload.content().length() > 4000) {
                sendError(senderName, "Message content must not exceed 4000 characters");
                return;
            }

            // ── Verify conversation membership ────────────────────────────────
            Conversation conversation = conversationService.requireMembership(
                    payload.conversationId(), senderName);
            User sender = conversationService.requireUser(senderName);

            // ── Persist (with deduplication) ──────────────────────────────────
            com.campusconnect.dto.SendMessageRequest sendRequest =
                    new com.campusconnect.dto.SendMessageRequest(payload.content(), payload.clientMsgId());
            MessageDto saved = messageService.send(conversation, sender, sendRequest);

            // ── Broadcast to all conversation participants ─────────────────────
            messagingTemplate.convertAndSend(
                    "/topic/conversations/" + conversation.getId(), saved);

            for (String email : conversationService.getParticipantEmails(conversation.getId())) {
                messagingTemplate.convertAndSendToUser(email, "/queue/messages", saved);
            }

            log.debug("Message {} broadcast to /topic/conversations/{}", saved.id(), conversation.getId());

        } catch (org.springframework.security.access.AccessDeniedException ex) {
            log.warn("WebSocket authorization failure for user {}: {}", senderName, ex.getMessage());
            sendError(senderName, "You do not have access to this conversation");
        } catch (com.campusconnect.exception.ResourceNotFoundException ex) {
            log.warn("WebSocket entity not found for user {}: {}", senderName, ex.getMessage());
            sendError(senderName, ex.getMessage());
        } catch (Exception ex) {
            log.error("Unexpected error in WebSocket handler for user {}", senderName, ex);
            sendError(senderName, "An unexpected error occurred");
        }
    }

    // ── Helpers ───────────────────────────────────────────────────────────────

    private void sendError(String username, String errorMessage) {
        messagingTemplate.convertAndSendToUser(username, "/queue/errors",
                new WsErrorPayload(errorMessage));
    }

    /**
     * Simple error payload sent to the client's personal error queue.
     */
    public record WsErrorPayload(String error) {}
}
