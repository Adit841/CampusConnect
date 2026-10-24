package com.campusconnect.config;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.ApplicationRunner;
import org.springframework.core.annotation.Order;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

import com.campusconnect.entity.Role;
import com.campusconnect.entity.StudentProfile;
import com.campusconnect.entity.TeacherProfile;
import com.campusconnect.entity.User;
import com.campusconnect.repository.StudentProfileRepository;
import com.campusconnect.repository.TeacherProfileRepository;
import com.campusconnect.repository.UserRepository;
import com.campusconnect.service.AuthService;

/**
 * Creates the public demo student and teacher accounts on startup if they are missing.
 * Failures here are logged and swallowed so a seed problem cannot take the app down.
 */
@Component
@Order(20)
public class DemoAccountsSeeder implements ApplicationRunner {

    private static final Logger log = LoggerFactory.getLogger(DemoAccountsSeeder.class);

    public static final String STUDENT_EMAIL = "student.demo@campusconnect.edu";
    public static final String TEACHER_EMAIL = "teacher.demo@campusconnect.edu";
    public static final String DEMO_PASSWORD = "Demo@1234";
    public static final String STUDENT_ENROLLMENT = "DEMO-STU-001";
    public static final String TEACHER_EMPLOYEE_ID = "DEMO-TCH-001";

    private final UserRepository userRepository;
    private final StudentProfileRepository studentProfileRepository;
    private final TeacherProfileRepository teacherProfileRepository;
    private final PasswordEncoder passwordEncoder;

    public DemoAccountsSeeder(
            UserRepository userRepository,
            StudentProfileRepository studentProfileRepository,
            TeacherProfileRepository teacherProfileRepository,
            PasswordEncoder passwordEncoder
    ) {
        this.userRepository = userRepository;
        this.studentProfileRepository = studentProfileRepository;
        this.teacherProfileRepository = teacherProfileRepository;
        this.passwordEncoder = passwordEncoder;
    }

    @Override
    public void run(ApplicationArguments args) {
        seedStudent();
        seedTeacher();
    }

    private void seedStudent() {
        try {
            if (userRepository.existsByEmail(STUDENT_EMAIL)) {
                log.info("Demo student '{}' already exists", STUDENT_EMAIL);
                return;
            }
            if (studentProfileRepository.existsByEnrollmentNo(STUDENT_ENROLLMENT)) {
                log.warn("Skipped demo student: enrollment {} is already in use", STUDENT_ENROLLMENT);
                return;
            }

            User student = new User("Demo Student", STUDENT_EMAIL, passwordEncoder.encode(DEMO_PASSWORD), Role.STUDENT);
            student.setCollege(AuthService.COLLEGE);
            student.setBio("Public demo student account for reviewers.");
            User saved = userRepository.save(student);

            studentProfileRepository.save(new StudentProfile(
                    saved,
                    STUDENT_ENROLLMENT,
                    "CSE-3A-01",
                    "B.Tech",
                    "Computer Science and Engineering",
                    3,
                    "A"
            ));
            log.info("Created demo student '{}'", STUDENT_EMAIL);
        } catch (Exception ex) {
            log.warn("Skipped demo student '{}': {}", STUDENT_EMAIL, ex.getMessage());
        }
    }

    private void seedTeacher() {
        try {
            if (userRepository.existsByEmail(TEACHER_EMAIL)) {
                log.info("Demo teacher '{}' already exists", TEACHER_EMAIL);
                return;
            }
            if (teacherProfileRepository.existsByEmployeeId(TEACHER_EMPLOYEE_ID)) {
                log.warn("Skipped demo teacher: employee ID {} is already in use", TEACHER_EMPLOYEE_ID);
                return;
            }

            User teacher = new User("Demo Teacher", TEACHER_EMAIL, passwordEncoder.encode(DEMO_PASSWORD), Role.TEACHER);
            teacher.setCollege(AuthService.COLLEGE);
            teacher.setBio("Public demo teacher account for reviewers.");
            User saved = userRepository.save(teacher);

            teacherProfileRepository.save(new TeacherProfile(
                    saved,
                    TEACHER_EMPLOYEE_ID,
                    "Computer Science and Engineering",
                    "Assistant Professor",
                    "B-101"
            ));
            log.info("Created demo teacher '{}'", TEACHER_EMAIL);
        } catch (Exception ex) {
            log.warn("Skipped demo teacher '{}': {}", TEACHER_EMAIL, ex.getMessage());
        }
    }
}
