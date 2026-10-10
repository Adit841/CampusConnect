package com.campusconnect.dto;

import java.math.BigDecimal;
import java.time.Instant;

/**
 * In the student view, {@code marksAwarded}, {@code feedback} and {@code gradedAt} are null and
 * {@code status} reads SUBMITTED until the teacher returns the graded work.
 */
public record SubmissionResponse(
        Long id,
        Long assignmentId,
        String assignmentTitle,
        String subjectName,
        String subjectCode,
        Instant dueAt,
        Integer maxMarks,
        Long studentId,
        String studentName,
        String studentEmail,
        String textResponse,
        FileInfoResponse file,
        String status,
        boolean late,
        int attemptNumber,
        Instant submittedAt,
        BigDecimal marksAwarded,
        String feedback,
        Instant gradedAt,
        Instant returnedAt,
        boolean canEdit
) {}
