package com.campusconnect.service;

import com.campusconnect.dto.PresenceEventDto;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;

import java.time.Instant;
import java.util.Collection;
import java.util.HashMap;
import java.util.Map;
import java.util.Set;
import java.util.concurrent.ConcurrentHashMap;

/**
 * Server-side in-memory registry of active authenticated user sessions.
 *
 * <p>Tracks each user's active WebSocket sessions by sessionId. A user is considered
 * ONLINE as long as at least one session remains active. When the last session disconnects,
 * the user transitions to OFFLINE and a real-time event is broadcasted to /topic/presence.</p>
 */
@Service
public class PresenceService {

    private static final Logger log = LoggerFactory.getLogger(PresenceService.class);

    public static final String STATUS_ONLINE = "ONLINE";
    public static final String STATUS_OFFLINE = "OFFLINE";
    public static final String STATUS_UNKNOWN = "UNKNOWN";

    private final SimpMessagingTemplate messagingTemplate;

    // email -> set of sessionIds
    private final Map<String, Set<String>> userEmailSessions = new ConcurrentHashMap<>();
    // userId -> set of sessionIds
    private final Map<Long, Set<String>> userIdSessions = new ConcurrentHashMap<>();

    // sessionId -> email
    private final Map<String, String> sessionEmailMap = new ConcurrentHashMap<>();
    // sessionId -> userId
    private final Map<String, Long> sessionUserIdMap = new ConcurrentHashMap<>();

    public PresenceService(SimpMessagingTemplate messagingTemplate) {
        this.messagingTemplate = messagingTemplate;
    }

    public synchronized void registerSession(String email, Long userId, String sessionId) {
        if (email == null || sessionId == null) return;

        sessionEmailMap.put(sessionId, email);
        if (userId != null) {
            sessionUserIdMap.put(sessionId, userId);
            userIdSessions.computeIfAbsent(userId, k -> ConcurrentHashMap.newKeySet()).add(sessionId);
        }

        Set<String> sessions = userEmailSessions.computeIfAbsent(email, k -> ConcurrentHashMap.newKeySet());
        boolean wasOnline = !sessions.isEmpty();
        sessions.add(sessionId);

        if (!wasOnline) {
            log.info("User {} (id: {}) is now ONLINE (session: {})", email, userId, sessionId);
            broadcastPresence(userId, email, STATUS_ONLINE);
        }
    }

    public synchronized void unregisterSession(String sessionId) {
        if (sessionId == null) return;

        String email = sessionEmailMap.remove(sessionId);
        Long userId = sessionUserIdMap.remove(sessionId);

        if (email != null) {
            Set<String> sessions = userEmailSessions.get(email);
            if (sessions != null) {
                sessions.remove(sessionId);
                if (sessions.isEmpty()) {
                    userEmailSessions.remove(email);
                    if (userId != null) {
                        userIdSessions.remove(userId);
                    }
                    log.info("User {} (id: {}) is now OFFLINE (last session closed)", email, userId);
                    broadcastPresence(userId, email, STATUS_OFFLINE);
                }
            }
        } else if (userId != null) {
            Set<String> uSessions = userIdSessions.get(userId);
            if (uSessions != null) {
                uSessions.remove(sessionId);
                if (uSessions.isEmpty()) {
                    userIdSessions.remove(userId);
                    broadcastPresence(userId, null, STATUS_OFFLINE);
                }
            }
        }
    }

    public boolean isOnline(Long userId) {
        if (userId == null) return false;
        Set<String> sessions = userIdSessions.get(userId);
        return sessions != null && !sessions.isEmpty();
    }

    public boolean isOnline(String email) {
        if (email == null) return false;
        Set<String> sessions = userEmailSessions.get(email);
        return sessions != null && !sessions.isEmpty();
    }

    public String getStatus(Long userId) {
        if (userId == null) return STATUS_UNKNOWN;
        return isOnline(userId) ? STATUS_ONLINE : STATUS_OFFLINE;
    }

    public Map<Long, String> getBatchStatus(Collection<Long> userIds) {
        Map<Long, String> result = new HashMap<>();
        if (userIds == null) return result;
        for (Long id : userIds) {
            if (id != null) {
                result.put(id, getStatus(id));
            }
        }
        return result;
    }

    private void broadcastPresence(Long userId, String email, String status) {
        try {
            PresenceEventDto event = new PresenceEventDto(userId, email, status, Instant.now());
            messagingTemplate.convertAndSend("/topic/presence", event);
        } catch (Exception e) {
            log.warn("Failed to broadcast presence event for user {}: {}", email, e.getMessage());
        }
    }

    public void clear() {
        userEmailSessions.clear();
        userIdSessions.clear();
        sessionEmailMap.clear();
        sessionUserIdMap.clear();
    }
}
