package com.campusconnect.service;

import java.time.Clock;
import java.time.Instant;
import java.util.Locale;
import java.util.Objects;
import java.util.Optional;

import org.springframework.security.access.AccessDeniedException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.campusconnect.entity.Assignment;
import com.campusconnect.entity.Role;
import com.campusconnect.entity.StudentProfile;
import com.campusconnect.entity.Subject;
import com.campusconnect.entity.User;
import com.campusconnect.exception.ResourceNotFoundException;
import com.campusconnect.repository.StudentProfileRepository;
import com.campusconnect.repository.UserRepository;

/**
 * Central authorization rules for the academics module. Identity always comes from the authenticated
 * principal's email; ownership claims in request bodies are never trusted.
 *
 * <ul>
 *   <li>ADMIN: may view every subject, assignment and submission, and may create/update subjects.
 *       Admins do not edit, publish, delete or grade assignments.</li>
 *   <li>TEACHER: may view and manage only subjects they teach and the assignments in them.</li>
 *   <li>STUDENT: may view subjects whose audience matches their profile, and only published assignments in them.</li>
 * </ul>
 *
 * Resources a user may not see are reported as "not found" so their existence is not revealed.
 */
@Service
@Transactional(readOnly = true)
public class AcademicAccessService {

    private final UserRepository userRepository;
    private final StudentProfileRepository studentProfileRepository;
    private final Clock clock;

    public AcademicAccessService(UserRepository userRepository, StudentProfileRepository studentProfileRepository, Clock clock) {
        this.userRepository = userRepository;
        this.studentProfileRepository = studentProfileRepository;
        this.clock = clock;
    }

    public Instant now() {
        return clock.instant();
    }

    public User currentUser(String email) {
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with email: " + email));
    }

    public Optional<StudentProfile> studentProfile(User user) {
        return studentProfileRepository.findByUserId(user.getId());
    }

    public static boolean isOwner(User user, Subject subject) {
        return user.getRole() == Role.TEACHER
                && subject.getTeacher() != null
                && Objects.equals(subject.getTeacher().getId(), user.getId());
    }

    /** Must stay in sync with {@code SubjectRepository#findForStudent} and {@code StudentProfileRepository#findEligibleForAudience}. */
    public static boolean isEligible(StudentProfile profile, Subject subject) {
        if (profile == null || subject == null) {
            return false;
        }
        return matches(subject.getDepartment(), profile.getDepartment())
                && (subject.getYear() == null || Objects.equals(subject.getYear(), profile.getYear()))
                && (subject.getCourse() == null || matches(subject.getCourse(), profile.getCourse()))
                && (subject.getSection() == null || matches(subject.getSection(), profile.getSection()));
    }

    private static boolean matches(String required, String actual) {
        if (required == null || actual == null) {
            return false;
        }
        return required.trim().toLowerCase(Locale.ROOT).equals(actual.trim().toLowerCase(Locale.ROOT));
    }

    public boolean canViewSubject(User user, Subject subject) {
        return switch (user.getRole()) {
            case ADMIN -> true;
            case TEACHER -> isOwner(user, subject);
            case STUDENT -> studentProfile(user).map(profile -> isEligible(profile, subject)).orElse(false);
        };
    }

    public boolean canViewAssignment(User user, Assignment assignment) {
        if (user.getRole() == Role.STUDENT && !assignment.isPublished()) {
            return false;
        }
        return canViewSubject(user, assignment.getSubject());
    }

    public void requireVisibleSubject(User user, Subject subject) {
        if (!canViewSubject(user, subject)) {
            throw new ResourceNotFoundException("Subject not found");
        }
    }

    public void requireVisibleAssignment(User user, Assignment assignment) {
        if (!canViewAssignment(user, assignment)) {
            throw new ResourceNotFoundException("Assignment not found");
        }
    }

    /** Only the teacher of the assignment's subject may edit, publish, delete or grade it. */
    public void requireAssignmentManager(User user, Assignment assignment) {
        requireVisibleAssignment(user, assignment);
        if (!isOwner(user, assignment.getSubject())) {
            throw new AccessDeniedException("Only the subject's teacher can manage this assignment");
        }
    }

    public void requireRole(User user, Role role, String message) {
        if (user.getRole() != role) {
            throw new AccessDeniedException(message);
        }
    }
}
