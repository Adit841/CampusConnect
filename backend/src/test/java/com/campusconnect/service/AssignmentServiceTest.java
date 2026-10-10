package com.campusconnect.service;

import static com.campusconnect.service.AcademicTestData.NOW;
import static com.campusconnect.service.AcademicTestData.assignment;
import static com.campusconnect.service.AcademicTestData.profile;
import static com.campusconnect.service.AcademicTestData.subject;
import static com.campusconnect.service.AcademicTestData.submission;
import static com.campusconnect.service.AcademicTestData.user;
import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertNotNull;
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
import java.time.Instant;
import java.time.ZoneOffset;
import java.util.List;
import java.util.Optional;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.mock.web.MockMultipartFile;
import org.springframework.security.access.AccessDeniedException;

import com.campusconnect.dto.AssignmentRequest;
import com.campusconnect.dto.AssignmentResponse;
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
class AssignmentServiceTest {

    @Mock
    private AssignmentRepository assignmentRepository;

    @Mock
    private SubjectRepository subjectRepository;

    @Mock
    private SubmissionRepository submissionRepository;

    @Mock
    private StudentProfileRepository studentProfileRepository;

    @Mock
    private UserRepository userRepository;

    @Mock
    private AcademicFileStorageService storage;

    private AssignmentService assignmentService;

    private final User teacher = user(20L, "Prof. Smith", "smith@example.com", Role.TEACHER);
    private final User otherTeacher = user(21L, "Prof. Jones", "jones@example.com", Role.TEACHER);
    private final User admin = user(30L, "Admin", "admin@example.com", Role.ADMIN);
    private final User student = user(10L, "Sam", "sam@example.com", Role.STUDENT);

    private Subject subject;

    @BeforeEach
    void setUp() {
        AcademicAccessService access = new AcademicAccessService(userRepository, studentProfileRepository, Clock.fixed(NOW, ZoneOffset.UTC));
        assignmentService = new AssignmentService(assignmentRepository, subjectRepository, submissionRepository, studentProfileRepository, access, storage);
        for (User u : List.of(teacher, otherTeacher, admin, student)) {
            lenient().when(userRepository.findByEmail(u.getEmail())).thenReturn(Optional.of(u));
        }
        subject = subject(1L, teacher, "CE");
        lenient().when(assignmentRepository.save(any(Assignment.class))).thenAnswer(inv -> {
            Assignment a = inv.getArgument(0);
            if (a.getId() == null) {
                a.setId(77L);
                a.setCreatedAt(NOW);
                a.setUpdatedAt(NOW);
            }
            return a;
        });
        lenient().when(submissionRepository.summarizeByAssignmentIds(anyCollection(), eq(SubmissionStatus.SUBMITTED))).thenReturn(List.of());
        lenient().when(studentProfileRepository.countEligibleForAudience(any(), any(), any(), any())).thenReturn(0L);
        lenient().when(studentProfileRepository.findByUserId(10L)).thenReturn(Optional.of(profile(student, "CE", null, 2, null)));
    }

    private static AssignmentRequest request(Long subjectId, Instant dueAt, int maxMarks, Boolean publish) {
        return new AssignmentRequest(subjectId, "  Lab 1 ", "Desc", "Steps", maxMarks, dueAt, false, publish);
    }

    @Test
    void createAssignment_teacherOwnSubject_createsDraft() {
        when(subjectRepository.findWithTeacherById(1L)).thenReturn(Optional.of(subject));

        AssignmentResponse created = assignmentService.createAssignment("smith@example.com", request(1L, NOW.plusSeconds(86400), 50, null));

        assertEquals("DRAFT", created.status());
        assertEquals("Lab 1", created.title());
        assertNull(created.publishedAt());
        assertTrue(created.canManage());
        assertNotNull(created.stats());
    }

    @Test
    void createAssignment_withPublishFlag_publishesImmediately() {
        when(subjectRepository.findWithTeacherById(1L)).thenReturn(Optional.of(subject));

        AssignmentResponse created = assignmentService.createAssignment("smith@example.com", request(1L, NOW.plusSeconds(86400), 50, true));

        assertEquals("PUBLISHED", created.status());
        assertEquals(NOW, created.publishedAt());
    }

    @Test
    void createAssignment_forAnotherTeachersSubject_isForbidden() {
        when(subjectRepository.findWithTeacherById(1L)).thenReturn(Optional.of(subject));

        assertThrows(AccessDeniedException.class,
                () -> assignmentService.createAssignment("jones@example.com", request(1L, NOW.plusSeconds(86400), 50, null)));
        verify(assignmentRepository, never()).save(any());
    }

    @Test
    void createAssignment_byStudentOrAdmin_isForbidden() {
        AssignmentRequest req = request(1L, NOW.plusSeconds(86400), 50, null);
        assertThrows(AccessDeniedException.class, () -> assignmentService.createAssignment("sam@example.com", req));
        assertThrows(AccessDeniedException.class, () -> assignmentService.createAssignment("admin@example.com", req));
    }

    @Test
    void createAssignment_pastDeadline_isRejected() {
        when(subjectRepository.findWithTeacherById(1L)).thenReturn(Optional.of(subject));
        assertThrows(BadRequestException.class,
                () -> assignmentService.createAssignment("smith@example.com", request(1L, NOW.minusSeconds(1), 50, null)));
    }

    @Test
    void createAssignment_unknownSubject_isRejected() {
        when(subjectRepository.findWithTeacherById(9L)).thenReturn(Optional.empty());
        assertThrows(BadRequestException.class,
                () -> assignmentService.createAssignment("smith@example.com", request(9L, NOW.plusSeconds(60), 50, null)));
    }

    @Test
    void publishAssignment_publishesDraftOnce() {
        Assignment draft = assignment(5L, subject, AssignmentStatus.DRAFT, NOW.plusSeconds(3600));
        when(assignmentRepository.findWithSubjectById(5L)).thenReturn(Optional.of(draft));

        AssignmentResponse published = assignmentService.publishAssignment(5L, "smith@example.com");
        assertEquals("PUBLISHED", published.status());

        assertThrows(ConflictException.class, () -> assignmentService.publishAssignment(5L, "smith@example.com"));
    }

    @Test
    void publishAssignment_pastDeadline_isRejected() {
        Assignment draft = assignment(5L, subject, AssignmentStatus.DRAFT, NOW.minusSeconds(3600));
        when(assignmentRepository.findWithSubjectById(5L)).thenReturn(Optional.of(draft));
        assertThrows(BadRequestException.class, () -> assignmentService.publishAssignment(5L, "smith@example.com"));
    }

    @Test
    void publishAssignment_byAdmin_isForbidden() {
        Assignment draft = assignment(5L, subject, AssignmentStatus.DRAFT, NOW.plusSeconds(3600));
        when(assignmentRepository.findWithSubjectById(5L)).thenReturn(Optional.of(draft));
        assertThrows(AccessDeniedException.class, () -> assignmentService.publishAssignment(5L, "admin@example.com"));
    }

    @Test
    void updateAssignment_updatesFieldsButKeepsPublicationState() {
        Assignment published = assignment(5L, subject, AssignmentStatus.PUBLISHED, NOW.plusSeconds(3600));
        when(assignmentRepository.findWithSubjectById(5L)).thenReturn(Optional.of(published));

        AssignmentResponse updated = assignmentService.updateAssignment(5L, "smith@example.com",
                new AssignmentRequest(1L, "New title", null, null, 80, NOW.plusSeconds(3600), true, false));

        assertEquals("New title", updated.title());
        assertEquals(80, updated.maxMarks());
        assertEquals("PUBLISHED", updated.status());
        assertTrue(updated.allowLateSubmissions());
    }

    @Test
    void updateAssignment_maxMarksBelowAwardedMarks_isRejected() {
        Assignment published = assignment(5L, subject, AssignmentStatus.PUBLISHED, NOW.plusSeconds(3600));
        when(assignmentRepository.findWithSubjectById(5L)).thenReturn(Optional.of(published));
        when(submissionRepository.findHighestMarksForAssignment(5L)).thenReturn(new BigDecimal("45.50"));

        assertThrows(BadRequestException.class, () -> assignmentService.updateAssignment(5L, "smith@example.com",
                request(1L, NOW.plusSeconds(3600), 40, null)));
    }

    @Test
    void updateAssignment_changedDeadlineInPast_isRejected() {
        Assignment published = assignment(5L, subject, AssignmentStatus.PUBLISHED, NOW.plusSeconds(3600));
        when(assignmentRepository.findWithSubjectById(5L)).thenReturn(Optional.of(published));

        assertThrows(BadRequestException.class, () -> assignmentService.updateAssignment(5L, "smith@example.com",
                request(1L, NOW.minusSeconds(60), 50, null)));
    }

    @Test
    void updateAssignment_movingSubjectWithSubmissions_conflicts() {
        Assignment published = assignment(5L, subject, AssignmentStatus.PUBLISHED, NOW.plusSeconds(3600));
        when(assignmentRepository.findWithSubjectById(5L)).thenReturn(Optional.of(published));
        when(submissionRepository.existsByAssignmentId(5L)).thenReturn(true);

        assertThrows(ConflictException.class, () -> assignmentService.updateAssignment(5L, "smith@example.com",
                request(2L, NOW.plusSeconds(3600), 50, null)));
    }

    @Test
    void updateAssignment_byOtherTeacher_isNotFound() {
        Assignment published = assignment(5L, subject, AssignmentStatus.PUBLISHED, NOW.plusSeconds(3600));
        when(assignmentRepository.findWithSubjectById(5L)).thenReturn(Optional.of(published));

        assertThrows(ResourceNotFoundException.class, () -> assignmentService.updateAssignment(5L, "jones@example.com",
                request(1L, NOW.plusSeconds(3600), 50, null)));
    }

    @Test
    void deleteAssignment_withSubmissions_conflicts() {
        Assignment published = assignment(5L, subject, AssignmentStatus.PUBLISHED, NOW.plusSeconds(3600));
        when(assignmentRepository.findWithSubjectById(5L)).thenReturn(Optional.of(published));
        when(submissionRepository.existsByAssignmentId(5L)).thenReturn(true);

        assertThrows(ConflictException.class, () -> assignmentService.deleteAssignment(5L, "smith@example.com"));
        verify(assignmentRepository, never()).delete(any());
    }

    @Test
    void deleteAssignment_withoutSubmissions_removesAssignmentAndAttachment() {
        Assignment draft = assignment(5L, subject, AssignmentStatus.DRAFT, NOW.plusSeconds(3600));
        StoredFile attachment = new StoredFile("brief.pdf", "key.pdf", "application/pdf", 10L);
        draft.setAttachment(attachment);
        when(assignmentRepository.findWithSubjectById(5L)).thenReturn(Optional.of(draft));

        assignmentService.deleteAssignment(5L, "smith@example.com");

        verify(assignmentRepository).delete(draft);
        verify(storage).deleteAfterCommit(attachment);
    }

    @Test
    void getAssignment_studentCannotSeeDraft() {
        Assignment draft = assignment(5L, subject, AssignmentStatus.DRAFT, NOW.plusSeconds(3600));
        when(assignmentRepository.findWithSubjectById(5L)).thenReturn(Optional.of(draft));

        assertThrows(ResourceNotFoundException.class, () -> assignmentService.getAssignment(5L, "sam@example.com"));
    }

    @Test
    void getAssignment_otherTeacherGetsNotFound_adminCanView() {
        Assignment published = assignment(5L, subject, AssignmentStatus.PUBLISHED, NOW.plusSeconds(3600));
        when(assignmentRepository.findWithSubjectById(5L)).thenReturn(Optional.of(published));

        assertThrows(ResourceNotFoundException.class, () -> assignmentService.getAssignment(5L, "jones@example.com"));

        AssignmentResponse adminView = assignmentService.getAssignment(5L, "admin@example.com");
        assertFalse(adminView.canManage());
        assertNotNull(adminView.stats());
    }

    @Test
    void getAssignments_student_derivesStatusesFromSubmissionsAndDeadlines() {
        when(subjectRepository.findForStudent("CE", null, 2, null)).thenReturn(List.of(subject));
        Assignment pending = assignment(1L, subject, AssignmentStatus.PUBLISHED, NOW.plusSeconds(7200));
        Assignment overdue = assignment(2L, subject, AssignmentStatus.PUBLISHED, NOW.minusSeconds(7200));
        Assignment submitted = assignment(3L, subject, AssignmentStatus.PUBLISHED, NOW.plusSeconds(3600));
        Assignment graded = assignment(4L, subject, AssignmentStatus.PUBLISHED, NOW.minusSeconds(3600));
        when(assignmentRepository.findBySubjectIdsAndStatus(List.of(1L), AssignmentStatus.PUBLISHED))
                .thenReturn(List.of(pending, overdue, submitted, graded));

        Submission gradedButHidden = submission(30L, submitted, student, SubmissionStatus.GRADED);
        gradedButHidden.setMarksAwarded(new BigDecimal("40"));
        gradedButHidden.setFeedback("Hidden until returned");
        Submission returned = submission(40L, graded, student, SubmissionStatus.RETURNED);
        returned.setMarksAwarded(new BigDecimal("45"));
        when(submissionRepository.findByStudentAndAssignmentIds(eq(10L), anyCollection()))
                .thenReturn(List.of(gradedButHidden, returned));

        List<AssignmentResponse> result = assignmentService.getAssignments("sam@example.com", null, null, null, null);

        assertEquals(List.of(2L, 4L, 3L, 1L), result.stream().map(AssignmentResponse::id).toList());
        AssignmentResponse r3 = result.stream().filter(r -> r.id() == 3L).findFirst().orElseThrow();
        assertEquals("SUBMITTED", r3.myStatus());
        assertEquals("SUBMITTED", r3.mySubmission().status());
        assertNull(r3.mySubmission().marksAwarded());
        assertNull(r3.mySubmission().feedback());
        assertNull(r3.stats());

        AssignmentResponse r4 = result.stream().filter(r -> r.id() == 4L).findFirst().orElseThrow();
        assertEquals("GRADED", r4.myStatus());
        assertEquals(new BigDecimal("45"), r4.mySubmission().marksAwarded());

        assertEquals("OVERDUE", result.get(0).myStatus());

        List<AssignmentResponse> onlyPending = assignmentService.getAssignments("sam@example.com", null, "pending", null, null);
        assertEquals(List.of(1L), onlyPending.stream().map(AssignmentResponse::id).toList());
    }

    @Test
    void getAssignments_teacher_includesStatistics() {
        Assignment published = assignment(5L, subject, AssignmentStatus.PUBLISHED, NOW.plusSeconds(3600));
        when(assignmentRepository.findForTeacher(20L)).thenReturn(List.of(published));
        when(studentProfileRepository.countEligibleForAudience("CE", null, null, null)).thenReturn(10L);
        when(submissionRepository.summarizeByAssignmentIds(List.of(5L), SubmissionStatus.SUBMITTED))
                .thenReturn(List.<Object[]>of(new Object[] {5L, 6L, 4L, 1L}));

        AssignmentResponse r = assignmentService.getAssignments("smith@example.com", null, null, null, null).get(0);

        assertEquals(10, r.stats().totalStudents());
        assertEquals(6, r.stats().submitted());
        assertEquals(4, r.stats().graded());
        assertEquals(2, r.stats().awaitingReview());
        assertEquals(4, r.stats().pending());
        assertEquals(1, r.stats().late());
    }

    @Test
    void getAssignments_searchAndSubjectFilter() {
        Assignment a = assignment(5L, subject, AssignmentStatus.PUBLISHED, NOW.plusSeconds(3600));
        a.setTitle("JDBC lab");
        Assignment b = assignment(6L, subject, AssignmentStatus.DRAFT, NOW.plusSeconds(7200));
        b.setTitle("Servlet quiz");
        when(assignmentRepository.findAllWithSubject()).thenReturn(List.of(a, b));

        assertEquals(1, assignmentService.getAssignments("admin@example.com", null, null, "jdbc", null).size());
        assertEquals(0, assignmentService.getAssignments("admin@example.com", 99L, null, null, null).size());
        assertEquals(List.of(6L), assignmentService.getAssignments("admin@example.com", null, "DRAFT", null, null)
                .stream().map(AssignmentResponse::id).toList());
    }

    @Test
    void uploadAttachment_replacesPreviousFile() {
        Assignment published = assignment(5L, subject, AssignmentStatus.PUBLISHED, NOW.plusSeconds(3600));
        StoredFile old = new StoredFile("old.pdf", "old.pdf", "application/pdf", 1L);
        published.setAttachment(old);
        when(assignmentRepository.findWithSubjectById(5L)).thenReturn(Optional.of(published));
        MockMultipartFile file = new MockMultipartFile("file", "new.pdf", "application/pdf", "x".getBytes());
        StoredFile stored = new StoredFile("new.pdf", "new-key.pdf", "application/pdf", 1L);
        when(storage.store(file)).thenReturn(stored);

        AssignmentResponse response = assignmentService.uploadAttachment(5L, "smith@example.com", file);

        assertEquals("new.pdf", response.attachment().fileName());
        verify(storage).deleteAfterCommit(old);
    }

    @Test
    void downloadAttachment_ineligibleStudent_isNotFound() {
        Subject otherDept = subject(2L, teacher, "Mechanical");
        Assignment published = assignment(5L, otherDept, AssignmentStatus.PUBLISHED, NOW.plusSeconds(3600));
        published.setAttachment(new StoredFile("a.pdf", "k.pdf", "application/pdf", 1L));
        when(assignmentRepository.findWithSubjectById(5L)).thenReturn(Optional.of(published));

        assertThrows(ResourceNotFoundException.class, () -> assignmentService.downloadAttachment(5L, "sam@example.com"));
        verify(storage, never()).load(any());
    }
}
