package com.campusconnect.service;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import java.util.Optional;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.crypto.password.PasswordEncoder;

import com.campusconnect.dto.AuthResponse;
import com.campusconnect.dto.LoginRequest;
import com.campusconnect.dto.RegisterRequest;
import com.campusconnect.entity.Role;
import com.campusconnect.entity.StudentProfile;
import com.campusconnect.entity.TeacherProfile;
import com.campusconnect.entity.User;
import com.campusconnect.exception.BadRequestException;
import com.campusconnect.repository.StudentProfileRepository;
import com.campusconnect.repository.TeacherProfileRepository;
import com.campusconnect.repository.UserRepository;
import com.campusconnect.security.CustomUserDetails;
import com.campusconnect.security.JwtService;

@ExtendWith(MockitoExtension.class)
class AuthServiceTest {

    @Mock
    private UserRepository userRepository;

    @Mock
    private StudentProfileRepository studentProfileRepository;

    @Mock
    private TeacherProfileRepository teacherProfileRepository;

    @Mock
    private PasswordEncoder passwordEncoder;

    @Mock
    private JwtService jwtService;

    @Mock
    private AuthenticationManager authenticationManager;

    private AuthService authService;

    @BeforeEach
    void setUp() {
        authService = new AuthService(
                userRepository,
                studentProfileRepository,
                teacherProfileRepository,
                passwordEncoder,
                jwtService,
                authenticationManager
        );
    }

    @Test
    void testRegisterStudentSuccess() {
        RegisterRequest request = new RegisterRequest();
        request.setName("John Doe");
        request.setEmail("john@example.com");
        request.setPassword("plainPassword123");
        request.setRole(Role.STUDENT);
        request.setEnrollmentNo("EN12345");
        request.setRollNo("CS-01");
        request.setCourse("B.Tech");
        request.setDepartment("CSE");
        request.setYear(3);
        request.setSection("A");

        when(userRepository.existsByEmail("john@example.com")).thenReturn(false);
        when(studentProfileRepository.existsByEnrollmentNo("EN12345")).thenReturn(false);
        when(passwordEncoder.encode("plainPassword123")).thenReturn("hashedPassword123");

        User savedUser = new User("John Doe", "john@example.com", "hashedPassword123", Role.STUDENT);
        savedUser.setId(10L);
        when(userRepository.save(any(User.class))).thenReturn(savedUser);
        when(jwtService.generateToken(any(), any())).thenReturn("mock.jwt.token");

        AuthResponse response = authService.register(request);

        assertNotNull(response);
        assertEquals("mock.jwt.token", response.getToken());
        assertEquals("john@example.com", response.getUser().getEmail());
        assertEquals(Role.STUDENT, response.getUser().getRole());
        verify(studentProfileRepository).save(any(StudentProfile.class));
    }

    @Test
    void testRegisterTeacherSuccess() {
        RegisterRequest request = new RegisterRequest();
        request.setName("Prof. Smith");
        request.setEmail("smith@example.com");
        request.setPassword("teachPass123");
        request.setRole(Role.TEACHER);
        request.setEmployeeId("EMP999");
        request.setDepartment("Physics");
        request.setDesignation("Assistant Professor");
        request.setOfficeRoom("Room 404");

        when(userRepository.existsByEmail("smith@example.com")).thenReturn(false);
        when(teacherProfileRepository.existsByEmployeeId("EMP999")).thenReturn(false);
        when(passwordEncoder.encode("teachPass123")).thenReturn("hashedTeachPass");

        User savedUser = new User("Prof. Smith", "smith@example.com", "hashedTeachPass", Role.TEACHER);
        savedUser.setId(11L);
        when(userRepository.save(any(User.class))).thenReturn(savedUser);
        when(jwtService.generateToken(any(), any())).thenReturn("mock.teacher.jwt");

        AuthResponse response = authService.register(request);

        assertNotNull(response);
        assertEquals("mock.teacher.jwt", response.getToken());
        assertEquals("smith@example.com", response.getUser().getEmail());
        assertEquals(Role.TEACHER, response.getUser().getRole());
        verify(teacherProfileRepository).save(any(TeacherProfile.class));
    }

    @Test
    void testRegisterDuplicateEmailThrowsBadRequest() {
        RegisterRequest request = new RegisterRequest();
        request.setEmail("duplicate@example.com");

        when(userRepository.existsByEmail("duplicate@example.com")).thenReturn(true);

        assertThrows(BadRequestException.class, () -> authService.register(request));
    }

    @Test
    void testRegisterStudentDuplicateEnrollmentThrowsBadRequest() {
        RegisterRequest request = new RegisterRequest();
        request.setEmail("student@example.com");
        request.setRole(Role.STUDENT);
        request.setEnrollmentNo("EN_DUP");

        when(userRepository.existsByEmail("student@example.com")).thenReturn(false);
        when(studentProfileRepository.existsByEnrollmentNo("EN_DUP")).thenReturn(true);

        assertThrows(BadRequestException.class, () -> authService.register(request));
    }

    @Test
    void testRegisterTeacherDuplicateEmployeeIdThrowsBadRequest() {
        RegisterRequest request = new RegisterRequest();
        request.setEmail("teacher@example.com");
        request.setRole(Role.TEACHER);
        request.setEmployeeId("EMP_DUP");

        when(userRepository.existsByEmail("teacher@example.com")).thenReturn(false);
        when(teacherProfileRepository.existsByEmployeeId("EMP_DUP")).thenReturn(true);

        assertThrows(BadRequestException.class, () -> authService.register(request));
    }

    @Test
    void testLoginSuccess() {
        LoginRequest request = new LoginRequest("user@example.com", "pass123");
        User user = new User("User", "user@example.com", "hashed", Role.STUDENT);
        user.setId(5L);
        CustomUserDetails userDetails = new CustomUserDetails(user);

        Authentication auth = new UsernamePasswordAuthenticationToken(userDetails, null, userDetails.getAuthorities());
        when(authenticationManager.authenticate(any(UsernamePasswordAuthenticationToken.class))).thenReturn(auth);
        when(jwtService.generateToken(any(), any())).thenReturn("login.jwt.token");

        AuthResponse response = authService.login(request);

        assertNotNull(response);
        assertEquals("login.jwt.token", response.getToken());
        assertEquals("user@example.com", response.getUser().getEmail());
    }

    @Test
    void testLoginBadCredentialsThrowsException() {
        LoginRequest request = new LoginRequest("user@example.com", "wrongpass");
        when(authenticationManager.authenticate(any(UsernamePasswordAuthenticationToken.class)))
                .thenThrow(new BadCredentialsException("Bad credentials"));

        assertThrows(BadCredentialsException.class, () -> authService.login(request));
    }
}
