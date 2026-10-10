package com.campusconnect.service;

import static com.campusconnect.service.AcademicTestData.NOW;
import static com.campusconnect.service.AcademicTestData.assignment;
import static com.campusconnect.service.AcademicTestData.profile;
import static com.campusconnect.service.AcademicTestData.subject;
import static com.campusconnect.service.AcademicTestData.user;
import static org.junit.jupiter.api.Assertions.assertDoesNotThrow;
import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.mockito.Mockito.when;

import java.time.Clock;
import java.time.ZoneOffset;
import java.util.Optional;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.access.AccessDeniedException;

import com.campusconnect.entity.Assignment;
import com.campusconnect.entity.AssignmentStatus;
import com.campusconnect.entity.Role;
import com.campusconnect.entity.StudentProfile;
import com.campusconnect.entity.Subject;
import com.campusconnect.entity.User;
import com.campusconnect.exception.ResourceNotFoundException;
import com.campusconnect.repository.StudentProfileRepository;
import com.campusconnect.repository.UserRepository;

@ExtendWith(MockitoExtension.class)
class AcademicAccessServiceTest {

    @Mock
    private UserRepository userRepository;

    @Mock
    private StudentProfileRepository studentProfileRepository;

    private AcademicAccessService access;

    private final User teacher = user(20L, "Prof. Smith", "smith@example.com", Role.TEACHER);
    private final User otherTeacher = user(21L, "Prof. Jones", "jones@example.com", Role.TEACHER);
    private final User admin = user(30L, "Admin", "admin@example.com", Role.ADMIN);
    private final User student = user(10L, "Sam", "sam@example.com", Role.STUDENT);

    @BeforeEach
    void setUp() {
        access = new AcademicAccessService(userRepository, studentProfileRepository, Clock.fixed(NOW, ZoneOffset.UTC));
    }

    @Test
    void isEligible_matchesDepartmentCaseInsensitivelyAndIgnoresUnsetFilters() {
        Subject subject = subject(1L, teacher, "Computer Engineering");
        StudentProfile profile = profile(student, "  computer engineering ", "B.Tech", 3, "A");

        assertTrue(AcademicAccessService.isEligible(profile, subject));
    }

    @Test
    void isEligible_requiresYearCourseAndSectionWhenSubjectSetsThem() {
        Subject subject = subject(1L, teacher, "Computer Engineering");
        subject.setYear(3);
        subject.setCourse("B.Tech");
        subject.setSection("A");

        assertTrue(AcademicAccessService.isEligible(profile(student, "Computer Engineering", "b.tech", 3, "a"), subject));
        assertFalse(AcademicAccessService.isEligible(profile(student, "Computer Engineering", "B.Tech", 2, "A"), subject));
        assertFalse(AcademicAccessService.isEligible(profile(student, "Computer Engineering", "M.Tech", 3, "A"), subject));
        assertFalse(AcademicAccessService.isEligible(profile(student, "Computer Engineering", "B.Tech", 3, null), subject));
        assertFalse(AcademicAccessService.isEligible(profile(student, "Mechanical", "B.Tech", 3, "A"), subject));
    }

    @Test
    void isEligible_falseWithoutProfileOrDepartment() {
        Subject subject = subject(1L, teacher, "Computer Engineering");
        assertFalse(AcademicAccessService.isEligible(null, subject));
        assertFalse(AcademicAccessService.isEligible(profile(student, null, null, null, null), subject));
    }

    @Test
    void canViewSubject_appliesRoleRules() {
        Subject subject = subject(1L, teacher, "CE");
        when(studentProfileRepository.findByUserId(10L)).thenReturn(Optional.of(profile(student, "CE", null, 1, null)));

        assertTrue(access.canViewSubject(admin, subject));
        assertTrue(access.canViewSubject(teacher, subject));
        assertFalse(access.canViewSubject(otherTeacher, subject));
        assertTrue(access.canViewSubject(student, subject));
    }

    @Test
    void canViewAssignment_hidesDraftsFromStudents() {
        Subject subject = subject(1L, teacher, "CE");
        Assignment draft = assignment(5L, subject, AssignmentStatus.DRAFT, NOW.plusSeconds(3600));

        assertFalse(access.canViewAssignment(student, draft));
        assertTrue(access.canViewAssignment(teacher, draft));
        assertTrue(access.canViewAssignment(admin, draft));
    }

    @Test
    void requireAssignmentManager_allowsOnlyOwningTeacher() {
        Subject subject = subject(1L, teacher, "CE");
        Assignment published = assignment(5L, subject, AssignmentStatus.PUBLISHED, NOW.plusSeconds(3600));

        assertDoesNotThrow(() -> access.requireAssignmentManager(teacher, published));
        assertThrows(AccessDeniedException.class, () -> access.requireAssignmentManager(admin, published));
        assertThrows(ResourceNotFoundException.class, () -> access.requireAssignmentManager(otherTeacher, published));
    }
}
