package com.campusconnect.service;

import java.time.Instant;

import com.campusconnect.dto.AssignmentResponse;
import com.campusconnect.dto.AssignmentStatsResponse;
import com.campusconnect.dto.FileInfoResponse;
import com.campusconnect.dto.SubjectResponse;
import com.campusconnect.dto.SubmissionResponse;
import com.campusconnect.entity.Assignment;
import com.campusconnect.entity.Subject;
import com.campusconnect.entity.Submission;
import com.campusconnect.entity.SubmissionStatus;
import com.campusconnect.entity.User;

/** Entity-to-DTO mapping for the academics module. Callers must have fetched the relations they pass in. */
final class AcademicMapper {

    private AcademicMapper() {
    }

    static SubjectResponse toSubjectResponse(Subject subject, long assignmentCount, boolean canManage) {
        User teacher = subject.getTeacher();
        return new SubjectResponse(
                subject.getId(),
                subject.getName(),
                subject.getCode(),
                subject.getDescription(),
                subject.getCredits(),
                subject.getDepartment(),
                subject.getCourse(),
                subject.getYear(),
                subject.getSection(),
                teacher != null ? teacher.getId() : null,
                teacher != null ? teacher.getName() : null,
                teacher != null ? teacher.getEmail() : null,
                assignmentCount,
                canManage,
                subject.getCreatedAt(),
                subject.getUpdatedAt()
        );
    }

    static AssignmentResponse toAssignmentResponse(
            Assignment assignment,
            Instant now,
            boolean canManage,
            String myStatus,
            SubmissionResponse mySubmission,
            AssignmentStatsResponse stats
    ) {
        Subject subject = assignment.getSubject();
        return new AssignmentResponse(
                assignment.getId(),
                subject.getId(),
                subject.getName(),
                subject.getCode(),
                subject.getTeacher() != null ? subject.getTeacher().getName() : null,
                assignment.getTitle(),
                assignment.getDescription(),
                assignment.getInstructions(),
                assignment.getMaxMarks(),
                assignment.getStatus().name(),
                assignment.getPublishedAt(),
                assignment.getDueAt(),
                assignment.isAllowLateSubmissions(),
                now.isAfter(assignment.getDueAt()),
                FileInfoResponse.from(assignment.getAttachment()),
                canManage,
                assignment.getCreatedAt(),
                assignment.getUpdatedAt(),
                myStatus,
                mySubmission,
                stats
        );
    }

    /** Full view for the subject's teacher and administrators. */
    static SubmissionResponse toStaffSubmissionResponse(Submission submission) {
        return toSubmissionResponse(submission, false, false);
    }

    /** Student view: grading details are hidden until the work is returned. */
    static SubmissionResponse toStudentSubmissionResponse(Submission submission, Instant now) {
        return toSubmissionResponse(submission, true, canStudentEdit(submission, now));
    }

    static boolean canStudentEdit(Submission submission, Instant now) {
        Assignment assignment = submission.getAssignment();
        return submission.getStatus() == SubmissionStatus.SUBMITTED
                && assignment.isPublished()
                && !now.isAfter(assignment.getDueAt());
    }

    /** PENDING, OVERDUE, SUBMITTED or GRADED, as shown to a student. */
    static String studentStatus(Assignment assignment, Submission submission, Instant now) {
        if (submission == null) {
            return now.isAfter(assignment.getDueAt()) ? "OVERDUE" : "PENDING";
        }
        return submission.getStatus() == SubmissionStatus.RETURNED ? "GRADED" : "SUBMITTED";
    }

    private static SubmissionResponse toSubmissionResponse(Submission submission, boolean studentView, boolean canEdit) {
        Assignment assignment = submission.getAssignment();
        Subject subject = assignment.getSubject();
        User student = submission.getStudent();
        boolean released = !studentView || submission.getStatus() == SubmissionStatus.RETURNED;
        String status = studentView && submission.getStatus() == SubmissionStatus.GRADED
                ? SubmissionStatus.SUBMITTED.name()
                : submission.getStatus().name();
        return new SubmissionResponse(
                submission.getId(),
                assignment.getId(),
                assignment.getTitle(),
                subject.getName(),
                subject.getCode(),
                assignment.getDueAt(),
                assignment.getMaxMarks(),
                student.getId(),
                student.getName(),
                student.getEmail(),
                submission.getTextResponse(),
                FileInfoResponse.from(submission.getFile()),
                status,
                submission.isLate(),
                submission.getAttemptNumber(),
                submission.getSubmittedAt(),
                released ? submission.getMarksAwarded() : null,
                released ? submission.getFeedback() : null,
                released ? submission.getGradedAt() : null,
                submission.getReturnedAt(),
                canEdit
        );
    }
}
