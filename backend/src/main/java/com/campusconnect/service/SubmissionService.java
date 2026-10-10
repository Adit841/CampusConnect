package com.campusconnect.service;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.HashMap;
import java.util.HashSet;
import java.util.List;
import java.util.Locale;
import java.util.Map;
import java.util.Objects;
import java.util.Set;

import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import com.campusconnect.dto.AssignmentSubmissionsResponse;
import com.campusconnect.dto.GradeSubmissionRequest;
import com.campusconnect.dto.SubmissionResponse;
import com.campusconnect.dto.SubmissionRosterEntry;
import com.campusconnect.entity.Assignment;
import com.campusconnect.entity.Role;
import com.campusconnect.entity.StoredFile;
import com.campusconnect.entity.StudentProfile;
import com.campusconnect.entity.Subject;
import com.campusconnect.entity.Submission;
import com.campusconnect.entity.SubmissionStatus;
import com.campusconnect.entity.User;
import com.campusconnect.exception.BadRequestException;
import com.campusconnect.exception.ConflictException;
import com.campusconnect.exception.ResourceNotFoundException;
import com.campusconnect.repository.StudentProfileRepository;
import com.campusconnect.repository.SubmissionRepository;
import com.campusconnect.service.AssignmentService.FileDownload;

/**
 * Submission rules:
 * <ul>
 *   <li>Students submit only to published assignments of subjects they are eligible for, once per assignment.</li>
 *   <li>After the deadline a first submission is rejected, unless the assignment allows late work, in which
 *       case it is accepted and flagged as late.</li>
 *   <li>A student may revise their submission only before the deadline and only while it is not yet graded.</li>
 *   <li>Only the subject's teacher grades. Marks must be between 0 and the assignment's maximum.
 *       Grades stay hidden from the student until returned; returned work cannot be un-returned.</li>
 * </ul>
 */
@Service
@Transactional
public class SubmissionService {

    static final int MAX_TEXT_LENGTH = 20000;

    private final SubmissionRepository submissionRepository;
    private final StudentProfileRepository studentProfileRepository;
    private final AssignmentService assignmentService;
    private final AcademicAccessService access;
    private final AcademicFileStorageService storage;

    public SubmissionService(
            SubmissionRepository submissionRepository,
            StudentProfileRepository studentProfileRepository,
            AssignmentService assignmentService,
            AcademicAccessService access,
            AcademicFileStorageService storage
    ) {
        this.submissionRepository = submissionRepository;
        this.studentProfileRepository = studentProfileRepository;
        this.assignmentService = assignmentService;
        this.access = access;
        this.storage = storage;
    }

    public SubmissionResponse submit(Long assignmentId, String email, String textResponse, MultipartFile file) {
        User user = access.currentUser(email);
        access.requireRole(user, Role.STUDENT, "Only students can submit assignments");
        Assignment assignment = assignmentService.findAssignment(assignmentId);
        access.requireVisibleAssignment(user, assignment);

        if (submissionRepository.findByAssignmentIdAndStudentId(assignmentId, user.getId()).isPresent()) {
            throw new ConflictException("You have already submitted this assignment. Update your existing submission instead.");
        }

        Instant now = access.now();
        boolean late = now.isAfter(assignment.getDueAt());
        if (late && !assignment.isAllowLateSubmissions()) {
            throw new BadRequestException("The deadline for this assignment has passed");
        }

        String text = normalizeText(textResponse);
        boolean hasFile = file != null && !file.isEmpty();
        if (text == null && !hasFile) {
            throw new BadRequestException("Add a written response or attach a file");
        }

        Submission submission = new Submission();
        submission.setAssignment(assignment);
        submission.setStudent(user);
        submission.setTextResponse(text);
        submission.setLate(late);
        submission.setSubmittedAt(now);
        submission.setStatus(SubmissionStatus.SUBMITTED);
        submission.setAttemptNumber(1);
        if (hasFile) {
            submission.setFile(storage.store(file));
        }

        try {
            submission = submissionRepository.saveAndFlush(submission);
        } catch (DataIntegrityViolationException e) {
            throw new ConflictException("You have already submitted this assignment");
        }
        return AcademicMapper.toStudentSubmissionResponse(submission, now);
    }

    /**
     * Replaces the student's response. {@code textResponse} replaces the previous text (null or blank clears it);
     * a new {@code file} replaces the previous file, and {@code removeFile} drops it without a replacement.
     */
    public SubmissionResponse resubmit(Long submissionId, String email, String textResponse, MultipartFile file, boolean removeFile) {
        User user = access.currentUser(email);
        access.requireRole(user, Role.STUDENT, "Only students can update submissions");
        Submission submission = findSubmission(submissionId);
        if (!Objects.equals(submission.getStudent().getId(), user.getId())) {
            throw new ResourceNotFoundException("Submission not found");
        }
        Assignment assignment = submission.getAssignment();
        access.requireVisibleAssignment(user, assignment);

        Instant now = access.now();
        if (submission.getStatus() != SubmissionStatus.SUBMITTED) {
            throw new ConflictException("This submission has already been graded and can no longer be changed");
        }
        if (now.isAfter(assignment.getDueAt())) {
            throw new BadRequestException("Submissions can no longer be changed after the deadline");
        }

        String text = normalizeText(textResponse);
        boolean hasNewFile = file != null && !file.isEmpty();
        StoredFile previousFile = submission.getFile();
        boolean keepsPreviousFile = !hasNewFile && !removeFile && previousFile != null && previousFile.getStorageKey() != null;
        if (text == null && !hasNewFile && !keepsPreviousFile) {
            throw new BadRequestException("Add a written response or attach a file");
        }

        submission.setTextResponse(text);
        if (hasNewFile) {
            submission.setFile(storage.store(file));
        } else if (removeFile) {
            submission.setFile(null);
        }
        submission.setAttemptNumber(submission.getAttemptNumber() + 1);
        submission.setSubmittedAt(now);
        submission.setLate(false);

        Submission saved = submissionRepository.save(submission);
        if (hasNewFile || removeFile) {
            storage.deleteAfterCommit(previousFile);
        }
        return AcademicMapper.toStudentSubmissionResponse(saved, now);
    }

    @Transactional(readOnly = true)
    public List<SubmissionResponse> getMySubmissions(String email) {
        User user = access.currentUser(email);
        access.requireRole(user, Role.STUDENT, "Only students have personal submissions");
        Instant now = access.now();
        return submissionRepository.findForStudentWithDetails(user.getId()).stream()
                .map(s -> AcademicMapper.toStudentSubmissionResponse(s, now))
                .toList();
    }

    @Transactional(readOnly = true)
    public SubmissionResponse getSubmission(Long submissionId, String email) {
        User user = access.currentUser(email);
        Submission submission = findReadableSubmission(user, submissionId);
        return user.getRole() == Role.STUDENT
                ? AcademicMapper.toStudentSubmissionResponse(submission, access.now())
                : AcademicMapper.toStaffSubmissionResponse(submission);
    }

    @Transactional(readOnly = true)
    public FileDownload downloadFile(Long submissionId, String email) {
        User user = access.currentUser(email);
        Submission submission = findReadableSubmission(user, submissionId);
        StoredFile file = submission.getFile();
        if (file == null || file.getStorageKey() == null) {
            throw new ResourceNotFoundException("This submission has no file");
        }
        return new FileDownload(storage.load(file), file);
    }

    public SubmissionResponse grade(Long submissionId, String email, GradeSubmissionRequest request) {
        User user = access.currentUser(email);
        if (user.getRole() != Role.TEACHER) {
            throw new AccessDeniedException("Only the subject's teacher can grade submissions");
        }
        Submission submission = findSubmission(submissionId);
        Assignment assignment = submission.getAssignment();
        if (!AcademicAccessService.isOwner(user, assignment.getSubject())) {
            throw new ResourceNotFoundException("Submission not found");
        }

        BigDecimal marks = request.marks();
        if (marks.signum() < 0) {
            throw new BadRequestException("Marks cannot be negative");
        }
        if (marks.compareTo(BigDecimal.valueOf(assignment.getMaxMarks())) > 0) {
            throw new BadRequestException("Marks cannot exceed the maximum of " + assignment.getMaxMarks());
        }

        Instant now = access.now();
        submission.setMarksAwarded(marks);
        submission.setFeedback(SubjectService.blankToNull(request.feedback()));
        submission.setGradedAt(now);
        submission.setGradedBy(user);
        if (Boolean.TRUE.equals(request.returnToStudent()) && submission.getStatus() != SubmissionStatus.RETURNED) {
            submission.setStatus(SubmissionStatus.RETURNED);
            submission.setReturnedAt(now);
        } else if (submission.getStatus() == SubmissionStatus.SUBMITTED) {
            submission.setStatus(SubmissionStatus.GRADED);
        }
        return AcademicMapper.toStaffSubmissionResponse(submissionRepository.save(submission));
    }

    /**
     * Every eligible student plus anyone who submitted, so teachers also see who has not submitted yet.
     *
     * @param status optional filter: PENDING (not submitted), SUBMITTED (awaiting review), GRADED (marked or returned), LATE
     */
    @Transactional(readOnly = true)
    public AssignmentSubmissionsResponse getAssignmentSubmissions(Long assignmentId, String email, String status) {
        User user = access.currentUser(email);
        if (user.getRole() == Role.STUDENT) {
            throw new AccessDeniedException("Students cannot view other students' submissions");
        }
        Assignment assignment = assignmentService.findAssignment(assignmentId);
        access.requireVisibleAssignment(user, assignment);

        Subject subject = assignment.getSubject();
        List<StudentProfile> roster = studentProfileRepository.findEligibleForAudience(
                subject.getDepartment(), subject.getCourse(), subject.getYear(), subject.getSection());
        Map<Long, Submission> byStudent = new HashMap<>();
        for (Submission s : submissionRepository.findByAssignmentIdWithStudent(assignmentId)) {
            byStudent.put(s.getStudent().getId(), s);
        }

        List<SubmissionRosterEntry> entries = new ArrayList<>();
        Set<Long> seen = new HashSet<>();
        for (StudentProfile profile : roster) {
            User student = profile.getUser();
            seen.add(student.getId());
            entries.add(entry(student, profile, byStudent.get(student.getId())));
        }
        for (Submission s : byStudent.values()) {
            if (!seen.contains(s.getStudent().getId())) {
                entries.add(entry(s.getStudent(), null, s));
            }
        }

        String filter = status == null || status.isBlank() ? null : status.trim().toUpperCase(Locale.ROOT);
        List<SubmissionRosterEntry> filtered = entries.stream()
                .filter(e -> filter == null || matchesRosterFilter(e, filter))
                .sorted(Comparator.comparing(SubmissionRosterEntry::studentName, String.CASE_INSENSITIVE_ORDER))
                .toList();
        return new AssignmentSubmissionsResponse(assignmentService.toResponse(user, assignment), filtered);
    }

    private static SubmissionRosterEntry entry(User student, StudentProfile profile, Submission submission) {
        return new SubmissionRosterEntry(
                student.getId(),
                student.getName(),
                student.getEmail(),
                profile != null ? profile.getEnrollmentNo() : null,
                profile != null ? profile.getRollNo() : null,
                submission == null ? "NOT_SUBMITTED" : submission.getStatus().name(),
                submission == null ? null : AcademicMapper.toStaffSubmissionResponse(submission));
    }

    private static boolean matchesRosterFilter(SubmissionRosterEntry e, String filter) {
        return switch (filter) {
            case "PENDING" -> e.submission() == null;
            case "SUBMITTED" -> "SUBMITTED".equals(e.status());
            case "GRADED" -> "GRADED".equals(e.status()) || "RETURNED".equals(e.status());
            case "LATE" -> e.submission() != null && e.submission().late();
            default -> true;
        };
    }

    private Submission findSubmission(Long id) {
        return submissionRepository.findWithDetailsById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Submission not found"));
    }

    /** Owners (student), the subject's teacher and administrators may read a submission; others get 404. */
    private Submission findReadableSubmission(User user, Long submissionId) {
        Submission submission = findSubmission(submissionId);
        boolean allowed = switch (user.getRole()) {
            case ADMIN -> true;
            case TEACHER -> AcademicAccessService.isOwner(user, submission.getAssignment().getSubject());
            case STUDENT -> Objects.equals(submission.getStudent().getId(), user.getId());
        };
        if (!allowed) {
            throw new ResourceNotFoundException("Submission not found");
        }
        return submission;
    }

    private static String normalizeText(String text) {
        if (text == null || text.isBlank()) {
            return null;
        }
        String trimmed = text.strip();
        if (trimmed.length() > MAX_TEXT_LENGTH) {
            throw new BadRequestException("Written response must not exceed " + MAX_TEXT_LENGTH + " characters");
        }
        return trimmed;
    }
}
