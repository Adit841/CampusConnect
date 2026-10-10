package com.campusconnect.service;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import java.util.List;
import java.util.Optional;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.access.AccessDeniedException;

import com.campusconnect.dto.AnnouncementResponse;
import com.campusconnect.dto.CreateAnnouncementRequest;
import com.campusconnect.dto.UpdateAnnouncementRequest;
import com.campusconnect.entity.Announcement;
import com.campusconnect.entity.Role;
import com.campusconnect.entity.StudentProfile;
import com.campusconnect.entity.TeacherProfile;
import com.campusconnect.entity.User;
import com.campusconnect.exception.BadRequestException;
import com.campusconnect.exception.ResourceNotFoundException;
import com.campusconnect.repository.AnnouncementRepository;
import com.campusconnect.repository.StudentProfileRepository;
import com.campusconnect.repository.TeacherProfileRepository;
import com.campusconnect.repository.UserRepository;

@ExtendWith(MockitoExtension.class)
class AnnouncementServiceTest {

    @Mock
    private AnnouncementRepository announcementRepository;

    @Mock
    private UserRepository userRepository;

    @Mock
    private StudentProfileRepository studentProfileRepository;

    @Mock
    private TeacherProfileRepository teacherProfileRepository;

    private AnnouncementService announcementService;

    private User studentUser;
    private User teacherUser;
    private User otherTeacherUser;
    private User adminUser;

    @BeforeEach
    void setUp() {
        announcementService = new AnnouncementService(
                announcementRepository,
                userRepository,
                studentProfileRepository,
                teacherProfileRepository
        );

        studentUser = new User("Student Sam", "student@example.com", "pass", Role.STUDENT);
        studentUser.setId(10L);

        teacherUser = new User("Prof. Smith", "smith@example.com", "pass", Role.TEACHER);
        teacherUser.setId(20L);

        otherTeacherUser = new User("Prof. Jones", "jones@example.com", "pass", Role.TEACHER);
        otherTeacherUser.setId(21L);

        adminUser = new User("Admin Alex", "admin@example.com", "pass", Role.ADMIN);
        adminUser.setId(30L);
    }

    @Test
    void getAnnouncements_asAdmin_callsAdminSearch() {
        when(userRepository.findByEmail("admin@example.com")).thenReturn(Optional.of(adminUser));
        Announcement ann = new Announcement("System Update", "Content", "GENERAL", "ALL", null, true, teacherUser);
        ann.setId(1L);
        when(announcementRepository.searchForAdmin(null, null)).thenReturn(List.of(ann));

        List<AnnouncementResponse> result = announcementService.getAnnouncements("admin@example.com", null, null, null);

        assertEquals(1, result.size());
        assertEquals("System Update", result.get(0).getTitle());
        assertTrue(result.get(0).isPinned());
    }

    @Test
    void getAnnouncements_asStudent_retrievesDepartmentAndCallsStudentSearch() {
        when(userRepository.findByEmail("student@example.com")).thenReturn(Optional.of(studentUser));
        StudentProfile sp = new StudentProfile(studentUser, "EN100", "1", "CS", "Computer Engineering", 2, "A");
        when(studentProfileRepository.findByUser(studentUser)).thenReturn(Optional.of(sp));

        Announcement ann = new Announcement("Exam Schedule", "Timetable", "EXAM", "Computer Engineering", "Computer Engineering", false, teacherUser);
        ann.setId(2L);
        when(announcementRepository.searchForStudent("Computer Engineering", "EXAM", null)).thenReturn(List.of(ann));

        List<AnnouncementResponse> result = announcementService.getAnnouncements("student@example.com", "EXAM", null, null);

        assertEquals(1, result.size());
        assertEquals("Exam Schedule", result.get(0).getTitle());
    }

    @Test
    void getAnnouncements_asTeacher_retrievesDepartmentAndCallsTeacherSearch() {
        when(userRepository.findByEmail("smith@example.com")).thenReturn(Optional.of(teacherUser));
        TeacherProfile tp = new TeacherProfile(teacherUser, "EMP01", "Computer Engineering", "Professor", "Room 101");
        when(teacherProfileRepository.findByUser(teacherUser)).thenReturn(Optional.of(tp));

        Announcement ann = new Announcement("Faculty Meeting", "Meeting notes", "GENERAL", "TEACHERS", "Computer Engineering", false, teacherUser);
        ann.setId(3L);
        when(announcementRepository.searchForTeacher(20L, "Computer Engineering", null, null)).thenReturn(List.of(ann));

        List<AnnouncementResponse> result = announcementService.getAnnouncements("smith@example.com", null, null, null);

        assertEquals(1, result.size());
        assertEquals("Faculty Meeting", result.get(0).getTitle());
    }

    @Test
    void getAnnouncements_withLimit_truncatesList() {
        when(userRepository.findByEmail("admin@example.com")).thenReturn(Optional.of(adminUser));
        Announcement ann1 = new Announcement("Ann 1", "Content 1", "GENERAL", "ALL", null, false, teacherUser);
        Announcement ann2 = new Announcement("Ann 2", "Content 2", "GENERAL", "ALL", null, false, teacherUser);
        when(announcementRepository.searchForAdmin(null, null)).thenReturn(List.of(ann1, ann2));

        List<AnnouncementResponse> result = announcementService.getAnnouncements("admin@example.com", null, null, 1);

        assertEquals(1, result.size());
        assertEquals("Ann 1", result.get(0).getTitle());
    }

    @Test
    void getAnnouncementById_studentAccessingTeacherOnly_throwsAccessDenied() {
        when(userRepository.findByEmail("student@example.com")).thenReturn(Optional.of(studentUser));
        Announcement ann = new Announcement("Faculty Confidential", "Notes", "GENERAL", "TEACHERS", null, false, teacherUser);
        ann.setId(4L);
        when(announcementRepository.findById(4L)).thenReturn(Optional.of(ann));

        assertThrows(AccessDeniedException.class, () -> announcementService.getAnnouncementById(4L, "student@example.com"));
    }

    @Test
    void getAnnouncementById_notFound_throwsResourceNotFound() {
        when(userRepository.findByEmail("smith@example.com")).thenReturn(Optional.of(teacherUser));
        when(announcementRepository.findById(999L)).thenReturn(Optional.empty());

        assertThrows(ResourceNotFoundException.class, () -> announcementService.getAnnouncementById(999L, "smith@example.com"));
    }

    @Test
    void createAnnouncement_asTeacher_succeeds() {
        when(userRepository.findByEmail("smith@example.com")).thenReturn(Optional.of(teacherUser));
        CreateAnnouncementRequest request = new CreateAnnouncementRequest(
                "Lab Reschedule", "Lab 3 is moved to 4 PM", "ACADEMIC", "ALL", "CS", true
        );
        Announcement saved = new Announcement(request.getTitle(), request.getContent(), "ACADEMIC", "ALL", "CS", true, teacherUser);
        saved.setId(5L);
        when(announcementRepository.save(any(Announcement.class))).thenReturn(saved);

        AnnouncementResponse response = announcementService.createAnnouncement("smith@example.com", request);

        assertNotNull(response);
        assertEquals(5L, response.getId());
        assertEquals("Lab Reschedule", response.getTitle());
        assertEquals("Prof. Smith", response.getAuthorName());
        assertTrue(response.isPinned());
    }

    @Test
    void createAnnouncement_asStudent_throwsAccessDenied() {
        when(userRepository.findByEmail("student@example.com")).thenReturn(Optional.of(studentUser));
        CreateAnnouncementRequest request = new CreateAnnouncementRequest("Title", "Content", "GENERAL", "ALL", null, false);

        assertThrows(AccessDeniedException.class, () -> announcementService.createAnnouncement("student@example.com", request));
    }

    @Test
    void createAnnouncement_blankTitle_throwsBadRequest() {
        when(userRepository.findByEmail("smith@example.com")).thenReturn(Optional.of(teacherUser));
        CreateAnnouncementRequest request = new CreateAnnouncementRequest("   ", "Content", "GENERAL", "ALL", null, false);

        assertThrows(BadRequestException.class, () -> announcementService.createAnnouncement("smith@example.com", request));
    }

    @Test
    void updateAnnouncement_byAuthorTeacher_succeeds() {
        when(userRepository.findByEmail("smith@example.com")).thenReturn(Optional.of(teacherUser));
        Announcement ann = new Announcement("Original", "Original Content", "GENERAL", "ALL", null, false, teacherUser);
        ann.setId(6L);
        when(announcementRepository.findById(6L)).thenReturn(Optional.of(ann));
        when(announcementRepository.save(any(Announcement.class))).thenAnswer(i -> i.getArgument(0));

        UpdateAnnouncementRequest request = new UpdateAnnouncementRequest("Updated Title", "Updated Content", "EXAM", "STUDENTS", "CS", true);
        AnnouncementResponse response = announcementService.updateAnnouncement(6L, "smith@example.com", request);

        assertEquals("Updated Title", response.getTitle());
        assertEquals("Updated Content", response.getContent());
        assertEquals("EXAM", response.getCategory());
        assertTrue(response.isPinned());
    }

    @Test
    void updateAnnouncement_byDifferentTeacher_throwsAccessDenied() {
        when(userRepository.findByEmail("jones@example.com")).thenReturn(Optional.of(otherTeacherUser));
        Announcement ann = new Announcement("Smith's Notice", "Content", "GENERAL", "ALL", null, false, teacherUser);
        ann.setId(7L);
        when(announcementRepository.findById(7L)).thenReturn(Optional.of(ann));

        UpdateAnnouncementRequest request = new UpdateAnnouncementRequest("Hacked Title", "Hacked Content", "GENERAL", "ALL", null, false);

        assertThrows(AccessDeniedException.class, () -> announcementService.updateAnnouncement(7L, "jones@example.com", request));
    }

    @Test
    void updateAnnouncement_byAdmin_succeedsEvenIfNotAuthor() {
        when(userRepository.findByEmail("admin@example.com")).thenReturn(Optional.of(adminUser));
        Announcement ann = new Announcement("Teacher Notice", "Content", "GENERAL", "ALL", null, false, teacherUser);
        ann.setId(8L);
        when(announcementRepository.findById(8L)).thenReturn(Optional.of(ann));
        when(announcementRepository.save(any(Announcement.class))).thenAnswer(i -> i.getArgument(0));

        UpdateAnnouncementRequest request = new UpdateAnnouncementRequest("Admin Corrected", "New Content", "GENERAL", "ALL", null, false);
        AnnouncementResponse response = announcementService.updateAnnouncement(8L, "admin@example.com", request);

        assertEquals("Admin Corrected", response.getTitle());
    }

    @Test
    void deleteAnnouncement_byAuthor_succeeds() {
        when(userRepository.findByEmail("smith@example.com")).thenReturn(Optional.of(teacherUser));
        Announcement ann = new Announcement("Notice", "Content", "GENERAL", "ALL", null, false, teacherUser);
        ann.setId(9L);
        when(announcementRepository.findById(9L)).thenReturn(Optional.of(ann));

        announcementService.deleteAnnouncement(9L, "smith@example.com");

        verify(announcementRepository).delete(ann);
    }

    @Test
    void deleteAnnouncement_byOtherTeacher_throwsAccessDenied() {
        when(userRepository.findByEmail("jones@example.com")).thenReturn(Optional.of(otherTeacherUser));
        Announcement ann = new Announcement("Notice", "Content", "GENERAL", "ALL", null, false, teacherUser);
        ann.setId(10L);
        when(announcementRepository.findById(10L)).thenReturn(Optional.of(ann));

        assertThrows(AccessDeniedException.class, () -> announcementService.deleteAnnouncement(10L, "jones@example.com"));
    }

    @Test
    void deleteAnnouncement_byAdmin_succeeds() {
        when(userRepository.findByEmail("admin@example.com")).thenReturn(Optional.of(adminUser));
        Announcement ann = new Announcement("Notice", "Content", "GENERAL", "ALL", null, false, teacherUser);
        ann.setId(11L);
        when(announcementRepository.findById(11L)).thenReturn(Optional.of(ann));

        announcementService.deleteAnnouncement(11L, "admin@example.com");

        verify(announcementRepository).delete(ann);
    }
}
