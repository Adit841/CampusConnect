package com.campusconnect.service;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.Comparator;
import java.util.HashMap;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Locale;
import java.util.Map;
import java.util.Objects;
import java.util.function.Function;
import java.util.stream.Collectors;
import java.util.stream.Stream;

import org.springframework.core.io.Resource;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import com.campusconnect.dto.AssignmentRequest;
import com.campusconnect.dto.AssignmentResponse;
import com.campusconnect.dto.AssignmentStatsResponse;
import com.campusconnect.entity.Assignment;
import com.campusconnect.entity.AssignmentStatus;
import com.campusconnect.entity.Role;
import com.campusconnect.entity.StoredFile;
import com.campusconnect.entity.Subject;
import com.campusconnect.entity.Submission;
import com.campusconnect.entity.SubmissionStatus;
import com.campusconnect.entity.User;
import com.campusconnect.exception.BadRequestException;
import com.campusconnect.exception.ConflictException;
import com.campusconnect.exception.ResourceNotFoundException;
import com.campusconnect.repository.AssignmentRepository;
import com.campusconnect.repository.StudentProfileRepository;
import com.campusconnect.repository.SubjectRepository;
import com.campusconnect.repository.SubmissionRepository;

/**
 * Assignment rules:
 * <ul>
 *   <li>Only the teacher of a subject creates, edits, publishes or deletes its assignments.</li>
 *   <li>New assignments are drafts unless {@code publish} is set. Publishing is one-way and requires a future deadline.</li>
 *   <li>A changed deadline must be in the future. Maximum marks cannot drop below marks already awarded.</li>
 *   <li>An assignment that has submissions cannot be moved to another subject or deleted.</li>
 * </ul>
 */
@Service
@Transactional
public class AssignmentService {

    public record FileDownload(Resource resource, StoredFile file) {}

    private final AssignmentRepository assignmentRepository;
    private final SubjectRepository subjectRepository;
    private final SubmissionRepository submissionRepository;
    private final StudentProfileRepository studentProfileRepository;
    private final AcademicAccessService access;
    private final AcademicFileStorageService storage;

    public AssignmentService(
            AssignmentRepository assignmentRepository,
            SubjectRepository subjectRepository,
            SubmissionRepository submissionRepository,
            StudentProfileRepository studentProfileRepository,
            AcademicAccessService access,
            AcademicFileStorageService storage
    ) {
        this.assignmentRepository = assignmentRepository;
        this.subjectRepository = subjectRepository;
        this.submissionRepository = submissionRepository;
        this.studentProfileRepository = studentProfileRepository;
        this.access = access;
        this.storage = storage;
    }

    /**
     * @param status for students PENDING/OVERDUE/SUBMITTED/GRADED; for staff DRAFT/PUBLISHED/OPEN/CLOSED
     * @param sort   "due" (nearest deadline first, default) or "newest" (most recently published first)
     */
    @Transactional(readOnly = true)
    public List<AssignmentResponse> getAssignments(String email, Long subjectId, String status, String search, String sort) {
        User user = access.currentUser(email);
        List<Assignment> assignments = switch (user.getRole()) {
            case ADMIN -> assignmentRepository.findAllWithSubject();
            case TEACHER -> assignmentRepository.findForTeacher(user.getId());
            case STUDENT -> visibleToStudent(user);
        };

        String needle = search == null ? "" : search.trim().toLowerCase(Locale.ROOT);
        assignments = assignments.stream()
                .filter(a -> subjectId == null || Objects.equals(a.getSubject().getId(), subjectId))
                .filter(a -> needle.isEmpty() || a.getTitle().toLowerCase(Locale.ROOT).contains(needle))
                .toList();

        List<AssignmentResponse> responses = toResponses(user, assignments);
        String statusFilter = status == null || status.isBlank() ? null : status.trim().toUpperCase(Locale.ROOT);
        Instant now = access.now();
        return responses.stream()
                .filter(r -> statusFilter == null || matchesStatus(r, statusFilter, now))
                .sorted(comparator(sort))
                .toList();
    }

    @Transactional(readOnly = true)
    public List<AssignmentResponse> getAssignmentsForSubject(Long subjectId, String email) {
        User user = access.currentUser(email);
        Subject subject = subjectRepository.findWithTeacherById(subjectId)
                .orElseThrow(() -> new ResourceNotFoundException("Subject not found"));
        access.requireVisibleSubject(user, subject);
        List<Assignment> assignments = assignmentRepository.findBySubjectIdWithSubject(subjectId).stream()
                .filter(a -> user.getRole() != Role.STUDENT || a.isPublished())
                .toList();
        return toResponses(user, assignments);
    }

    @Transactional(readOnly = true)
    public AssignmentResponse getAssignment(Long id, String email) {
        User user = access.currentUser(email);
        Assignment assignment = findAssignment(id);
        access.requireVisibleAssignment(user, assignment);
        return toResponse(user, assignment);
    }

    public AssignmentResponse createAssignment(String email, AssignmentRequest request) {
        User user = access.currentUser(email);
        access.requireRole(user, Role.TEACHER, "Only teachers can create assignments");
        Subject subject = ownedSubject(user, request.subjectId());
        requireFutureDeadline(request.dueAt());

        Assignment assignment = new Assignment();
        assignment.setSubject(subject);
        assignment.setCreatedBy(user);
        assignment.setStatus(AssignmentStatus.DRAFT);
        apply(assignment, request);
        if (Boolean.TRUE.equals(request.publish())) {
            markPublished(assignment);
        }
        return toResponse(user, assignmentRepository.save(assignment));
    }

    public AssignmentResponse updateAssignment(Long id, String email, AssignmentRequest request) {
        User user = access.currentUser(email);
        Assignment assignment = findAssignment(id);
        access.requireAssignmentManager(user, assignment);

        if (!Objects.equals(assignment.getSubject().getId(), request.subjectId())) {
            if (submissionRepository.existsByAssignmentId(assignment.getId())) {
                throw new ConflictException("An assignment with submissions cannot be moved to another subject");
            }
            assignment.setSubject(ownedSubject(user, request.subjectId()));
        }
        if (!request.dueAt().equals(assignment.getDueAt())) {
            requireFutureDeadline(request.dueAt());
        }
        BigDecimal highest = submissionRepository.findHighestMarksForAssignment(assignment.getId());
        if (highest != null && highest.compareTo(BigDecimal.valueOf(request.maxMarks())) > 0) {
            throw new BadRequestException("Maximum marks cannot be lower than marks already awarded (" + highest.stripTrailingZeros().toPlainString() + ")");
        }

        apply(assignment, request);
        if (Boolean.TRUE.equals(request.publish()) && !assignment.isPublished()) {
            markPublished(assignment);
        }
        return toResponse(user, assignmentRepository.save(assignment));
    }

    public AssignmentResponse publishAssignment(Long id, String email) {
        User user = access.currentUser(email);
        Assignment assignment = findAssignment(id);
        access.requireAssignmentManager(user, assignment);
        if (assignment.isPublished()) {
            throw new ConflictException("Assignment is already published");
        }
        markPublished(assignment);
        return toResponse(user, assignmentRepository.save(assignment));
    }

    public void deleteAssignment(Long id, String email) {
        User user = access.currentUser(email);
        Assignment assignment = findAssignment(id);
        access.requireAssignmentManager(user, assignment);
        if (submissionRepository.existsByAssignmentId(assignment.getId())) {
            throw new ConflictException("An assignment that already has submissions cannot be deleted");
        }
        StoredFile attachment = assignment.getAttachment();
        assignmentRepository.delete(assignment);
        storage.deleteAfterCommit(attachment);
    }

    public AssignmentResponse uploadAttachment(Long id, String email, MultipartFile file) {
        User user = access.currentUser(email);
        Assignment assignment = findAssignment(id);
        access.requireAssignmentManager(user, assignment);

        StoredFile previous = assignment.getAttachment();
        assignment.setAttachment(storage.store(file));
        Assignment saved = assignmentRepository.save(assignment);
        storage.deleteAfterCommit(previous);
        return toResponse(user, saved);
    }

    public AssignmentResponse removeAttachment(Long id, String email) {
        User user = access.currentUser(email);
        Assignment assignment = findAssignment(id);
        access.requireAssignmentManager(user, assignment);

        StoredFile previous = assignment.getAttachment();
        if (previous == null || previous.getStorageKey() == null) {
            throw new ResourceNotFoundException("This assignment has no attachment");
        }
        assignment.setAttachment(null);
        Assignment saved = assignmentRepository.save(assignment);
        storage.deleteAfterCommit(previous);
        return toResponse(user, saved);
    }

    @Transactional(readOnly = true)
    public FileDownload downloadAttachment(Long id, String email) {
        User user = access.currentUser(email);
        Assignment assignment = findAssignment(id);
        access.requireVisibleAssignment(user, assignment);
        StoredFile attachment = assignment.getAttachment();
        if (attachment == null || attachment.getStorageKey() == null) {
            throw new ResourceNotFoundException("This assignment has no attachment");
        }
        return new FileDownload(storage.load(attachment), attachment);
    }

    Assignment findAssignment(Long id) {
        return assignmentRepository.findWithSubjectById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Assignment not found"));
    }

    AssignmentResponse toResponse(User user, Assignment assignment) {
        return toResponses(user, List.of(assignment)).get(0);
    }

    /** Batches submission and roster lookups so a list costs a fixed number of queries. */
    List<AssignmentResponse> toResponses(User user, List<Assignment> assignments) {
        if (assignments.isEmpty()) {
            return List.of();
        }
        Instant now = access.now();
        List<Long> ids = assignments.stream().map(Assignment::getId).toList();

        if (user.getRole() == Role.STUDENT) {
            Map<Long, Submission> mine = submissionRepository.findByStudentAndAssignmentIds(user.getId(), ids).stream()
                    .collect(Collectors.toMap(s -> s.getAssignment().getId(), Function.identity()));
            return assignments.stream().map(a -> {
                Submission submission = mine.get(a.getId());
                return AcademicMapper.toAssignmentResponse(
                        a, now, false,
                        AcademicMapper.studentStatus(a, submission, now),
                        submission == null ? null : AcademicMapper.toStudentSubmissionResponse(submission, now),
                        null);
            }).toList();
        }

        Map<Long, long[]> summaries = new HashMap<>();
        for (Object[] row : submissionRepository.summarizeByAssignmentIds(ids, SubmissionStatus.SUBMITTED)) {
            summaries.put((Long) row[0], new long[] {toLong(row[1]), toLong(row[2]), toLong(row[3])});
        }
        Map<Long, Long> rosterSizes = new LinkedHashMap<>();
        for (Assignment a : assignments) {
            rosterSizes.computeIfAbsent(a.getSubject().getId(), key -> countEligibleStudents(a.getSubject()));
        }
        return assignments.stream().map(a -> {
            long[] summary = summaries.getOrDefault(a.getId(), new long[3]);
            long total = rosterSizes.get(a.getSubject().getId());
            AssignmentStatsResponse stats = new AssignmentStatsResponse(
                    total,
                    summary[0],
                    summary[1],
                    summary[0] - summary[1],
                    Math.max(0, total - summary[0]),
                    summary[2]);
            return AcademicMapper.toAssignmentResponse(a, now, AcademicAccessService.isOwner(user, a.getSubject()), null, null, stats);
        }).toList();
    }

    long countEligibleStudents(Subject subject) {
        return studentProfileRepository.countEligibleForAudience(
                subject.getDepartment(), subject.getCourse(), subject.getYear(), subject.getSection());
    }

    private List<Assignment> visibleToStudent(User user) {
        return access.studentProfile(user)
                .filter(p -> p.getDepartment() != null && !p.getDepartment().isBlank())
                .map(p -> subjectRepository.findForStudent(
                        p.getDepartment(),
                        SubjectService.blankToNull(p.getCourse()),
                        p.getYear(),
                        SubjectService.blankToNull(p.getSection())))
                .filter(subjects -> !subjects.isEmpty())
                .map(subjects -> assignmentRepository.findBySubjectIdsAndStatus(
                        subjects.stream().map(Subject::getId).toList(), AssignmentStatus.PUBLISHED))
                .orElse(List.of());
    }

    private Subject ownedSubject(User user, Long subjectId) {
        Subject subject = subjectRepository.findWithTeacherById(subjectId)
                .orElseThrow(() -> new BadRequestException("Selected subject does not exist"));
        if (!AcademicAccessService.isOwner(user, subject)) {
            throw new AccessDeniedException("You can only manage assignments for subjects you teach");
        }
        return subject;
    }

    private void requireFutureDeadline(Instant dueAt) {
        if (!dueAt.isAfter(access.now())) {
            throw new BadRequestException("The deadline must be in the future");
        }
    }

    private void markPublished(Assignment assignment) {
        requireFutureDeadline(assignment.getDueAt());
        assignment.setStatus(AssignmentStatus.PUBLISHED);
        assignment.setPublishedAt(access.now());
    }

    private static void apply(Assignment assignment, AssignmentRequest request) {
        assignment.setTitle(request.title().trim());
        assignment.setDescription(SubjectService.blankToNull(request.description()));
        assignment.setInstructions(SubjectService.blankToNull(request.instructions()));
        assignment.setMaxMarks(request.maxMarks());
        assignment.setDueAt(request.dueAt());
        assignment.setAllowLateSubmissions(Boolean.TRUE.equals(request.allowLateSubmissions()));
    }

    private static boolean matchesStatus(AssignmentResponse r, String status, Instant now) {
        if (r.myStatus() != null) {
            return r.myStatus().equals(status);
        }
        return switch (status) {
            case "DRAFT", "PUBLISHED" -> r.status().equals(status);
            case "OPEN" -> "PUBLISHED".equals(r.status()) && !now.isAfter(r.dueAt());
            case "CLOSED" -> "PUBLISHED".equals(r.status()) && now.isAfter(r.dueAt());
            default -> false;
        };
    }

    private static Comparator<AssignmentResponse> comparator(String sort) {
        if ("newest".equalsIgnoreCase(sort)) {
            return Comparator.comparing(
                    (AssignmentResponse r) -> Stream.of(r.publishedAt(), r.createdAt()).filter(Objects::nonNull).findFirst().orElse(Instant.EPOCH))
                    .reversed();
        }
        return Comparator.comparing(AssignmentResponse::dueAt);
    }

    private static long toLong(Object value) {
        return value == null ? 0L : ((Number) value).longValue();
    }
}
