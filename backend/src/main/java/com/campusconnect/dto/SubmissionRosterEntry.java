package com.campusconnect.dto;

/** One student's row in a teacher's submission list. {@code status} is NOT_SUBMITTED, SUBMITTED, GRADED or RETURNED. */
public record SubmissionRosterEntry(
        Long studentId,
        String studentName,
        String studentEmail,
        String enrollmentNo,
        String rollNo,
        String status,
        SubmissionResponse submission
) {}
