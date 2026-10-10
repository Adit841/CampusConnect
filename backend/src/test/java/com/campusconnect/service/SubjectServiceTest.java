package com.campusconnect.service;

import static com.campusconnect.service.AcademicTestData.NOW;
import static com.campusconnect.service.AcademicTestData.profile;
import static com.campusconnect.service.AcademicTestData.subject;
import static com.campusconnect.service.AcademicTestData.user;
import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyCollection;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.ArgumentMatchers.isNull;
import static org.mockito.Mockito.lenient;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import java.time.Clock;
import java.time.ZoneOffset;
import java.util.List;
import java.util.Optional;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.access.AccessDeniedException;

import com.campusconnect.dto.SubjectRequest;
import com.campusconnect.dto.SubjectResponse;
import com.campusconnect.entity.AssignmentStatus;
import com.campusconnect.entity.Role;
import com.campusconnect.entity.Subject;
import com.campusconnect.entity.User;
import com.campusconnect.exception.BadRequestException;
import com.campusconnect.exception.ConflictException;
import com.campusconnect.exception.ResourceNotFoundException;
import com.campusconnect.repository.AssignmentRepository;
import com.campusconnect.repository.StudentProfileRepository;
import com.campusconnect.repository.SubjectRepository;
import com.campusconnect.repository.UserRepository;

@ExtendWith(MockitoExtension.class)
class SubjectServiceTest {

    @Mock
    private SubjectRepository subjectRepository;

    @Mock
    private AssignmentRepository assignmentRepository;

    @Mock
    private UserRepository userRepository;

    @Mock
    private StudentProfileRepository studentProfileRepository;

    private SubjectService subjectService;

    private final User teacher = user(20L, "Prof. Smith", "smith@example.com", Role.TEACHER);
    private final User otherTeacher = user(21L, "Prof. Jones", "jones@example.com", Role.TEACHER);
    private final User admin = user(30L, "Admin", "admin@example.com", Role.ADMIN);
    private final User student = user(10L, "Sam", "sam@example.com", Role.STUDENT);

    @BeforeEach
    void setUp() {
        AcademicAccessService access = new AcademicAccessService(userRepository, studentProfileRepository, Clock.fixed(NOW, ZoneOffset.UTC));
        subjectService = new SubjectService(subjectRepository, assignmentRepository, userRepository, access);
        for (User u : List.of(teacher, otherTeacher, admin, student)) {
            lenient().when(userRepository.findByEmail(u.getEmail())).thenReturn(Optional.of(u));
        }
        lenient().when(subjectRepository.saveAndFlush(any(Subject.class))).thenAnswer(inv -> {
            Subject s = inv.getArgument(0);
            if (s.getId() == null) {
                s.setId(99L);
            }
            return s;
        });
    }

    private static SubjectRequest request(String code, Long teacherId) {
        return new SubjectRequest("Advanced Java", code, "Spring Boot", 4, "Computer Engineering", null, 3, "", teacherId);
    }

    @Test
    void getSubjects_student_usesProfileAudienceAndCountsOnlyPublished() {
        when(studentProfileRepository.findByUserId(10L))
                .thenReturn(Optional.of(profile(student, "Computer Engineering", " ", 3, "A")));
        Subject subject = subject(1L, teacher, "Computer Engineering");
        when(subjectRepository.findForStudent("Computer Engineering", null, 3, "A")).thenReturn(List.of(subject));
        when(assignmentRepository.countBySubjectIds(List.of(1L), AssignmentStatus.PUBLISHED))
                .thenReturn(List.<Object[]>of(new Object[] {1L, 2L}));

        List<SubjectResponse> result = subjectService.getSubjects("sam@example.com");

        assertEquals(1, result.size());
        assertEquals(2L, result.get(0).assignmentCount());
        assertEquals("Prof. Smith", result.get(0).teacherName());
        assertFalse(result.get(0).canManage());
    }

    @Test
    void getSubjects_studentWithoutProfile_returnsEmpty() {
        when(studentProfileRepository.findByUserId(10L)).thenReturn(Optional.empty());

        assertTrue(subjectService.getSubjects("sam@example.com").isEmpty());
        verify(subjectRepository, never()).findForStudent(any(), any(), any(), any());
    }

    @Test
    void getSubjects_teacher_returnsOnlyOwnSubjects() {
        when(subjectRepository.findByTeacherIdWithTeacher(20L)).thenReturn(List.of(subject(1L, teacher, "CE")));
        when(assignmentRepository.countBySubjectIds(anyCollection(), isNull())).thenReturn(List.of());

        List<SubjectResponse> result = subjectService.getSubjects("smith@example.com");

        assertEquals(1, result.size());
        assertTrue(result.get(0).canManage());
        verify(subjectRepository, never()).findAllWithTeacher();
    }

    @Test
    void getSubject_studentNotEligible_returnsNotFound() {
        when(subjectRepository.findWithTeacherById(1L)).thenReturn(Optional.of(subject(1L, teacher, "Mechanical")));
        when(studentProfileRepository.findByUserId(10L)).thenReturn(Optional.of(profile(student, "CE", null, 1, null)));

        assertThrows(ResourceNotFoundException.class, () -> subjectService.getSubject(1L, "sam@example.com"));
    }

    @Test
    void getSubject_missing_returnsNotFound() {
        when(subjectRepository.findWithTeacherById(404L)).thenReturn(Optional.empty());
        assertThrows(ResourceNotFoundException.class, () -> subjectService.getSubject(404L, "smith@example.com"));
    }

    @Test
    void createSubject_teacher_becomesOwnerAndCodeIsNormalized() {
        when(subjectRepository.existsByCodeIgnoreCase("CE-AJ301")).thenReturn(false);
        when(assignmentRepository.countBySubjectIds(anyCollection(), isNull())).thenReturn(List.of());

        SubjectResponse created = subjectService.createSubject("smith@example.com", request("  ce-aj301 ", null));

        ArgumentCaptor<Subject> captor = ArgumentCaptor.forClass(Subject.class);
        verify(subjectRepository).saveAndFlush(captor.capture());
        assertEquals(teacher, captor.getValue().getTeacher());
        assertEquals("CE-AJ301", captor.getValue().getCode());
        assertEquals(null, captor.getValue().getSection());
        assertEquals(20L, created.teacherId());
    }

    @Test
    void createSubject_teacherCannotAssignAnotherTeacher() {
        assertThrows(AccessDeniedException.class,
                () -> subjectService.createSubject("smith@example.com", request("X1", 21L)));
    }

    @Test
    void createSubject_student_isForbidden() {
        assertThrows(AccessDeniedException.class,
                () -> subjectService.createSubject("sam@example.com", request("X1", null)));
    }

    @Test
    void createSubject_admin_requiresExistingTeacher() {
        assertThrows(BadRequestException.class,
                () -> subjectService.createSubject("admin@example.com", request("X1", null)));

        when(userRepository.findById(10L)).thenReturn(Optional.of(student));
        assertThrows(BadRequestException.class,
                () -> subjectService.createSubject("admin@example.com", request("X1", 10L)));
    }

    @Test
    void createSubject_admin_assignsSelectedTeacher() {
        when(userRepository.findById(21L)).thenReturn(Optional.of(otherTeacher));
        when(assignmentRepository.countBySubjectIds(anyCollection(), isNull())).thenReturn(List.of());

        SubjectResponse created = subjectService.createSubject("admin@example.com", request("X1", 21L));

        assertEquals(21L, created.teacherId());
        assertTrue(created.canManage());
    }

    @Test
    void createSubject_duplicateCode_conflicts() {
        when(subjectRepository.existsByCodeIgnoreCase("X1")).thenReturn(true);
        assertThrows(ConflictException.class, () -> subjectService.createSubject("smith@example.com", request("x1", null)));
    }

    @Test
    void updateSubject_otherTeacher_isNotFound() {
        when(subjectRepository.findWithTeacherById(1L)).thenReturn(Optional.of(subject(1L, teacher, "CE")));
        assertThrows(ResourceNotFoundException.class,
                () -> subjectService.updateSubject(1L, "jones@example.com", request("X1", null)));
    }

    @Test
    void updateSubject_admin_canReassignTeacher() {
        Subject subject = subject(1L, teacher, "CE");
        when(subjectRepository.findWithTeacherById(1L)).thenReturn(Optional.of(subject));
        when(subjectRepository.existsByCodeIgnoreCaseAndIdNot("X1", 1L)).thenReturn(false);
        when(userRepository.findById(21L)).thenReturn(Optional.of(otherTeacher));
        when(assignmentRepository.countBySubjectIds(anyCollection(), eq(null))).thenReturn(List.of());

        SubjectResponse updated = subjectService.updateSubject(1L, "admin@example.com", request("X1", 21L));

        assertEquals(21L, updated.teacherId());
    }

    @Test
    void getTeacherOptions_onlyForAdmin() {
        assertThrows(AccessDeniedException.class, () -> subjectService.getTeacherOptions("smith@example.com"));

        when(userRepository.findByRoleOrderByNameAsc(Role.TEACHER)).thenReturn(List.of(teacher, otherTeacher));
        assertEquals(2, subjectService.getTeacherOptions("admin@example.com").size());
    }
}
