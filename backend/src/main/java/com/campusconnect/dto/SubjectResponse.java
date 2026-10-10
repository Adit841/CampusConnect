package com.campusconnect.dto;

import java.time.Instant;

public record SubjectResponse(
        Long id,
        String name,
        String code,
        String description,
        Integer credits,
        String department,
        String course,
        Integer year,
        String section,
        Long teacherId,
        String teacherName,
        String teacherEmail,
        long assignmentCount,
        boolean canManage,
        Instant createdAt,
        Instant updatedAt
) {}
