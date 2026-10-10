package com.campusconnect.config;

import com.campusconnect.entity.User;
import com.campusconnect.repository.UserRepository;
import com.campusconnect.service.PresenceService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.context.event.EventListener;
import org.springframework.messaging.simp.stomp.StompHeaderAccessor;
import org.springframework.stereotype.Component;
import org.springframework.web.socket.messaging.SessionConnectedEvent;
import org.springframework.web.socket.messaging.SessionDisconnectEvent;

import java.security.Principal;

/**
 * Listens for Spring WebSocket connection and disconnection lifecycle events
 * to maintain the active user presence registry.
 */
@Component
public class WebSocketEventListener {

    private static final Logger log = LoggerFactory.getLogger(WebSocketEventListener.class);

    private final PresenceService presenceService;
    private final UserRepository userRepository;

    public WebSocketEventListener(PresenceService presenceService, UserRepository userRepository) {
        this.presenceService = presenceService;
        this.userRepository = userRepository;
    }

    @EventListener
    public void handleSessionConnected(SessionConnectedEvent event) {
        StompHeaderAccessor accessor = StompHeaderAccessor.wrap(event.getMessage());
        String sessionId = accessor.getSessionId();
        Principal principal = accessor.getUser();

        if (principal == null) {
            principal = event.getUser();
        }

        if (principal != null && principal.getName() != null && !principal.getName().isBlank()) {
            String email = principal.getName();
            User user = userRepository.findByEmail(email).orElse(null);
            Long userId = user != null ? user.getId() : null;
            presenceService.registerSession(email, userId, sessionId);
            log.debug("STOMP session connected: id={}, email={}, userId={}", sessionId, email, userId);
        } else {
            log.debug("Unauthenticated STOMP session connected: id={}", sessionId);
        }
    }

    @EventListener
    public void handleSessionDisconnect(SessionDisconnectEvent event) {
        String sessionId = event.getSessionId();
        presenceService.unregisterSession(sessionId);
        log.debug("STOMP session disconnected: id={}", sessionId);
    }
}
