package com.campusconnect.dto;

import java.time.LocalDateTime;

import com.campusconnect.entity.ClubCategory;
import com.campusconnect.entity.ClubMemberRole;
import com.campusconnect.entity.MembershipStatus;

public record ClubMembershipDto(
    Long id,
    Long clubId,
    String clubName,
    String clubSlug,
    ClubCategory clubCategory,
    String clubLogoUrl,
    ClubMemberRole role,
    MembershipStatus status,
    LocalDateTime joinedAt,
    LocalDateTime createdAt
) {}
