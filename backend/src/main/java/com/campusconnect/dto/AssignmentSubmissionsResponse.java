package com.campusconnect.dto;

import java.util.List;

public record AssignmentSubmissionsResponse(
        AssignmentResponse assignment,
        List<SubmissionRosterEntry> entries
) {}
