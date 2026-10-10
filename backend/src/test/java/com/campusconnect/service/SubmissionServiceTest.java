package com.campusconnect.service;

import static com.campusconnect.service.AcademicTestData.NOW;
import static com.campusconnect.service.AcademicTestData.assignment;
import static com.campusconnect.service.AcademicTestData.profile;
import static com.campusconnect.service.AcademicTestData.subject;
import static com.campusconnect.service.AcademicTestData.submission;
import static com.campusconnect.service.AcademicTestData.user;
import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertNull;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyCollection;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.lenient;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import java.math.BigDecimal;
import java.time.Clock;
import java.time.ZoneOffset;
import java.util.List;
import java.util.Optional;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.mock.web.MockMultipartFile;
import org.springframework.security.access.AccessDeniedException;

import com.campusconnect.dto.AssignmentSubmissionsResponse;
import com.campusconnect.dto.GradeSubmissionRequest;
import com.campusconnect.dto.SubmissionResponse;
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
import com.campusconnect.repository.UserRepository;

@ExtendWith(MockitoExtension.class)
class SubmissionServiceTest {

    @Mock
    private SubmissionRepository submissionRepository;

    @Mock
    private StudentProfileRepository studentProfileRepository;

    @Mock
    private AssignmentRepository assignmentRepository;

    @Mock
    private SubjectRepository subjectRepository;

    @Mock
    private UserRepository userRepository;

    @Mock
    private AcademicFileStorageService storage;

    private SubmissionService submissionService;

    private final User teacher = user(20L, "Prof. Smith", "smith@example.com", Role.TEACHER);
    private final User otherTeacher = user(21L, "Prof. Jones", "jones@example.com", Role.TEACHER);
    private final User admin = user(30L, "Admin", "admin@example.com", Role.ADMIN);
    private final User student = user(10L, "Sam", "sam@example.com", Role.STUDENT);
    private final User otherStudent = user(11L, "Riya", "riya@example.com", Role.STUDENT);

    private Subject subject;

    @BeforeEach
    void setUp() {
        AcademicAccessService access = new AcademicAccessService(userRepository, studentProfileRepository, Clock.fixed(NOW, ZoneOffset.UTC));
        AssignmentService assignmentService = new AssignmentService(
                assignmentRepository, subjectRepository, submissionRepository, studentProfileRepository, access, storage);
        submissionService = new SubmissionService(submissionRepository, studentProfileRepository, assignmentService, access, storage);

        for (User u : List.of(teacher, otherTeacher, admin, student, otherStudent)) {
            lenient().when(userRepository.findByEmail(u.getEmail())).thenReturn(Optional.of(u));
        }
        subject = subject(1L, teacher, "CE");
        lenient().when(studentProfileRepository.findByUserId(10L)).thenReturn(Optional.of(profile(student, "CE", null, null, null)));
        lenient().when(studentProfileRepository.findByUserId(11L)).thenReturn(Optional.of(profile(otherStudent, "CE", null, null, null)));
        lenient().when(submissionRepository.saveAndFlush(any(Submission.class))).thenAnswer(inv -> {
            Submission s = inv.getArgument(0);
            s.setId(500L);
            return s;
        });
        lenient().when(submissionRepository.save(any(Submission.class))).thenAnswer(inv -> inv.getArgument(0));
        lenient().when(submissionRepository.summarizeByAssignmentIds(anyCollection(), eq(SubmissionStatus.SUBMITTED))).thenReturn(List.of());
    }

    private Assignment published(long id, long dueOffsetSeconds) {
        Assignment a = assignment(id, subject, AssignmentStatus.PUBLISHED, NOW.plusSeconds(dueOffsetSeconds));
        lenient().when(assignmentRepository.findWithSubjectById(id)).thenReturn(Optional.of(a));
        return a;
    }

    private Submission stored(Submission s) {
        lenient().when(submissionRepository.findWithDetailsById(s.getId())).thenReturn(Optional.of(s));
        return s;
    }

    // ── submit ────────────────────────────────────────────────────────────────

    @Test
    void submit_beforeDeadline_recordsOnTimeSubmission() {
        published(5L, 3600);
        MockMultipartFile file = new MockMultipartFile("file", "answer.pdf", "application/pdf", "x".getBytes());
        when(storage.store(file)).thenReturn(new StoredFile("answer.pdf", "k.pdf", "application/pdf", 1L));

        SubmissionResponse response = submissionService.submit(5L, "sam@example.com", "  my text  ", file);

        assertEquals("SUBMITTED", response.status());
        assertEquals("my text", response.textResponse());
        assertEquals("answer.pdf", response.file().fileName());
        assertFalse(response.late());
        assertEquals(1, response.attemptNumber());
        assertEquals(NOW, response.submittedAt());
        assertTrue(response.canEdit());
    }

    @Test
    void submit_afterDeadline_isRejectedUnlessLateAllowed() {
        published(5L, -60);
        assertThrows(BadRequestException.class, () -> submissionService.submit(5L, "sam@example.com", "text", null));

        Assignment lateOk = published(6L, -60);
        lateOk.setAllowLateSubmissions(true);
        SubmissionResponse response = submissionService.submit(6L, "sam@example.com", "text", null);
        assertTrue(response.late());
        assertFalse(response.canEdit());
    }

    @Test
    void submit_toDraft_isNotFound() {
        Assignment draft = assignment(5L, subject, AssignmentStatus.DRAFT, NOW.plusSeconds(3600));
        when(assignmentRepository.findWithSubjectById(5L)).thenReturn(Optional.of(draft));

        assertThrows(ResourceNotFoundException.class, () -> submissionService.submit(5L, "sam@example.com", "text", null));
        verify(submissionRepository, never()).saveAndFlush(any());
    }

    @Test
    void submit_forIneligibleSubject_isNotFound() {
        Subject mech = subject(2L, teacher, "Mechanical");
        Assignment a = assignment(5L, mech, AssignmentStatus.PUBLISHED, NOW.plusSeconds(3600));
        when(assignmentRepository.findWithSubjectById(5L)).thenReturn(Optional.of(a));

        assertThrows(ResourceNotFoundException.class, () -> submissionService.submit(5L, "sam@example.com", "text", null));
    }

    @Test
    void submit_twice_conflicts() {
        Assignment a = published(5L, 3600);
        when(submissionRepository.findByAssignmentIdAndStudentId(5L, 10L))
                .thenReturn(Optional.of(submission(1L, a, student, SubmissionStatus.SUBMITTED)));

        assertThrows(ConflictException.class, () -> submissionService.submit(5L, "sam@example.com", "text", null));
    }

    @Test
    void submit_concurrentDuplicate_isReportedAsConflict() {
        published(5L, 3600);
        when(submissionRepository.saveAndFlush(any(Submission.class))).thenThrow(new DataIntegrityViolationException("dup"));

        assertThrows(ConflictException.class, () -> submissionService.submit(5L, "sam@example.com", "text", null));
    }

    @Test
    void submit_withoutTextOrFile_isRejected() {
        published(5L, 3600);
        assertThrows(BadRequestException.class, () -> submissionService.submit(5L, "sam@example.com", "   ", null));
    }

    @Test
    void submit_byTeacher_isForbidden() {
        assertThrows(AccessDeniedException.class, () -> submissionService.submit(5L, "smith@example.com", "text", null));
    }

    // ── resubmit ──────────────────────────────────────────────────────────────

    @Test
    void resubmit_beforeDeadline_updatesAndIncrementsAttempt() {
        Assignment a = published(5L, 3600);
        StoredFile oldFile = new StoredFile("old.pdf", "old.pdf", "application/pdf", 1L);
        Submission s = stored(submission(1L, a, student, SubmissionStatus.SUBMITTED));
        s.setFile(oldFile);
        MockMultipartFile file = new MockMultipartFile("file", "new.pdf", "application/pdf", "x".getBytes());
        when(storage.store(file)).thenReturn(new StoredFile("new.pdf", "new.pdf", "application/pdf", 1L));

        SubmissionResponse response = submissionService.resubmit(1L, "sam@example.com", "revised", file, false);

        assertEquals(2, response.attemptNumber());
        assertEquals("revised", response.textResponse());
        assertEquals("new.pdf", response.file().fileName());
        verify(storage).deleteAfterCommit(oldFile);
    }

    @Test
    void resubmit_keepsExistingFileWhenNoneProvided() {
        Assignment a = published(5L, 3600);
        Submission s = stored(submission(1L, a, student, SubmissionStatus.SUBMITTED));
        s.setFile(new StoredFile("old.pdf", "old.pdf", "application/pdf", 1L));

        SubmissionResponse response = submissionService.resubmit(1L, "sam@example.com", null, null, false);

        assertEquals("old.pdf", response.file().fileName());
        assertNull(response.textResponse());
        verify(storage, never()).deleteAfterCommit(any());
    }

    @Test
    void resubmit_afterDeadline_isRejected() {
        Assignment a = published(5L, -60);
        stored(submission(1L, a, student, SubmissionStatus.SUBMITTED));

        assertThrows(BadRequestException.class, () -> submissionService.resubmit(1L, "sam@example.com", "late", null, false));
    }

    @Test
    void resubmit_afterGrading_conflicts() {
        Assignment a = published(5L, 3600);
        stored(submission(1L, a, student, SubmissionStatus.GRADED));

        assertThrows(ConflictException.class, () -> submissionService.resubmit(1L, "sam@example.com", "new", null, false));
    }

    @Test
    void resubmit_someoneElsesSubmission_isNotFound() {
        Assignment a = published(5L, 3600);
        stored(submission(1L, a, otherStudent, SubmissionStatus.SUBMITTED));

        assertThrows(ResourceNotFoundException.class, () -> submissionService.resubmit(1L, "sam@example.com", "x", null, false));
    }

    // ── read access ───────────────────────────────────────────────────────────

    @Test
    void getSubmission_enforcesOwnershipAndHidesUnreturnedGrades() {
        Assignment a = published(5L, 3600);
        Submission s = stored(submission(1L, a, student, SubmissionStatus.GRADED));
        s.setMarksAwarded(new BigDecimal("40"));
        s.setFeedback("Good");

        SubmissionResponse own = submissionService.getSubmission(1L, "sam@example.com");
        assertEquals("SUBMITTED", own.status());
        assertNull(own.marksAwarded());
        assertNull(own.feedback());

        assertThrows(ResourceNotFoundException.class, () -> submissionService.getSubmission(1L, "riya@example.com"));
        assertThrows(ResourceNotFoundException.class, () -> submissionService.getSubmission(1L, "jones@example.com"));

        SubmissionResponse teacherView = submissionService.getSubmission(1L, "smith@example.com");
        assertEquals("GRADED", teacherView.status());
        assertEquals(new BigDecimal("40"), teacherView.marksAwarded());

        SubmissionResponse adminView = submissionService.getSubmission(1L, "admin@example.com");
        assertEquals("Good", adminView.feedback());
    }

    @Test
    void downloadFile_withoutFile_isNotFound() {
        Assignment a = published(5L, 3600);
        stored(submission(1L, a, student, SubmissionStatus.SUBMITTED));
        assertThrows(ResourceNotFoundException.class, () -> submissionService.downloadFile(1L, "smith@example.com"));
    }

    @Test
    void getMySubmissions_onlyForStudents() {
        assertThrows(AccessDeniedException.class, () -> submissionService.getMySubmissions("smith@example.com"));

        Assignment a = published(5L, 3600);
        when(submissionRepository.findForStudentWithDetails(10L)).thenReturn(List.of(submission(1L, a, student, SubmissionStatus.SUBMITTED)));
        assertEquals(1, submissionService.getMySubmissions("sam@example.com").size());
    }

    // ── grading ───────────────────────────────────────────────────────────────

    @Test
    void grade_validMarks_gradesWithoutReleasing() {
        Assignment a = published(5L, 3600);
        stored(submission(1L, a, student, SubmissionStatus.SUBMITTED));

        SubmissionResponse graded = submissionService.grade(1L, "smith@example.com",
                new GradeSubmissionRequest(new BigDecimal("42.5"), " Well done ", false));

        assertEquals("GRADED", graded.status());
        assertEquals(new BigDecimal("42.5"), graded.marksAwarded());
        assertEquals("Well done", graded.feedback());
        assertEquals(NOW, graded.gradedAt());
        assertNull(graded.returnedAt());
    }

    @Test
    void grade_withReturn_releasesToStudent() {
        Assignment a = published(5L, 3600);
        stored(submission(1L, a, student, SubmissionStatus.SUBMITTED));

        SubmissionResponse graded = submissionService.grade(1L, "smith@example.com",
                new GradeSubmissionRequest(new BigDecimal("50"), null, true));

        assertEquals("RETURNED", graded.status());
        assertEquals(NOW, graded.returnedAt());
    }

    @Test
    void grade_returnedSubmissionStaysReturnedWhenRegraded() {
        Assignment a = published(5L, 3600);
        stored(submission(1L, a, student, SubmissionStatus.RETURNED));

        SubmissionResponse regraded = submissionService.grade(1L, "smith@example.com",
                new GradeSubmissionRequest(new BigDecimal("30"), "Updated", false));

        assertEquals("RETURNED", regraded.status());
        assertEquals(new BigDecimal("30"), regraded.marksAwarded());
    }

    @Test
    void grade_marksOutOfRange_areRejected() {
        Assignment a = published(5L, 3600);
        stored(submission(1L, a, student, SubmissionStatus.SUBMITTED));

        assertThrows(BadRequestException.class, () -> submissionService.grade(1L, "smith@example.com",
                new GradeSubmissionRequest(new BigDecimal("50.01"), null, false)));
        assertThrows(BadRequestException.class, () -> submissionService.grade(1L, "smith@example.com",
                new GradeSubmissionRequest(new BigDecimal("-1"), null, false)));
    }

    @Test
    void grade_byNonOwnerTeacherAdminOrStudent_isDenied() {
        Assignment a = published(5L, 3600);
        stored(submission(1L, a, student, SubmissionStatus.SUBMITTED));
        GradeSubmissionRequest req = new GradeSubmissionRequest(new BigDecimal("10"), null, false);

        assertThrows(ResourceNotFoundException.class, () -> submissionService.grade(1L, "jones@example.com", req));
        assertThrows(AccessDeniedException.class, () -> submissionService.grade(1L, "admin@example.com", req));
        assertThrows(AccessDeniedException.class, () -> submissionService.grade(1L, "sam@example.com", req));
    }

    // ── roster ────────────────────────────────────────────────────────────────

    @Test
    void getAssignmentSubmissions_listsEveryEligibleStudentAndFilters() {
        Assignment a = published(5L, 3600);
        when(studentProfileRepository.findEligibleForAudience("CE", null, null, null))
                .thenReturn(List.of(profile(student, "CE", null, null, null), profile(otherStudent, "CE", null, null, null)));
        Submission late = submission(1L, a, student, SubmissionStatus.SUBMITTED);
        late.setLate(true);
        when(submissionRepository.findByAssignmentIdWithStudent(5L)).thenReturn(List.of(late));
        when(studentProfileRepository.countEligibleForAudience("CE", null, null, null)).thenReturn(2L);

        AssignmentSubmissionsResponse all = submissionService.getAssignmentSubmissions(5L, "smith@example.com", null);
        assertEquals(2, all.entries().size());
        assertEquals("NOT_SUBMITTED", all.entries().stream().filter(e -> e.studentId() == 11L).findFirst().orElseThrow().status());
        assertEquals("ENR-10", all.entries().stream().filter(e -> e.studentId() == 10L).findFirst().orElseThrow().enrollmentNo());

        assertEquals(List.of(11L), submissionService.getAssignmentSubmissions(5L, "smith@example.com", "PENDING")
                .entries().stream().map(e -> e.studentId()).toList());
        assertEquals(List.of(10L), submissionService.getAssignmentSubmissions(5L, "smith@example.com", "late")
                .entries().stream().map(e -> e.studentId()).toList());
        assertTrue(submissionService.getAssignmentSubmissions(5L, "smith@example.com", "GRADED").entries().isEmpty());

        assertEquals(2, submissionService.getAssignmentSubmissions(5L, "admin@example.com", null).entries().size());
    }

    @Test
    void getAssignmentSubmissions_deniedForStudentsAndOtherTeachers() {
        published(5L, 3600);
        assertThrows(AccessDeniedException.class, () -> submissionService.getAssignmentSubmissions(5L, "sam@example.com", null));
        assertThrows(ResourceNotFoundException.class, () -> submissionService.getAssignmentSubmissions(5L, "jones@example.com", null));
    }
}
