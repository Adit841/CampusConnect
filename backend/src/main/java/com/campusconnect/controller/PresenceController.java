package com.campusconnect.controller;

import com.campusconnect.dto.PresenceResponseDto;
import com.campusconnect.service.PresenceService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.security.Principal;
import java.util.List;
import java.util.Map;

/**
 * REST controller for querying online presence of users.
 */
@RestController
@RequestMapping("/api/presence")
public class PresenceController {

    private final PresenceService presenceService;

    public PresenceController(PresenceService presenceService) {
        this.presenceService = presenceService;
    }

    /**
     * GET /api/presence/{userId}
     * Returns the current presence status of the target user.
     */
    @GetMapping("/{userId}")
    public ResponseEntity<PresenceResponseDto> getPresence(
            @PathVariable Long userId,
            Principal principal) {
        if (principal == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }
        String status = presenceService.getStatus(userId);
        return ResponseEntity.ok(new PresenceResponseDto(userId, status));
    }

    /**
     * GET /api/presence/batch?userIds=1,2,3
     * Returns a map of user IDs to presence status strings.
     */
    @GetMapping("/batch")
    public ResponseEntity<Map<Long, String>> getBatchPresence(
            @RequestParam List<Long> userIds,
            Principal principal) {
        if (principal == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }
        Map<Long, String> statuses = presenceService.getBatchStatus(userIds);
        return ResponseEntity.ok(statuses);
    }
}
