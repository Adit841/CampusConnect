package com.campusconnect.dto;

import java.time.Instant;

import com.fasterxml.jackson.annotation.JsonInclude;

/**
 * Role-dependent view of an assignment. Students receive {@code myStatus} and {@code mySubmission};
 * teachers and administrators receive {@code stats}.
 * {@code myStatus} is one of PENDING, OVERDUE, SUBMITTED or GRADED.
 */
@JsonInclude(JsonInclude.Include.NON_NULL)
public record AssignmentResponse(
        Long id,
        Long subjectId,
        String subjectName,
        String subjectCode,
        String teacherName,
        String title,
        String description,
        String instructions,
        Integer maxMarks,
        String status,
        Instant publishedAt,
        Instant dueAt,
        boolean allowLateSubmissions,
        boolean pastDue,
        FileInfoResponse attachment,
        boolean canManage,
        Instant createdAt,
        Instant updatedAt,
        String myStatus,
        SubmissionResponse mySubmission,
        AssignmentStatsResponse stats
) {}
