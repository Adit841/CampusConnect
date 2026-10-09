package com.campusconnect.security;

import com.campusconnect.service.ConversationService;
import org.springframework.messaging.Message;
import org.springframework.messaging.MessageChannel;
import org.springframework.messaging.simp.stomp.StompCommand;
import org.springframework.messaging.simp.stomp.StompHeaderAccessor;
import org.springframework.messaging.support.ChannelInterceptor;
import org.springframework.messaging.support.MessageHeaderAccessor;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.stereotype.Component;

import java.security.Principal;

/**
 * Channel interceptor that enforces conversation-level authorization on STOMP SUBSCRIBE commands.
 *
 * <p>Prevents unauthorized users from eavesdropping on conversations they do not belong to
 * via destinations such as {@code /topic/conversations/{conversationId}}.</p>
 */
@Component
public class ChatSubscriptionInterceptor implements ChannelInterceptor {

    public static final String TOPIC_CONVERSATIONS_PREFIX = "/topic/conversations/";

    private final ConversationService conversationService;

    public ChatSubscriptionInterceptor(ConversationService conversationService) {
        this.conversationService = conversationService;
    }

    @Override
    public Message<?> preSend(Message<?> message, MessageChannel channel) {
        StompHeaderAccessor accessor = MessageHeaderAccessor.getAccessor(message, StompHeaderAccessor.class);
        if (accessor != null && StompCommand.SUBSCRIBE.equals(accessor.getCommand())) {
            String destination = accessor.getDestination();
            if (destination != null && destination.startsWith(TOPIC_CONVERSATIONS_PREFIX)) {
                Principal principal = accessor.getUser();
                if (principal == null || principal.getName() == null || principal.getName().isBlank()) {
                    throw new AccessDeniedException("Unauthenticated user cannot subscribe to conversation topics");
                }

                String idPart = destination.substring(TOPIC_CONVERSATIONS_PREFIX.length()).trim();
                try {
                    Long conversationId = Long.parseLong(idPart);
                    // Verifies user is a participant. Throws AccessDeniedException if not.
                    conversationService.requireMembership(conversationId, principal.getName());
                } catch (NumberFormatException ex) {
                    throw new IllegalArgumentException("Invalid conversation topic destination: " + destination);
                }
            }
        }
        return message;
    }
}
