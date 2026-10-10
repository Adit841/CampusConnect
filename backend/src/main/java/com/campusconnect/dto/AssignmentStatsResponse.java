package com.campusconnect.dto;

/**
 * {@code graded} counts submissions that have been marked (GRADED or RETURNED);
 * {@code pending} counts eligible students who have not submitted.
 */
public record AssignmentStatsResponse(
        long totalStudents,
        long submitted,
        long graded,
        long awaitingReview,
        long pending,
        long late
) {}
