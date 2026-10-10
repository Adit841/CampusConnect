package com.campusconnect.dto;

import java.time.Instant;
import java.util.List;

public record CommunityPostDto(
        Long id,
        String title,
        String content,
        String category,
        String categoryLabel,
        boolean isSuggestion,
        String status,
        CommunityAuthorDto author,
        Instant createdAt,
        Instant updatedAt,
        int upvotes,
        List<String> upvotedBy,
        boolean hasUpvoted,
        int commentsCount,
        List<CommunityCommentDto> comments,
        int reportsCount,
        List<String> reportedBy
) {}
