package com.campusconnect.dto;

import java.time.Instant;

public record CommunityCommentDto(
        Long id,
        CommunityAuthorDto author,
        String text,
        Instant createdAt
) {}
