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

import com.campusconnect.dto.ProfileResponse;
import com.campusconnect.dto.UpdateProfileRequest;
import com.campusconnect.entity.Role;
import com.campusconnect.entity.StudentProfile;
import com.campusconnect.entity.TeacherProfile;
import com.campusconnect.entity.User;
import com.campusconnect.exception.ResourceNotFoundException;
import com.campusconnect.repository.StudentProfileRepository;
import com.campusconnect.repository.TeacherProfileRepository;
import com.campusconnect.repository.UserRepository;

@ExtendWith(MockitoExtension.class)
class ProfileServiceTest {

    @Mock
    private UserRepository userRepository;

    @Mock
    private StudentProfileRepository studentProfileRepository;

    @Mock
    private TeacherProfileRepository teacherProfileRepository;

    private ProfileService profileService;

    @BeforeEach
    void setUp() {
        profileService = new ProfileService(
                userRepository,
                studentProfileRepository,
                teacherProfileRepository
        );
    }

    @Test
    void testGetStudentProfile() {
        User user = new User("Alice", "alice@example.com", "passhash", Role.STUDENT);
        user.setId(1L);
        StudentProfile studentProfile = new StudentProfile(user, "EN001", "101", "B.Tech", "CS", 2, "B");

        when(userRepository.findByEmail("alice@example.com")).thenReturn(Optional.of(user));
        when(studentProfileRepository.findByUser(user)).thenReturn(Optional.of(studentProfile));

        ProfileResponse response = profileService.getProfile("alice@example.com");

        assertNotNull(response);
        assertEquals("alice@example.com", response.getEmail());
        assertEquals(Role.STUDENT, response.getRole());
        assertNotNull(response.getStudentProfile());
        assertEquals("EN001", response.getStudentProfile().getEnrollmentNo());
    }

    @Test
    void testGetTeacherProfile() {
        User user = new User("Dr. Bob", "bob@example.com", "passhash", Role.TEACHER);
        user.setId(2L);
        TeacherProfile teacherProfile = new TeacherProfile(user, "T001", "EE", "Professor", "Lab 2");

        when(userRepository.findByEmail("bob@example.com")).thenReturn(Optional.of(user));
        when(teacherProfileRepository.findByUser(user)).thenReturn(Optional.of(teacherProfile));

        ProfileResponse response = profileService.getProfile("bob@example.com");

        assertNotNull(response);
        assertEquals("bob@example.com", response.getEmail());
        assertEquals(Role.TEACHER, response.getRole());
        assertNotNull(response.getTeacherProfile());
        assertEquals("T001", response.getTeacherProfile().getEmployeeId());
    }

    @Test
    void testUpdateProfilePreservesIdEmailRoleAndPassword() {
        User user = new User("Alice", "alice@example.com", "passhash", Role.STUDENT);
        user.setId(1L);
        StudentProfile studentProfile = new StudentProfile(user, "EN001", "101", "B.Tech", "CS", 2, "B");

        when(userRepository.findByEmail("alice@example.com")).thenReturn(Optional.of(user));
        when(userRepository.save(any(User.class))).thenAnswer(invocation -> invocation.getArgument(0));
        when(studentProfileRepository.findByUser(any(User.class))).thenReturn(Optional.of(studentProfile));
        when(studentProfileRepository.save(any(StudentProfile.class))).thenAnswer(invocation -> invocation.getArgument(0));

        UpdateProfileRequest request = new UpdateProfileRequest();
        request.setName("Alice New Name");
        request.setBio("My updated bio");
        request.setPhone("1234567890");
        request.setRollNo("102");
        request.setCourse("M.Tech");

        ProfileResponse response = profileService.updateProfile("alice@example.com", request);

        assertNotNull(response);
        assertEquals(1L, response.getId());
        assertEquals("alice@example.com", response.getEmail());
        assertEquals(Role.STUDENT, response.getRole());
        assertEquals("Alice New Name", response.getName());
        assertEquals("My updated bio", response.getBio());
        assertEquals("1234567890", response.getPhone());
        assertEquals("passhash", user.getPassword()); // password unchanged!
        assertEquals("102", response.getStudentProfile().getRollNo());
        assertEquals("M.Tech", response.getStudentProfile().getCourse());
        assertEquals("EN001", response.getStudentProfile().getEnrollmentNo()); // enrollmentNo preserved!
    }

    @Test
    void testGetProfileNotFoundThrowsException() {
        when(userRepository.findByEmail("notfound@example.com")).thenReturn(Optional.empty());

        assertThrows(ResourceNotFoundException.class, () -> profileService.getProfile("notfound@example.com"));
    }
}
