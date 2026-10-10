package com.campusconnect.service;

import java.util.HashMap;
import java.util.List;
import java.util.Locale;
import java.util.Map;
import java.util.Objects;

import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.campusconnect.dto.SubjectRequest;
import com.campusconnect.dto.SubjectResponse;
import com.campusconnect.dto.TeacherOptionResponse;
import com.campusconnect.entity.AssignmentStatus;
import com.campusconnect.entity.Role;
import com.campusconnect.entity.StudentProfile;
import com.campusconnect.entity.Subject;
import com.campusconnect.entity.User;
import com.campusconnect.exception.BadRequestException;
import com.campusconnect.exception.ConflictException;
import com.campusconnect.exception.ResourceNotFoundException;
import com.campusconnect.repository.AssignmentRepository;
import com.campusconnect.repository.SubjectRepository;
import com.campusconnect.repository.UserRepository;

@Service
@Transactional
public class SubjectService {

    private final SubjectRepository subjectRepository;
    private final AssignmentRepository assignmentRepository;
    private final UserRepository userRepository;
    private final AcademicAccessService access;

    public SubjectService(
            SubjectRepository subjectRepository,
            AssignmentRepository assignmentRepository,
            UserRepository userRepository,
            AcademicAccessService access
    ) {
        this.subjectRepository = subjectRepository;
        this.assignmentRepository = assignmentRepository;
        this.userRepository = userRepository;
        this.access = access;
    }

    @Transactional(readOnly = true)
    public List<SubjectResponse> getSubjects(String email) {
        User user = access.currentUser(email);
        List<Subject> subjects = switch (user.getRole()) {
            case ADMIN -> subjectRepository.findAllWithTeacher();
            case TEACHER -> subjectRepository.findByTeacherIdWithTeacher(user.getId());
            case STUDENT -> access.studentProfile(user)
                    .filter(profile -> profile.getDepartment() != null && !profile.getDepartment().isBlank())
                    .map(this::subjectsFor)
                    .orElse(List.of());
        };
        return toResponses(user, subjects);
    }

    @Transactional(readOnly = true)
    public SubjectResponse getSubject(Long id, String email) {
        User user = access.currentUser(email);
        Subject subject = findSubject(id);
        access.requireVisibleSubject(user, subject);
        return toResponses(user, List.of(subject)).get(0);
    }

    public SubjectResponse createSubject(String email, SubjectRequest request) {
        User user = access.currentUser(email);
        User teacher = resolveTeacher(user, request.teacherId(), null);

        String code = normalizeCode(request.code());
        if (subjectRepository.existsByCodeIgnoreCase(code)) {
            throw new ConflictException("A subject with code " + code + " already exists");
        }

        Subject subject = new Subject();
        apply(subject, request, code);
        subject.setTeacher(teacher);
        return toResponses(user, List.of(save(subject))).get(0);
    }

    public SubjectResponse updateSubject(Long id, String email, SubjectRequest request) {
        User user = access.currentUser(email);
        Subject subject = findSubject(id);
        access.requireVisibleSubject(user, subject);
        if (user.getRole() != Role.ADMIN && !AcademicAccessService.isOwner(user, subject)) {
            throw new AccessDeniedException("Only the subject's teacher or an administrator can update this subject");
        }

        String code = normalizeCode(request.code());
        if (subjectRepository.existsByCodeIgnoreCaseAndIdNot(code, subject.getId())) {
            throw new ConflictException("A subject with code " + code + " already exists");
        }

        apply(subject, request, code);
        subject.setTeacher(resolveTeacher(user, request.teacherId(), subject.getTeacher()));
        return toResponses(user, List.of(save(subject))).get(0);
    }

    @Transactional(readOnly = true)
    public List<TeacherOptionResponse> getTeacherOptions(String email) {
        User user = access.currentUser(email);
        access.requireRole(user, Role.ADMIN, "Only administrators can list teachers");
        return userRepository.findByRoleOrderByNameAsc(Role.TEACHER).stream()
                .map(t -> new TeacherOptionResponse(t.getId(), t.getName(), t.getEmail()))
                .toList();
    }

    Subject findSubject(Long id) {
        return subjectRepository.findWithTeacherById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Subject not found"));
    }

    private List<Subject> subjectsFor(StudentProfile profile) {
        return subjectRepository.findForStudent(
                profile.getDepartment(),
                blankToNull(profile.getCourse()),
                profile.getYear(),
                blankToNull(profile.getSection())
        );
    }

    /**
     * Teachers always own what they create and cannot hand a subject to someone else.
     * Administrators must name an existing teacher.
     */
    private User resolveTeacher(User user, Long requestedTeacherId, User currentTeacher) {
        if (user.getRole() == Role.STUDENT) {
            throw new AccessDeniedException("Students cannot manage subjects");
        }
        if (user.getRole() == Role.TEACHER) {
            if (requestedTeacherId != null && !Objects.equals(requestedTeacherId, user.getId())) {
                throw new AccessDeniedException("Teachers cannot assign subjects to other teachers");
            }
            return currentTeacher != null ? currentTeacher : user;
        }
        if (requestedTeacherId == null) {
            if (currentTeacher != null) {
                return currentTeacher;
            }
            throw new BadRequestException("A teacher must be selected for the subject");
        }
        User teacher = userRepository.findById(requestedTeacherId)
                .orElseThrow(() -> new BadRequestException("Selected teacher does not exist"));
        if (teacher.getRole() != Role.TEACHER) {
            throw new BadRequestException("Selected user is not a teacher");
        }
        return teacher;
    }

    private void apply(Subject subject, SubjectRequest request, String code) {
        subject.setName(request.name().trim());
        subject.setCode(code);
        subject.setDescription(blankToNull(request.description()));
        subject.setCredits(request.credits());
        subject.setDepartment(request.department().trim());
        subject.setCourse(blankToNull(request.course()));
        subject.setYear(request.year());
        subject.setSection(blankToNull(request.section()));
    }

    private Subject save(Subject subject) {
        try {
            return subjectRepository.saveAndFlush(subject);
        } catch (DataIntegrityViolationException e) {
            throw new ConflictException("A subject with code " + subject.getCode() + " already exists");
        }
    }

    private List<SubjectResponse> toResponses(User user, List<Subject> subjects) {
        if (subjects.isEmpty()) {
            return List.of();
        }
        AssignmentStatus countedStatus = user.getRole() == Role.STUDENT ? AssignmentStatus.PUBLISHED : null;
        Map<Long, Long> counts = new HashMap<>();
        for (Object[] row : assignmentRepository.countBySubjectIds(subjects.stream().map(Subject::getId).toList(), countedStatus)) {
            counts.put((Long) row[0], (Long) row[1]);
        }
        return subjects.stream()
                .map(s -> AcademicMapper.toSubjectResponse(
                        s,
                        counts.getOrDefault(s.getId(), 0L),
                        user.getRole() == Role.ADMIN || AcademicAccessService.isOwner(user, s)))
                .toList();
    }

    private static String normalizeCode(String code) {
        return code.trim().replaceAll("\\s+", " ").toUpperCase(Locale.ROOT);
    }

    static String blankToNull(String value) {
        return value == null || value.isBlank() ? null : value.trim();
    }
}
