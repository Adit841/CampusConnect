package com.campusconnect.controller;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.doNothing;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.delete;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.put;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import java.security.Principal;
import java.time.LocalDateTime;
import java.util.List;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.MediaType;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;

import com.campusconnect.dto.AnnouncementResponse;
import com.campusconnect.dto.CreateAnnouncementRequest;
import com.campusconnect.dto.UpdateAnnouncementRequest;
import com.campusconnect.entity.Role;
import com.campusconnect.exception.GlobalExceptionHandler;
import com.campusconnect.service.AnnouncementService;

@ExtendWith(MockitoExtension.class)
class AnnouncementControllerTest {

    private MockMvc mockMvc;

    @Mock
    private AnnouncementService announcementService;

    @InjectMocks
    private AnnouncementController announcementController;

    private Principal teacherPrincipal;

    @BeforeEach
    void setUp() {
        mockMvc = MockMvcBuilders.standaloneSetup(announcementController)
                .setControllerAdvice(new GlobalExceptionHandler())
                .build();

        teacherPrincipal = new UsernamePasswordAuthenticationToken("teacher@example.com", "pass");
    }

    @Test
    void listAnnouncements_returnsUnauthorizedWhenPrincipalNull() throws Exception {
        mockMvc.perform(get("/api/announcements"))
                .andExpect(status().isUnauthorized());
    }

    @Test
    void listAnnouncements_returnsOkWhenAuthenticated() throws Exception {
        AnnouncementResponse resp = new AnnouncementResponse();
        resp.setId(1L);
        resp.setTitle("Midterm Exam");
        resp.setContent("Details about midterm");
        resp.setCategory("EXAM");
        resp.setAudience("ALL");
        resp.setPinned(true);
        resp.setAuthorId(20L);
        resp.setAuthorName("Dr. Smith");
        resp.setAuthorRole(Role.TEACHER);
        resp.setCreatedAt(LocalDateTime.now());

        when(announcementService.getAnnouncements("teacher@example.com", null, null, null))
                .thenReturn(List.of(resp));

        mockMvc.perform(get("/api/announcements").principal(teacherPrincipal))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].id").value(1L))
                .andExpect(jsonPath("$[0].title").value("Midterm Exam"))
                .andExpect(jsonPath("$[0].author").value("Dr. Smith"))
                .andExpect(jsonPath("$[0].pinned").value(true));
    }

    @Test
    void getAnnouncement_returnsOkWhenFound() throws Exception {
        AnnouncementResponse resp = new AnnouncementResponse();
        resp.setId(1L);
        resp.setTitle("Midterm Exam");
        resp.setContent("Details");
        resp.setCategory("EXAM");
        resp.setAudience("ALL");
        resp.setAuthorName("Dr. Smith");
        resp.setCreatedAt(LocalDateTime.now());

        when(announcementService.getAnnouncementById(1L, "teacher@example.com"))
                .thenReturn(resp);

        mockMvc.perform(get("/api/announcements/1").principal(teacherPrincipal))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id").value(1L))
                .andExpect(jsonPath("$.title").value("Midterm Exam"));
    }

    @Test
    void createAnnouncement_returnsCreated() throws Exception {
        AnnouncementResponse resp = new AnnouncementResponse();
        resp.setId(5L);
        resp.setTitle("New Announcement");
        resp.setContent("Full announcement description");
        resp.setCategory("GENERAL");
        resp.setAudience("ALL");
        resp.setAuthorName("Dr. Smith");
        resp.setCreatedAt(LocalDateTime.now());

        when(announcementService.createAnnouncement(eq("teacher@example.com"), any(CreateAnnouncementRequest.class)))
                .thenReturn(resp);

        String payload = """
            {
                "title": "New Announcement",
                "content": "Full announcement description",
                "category": "GENERAL",
                "audience": "ALL",
                "pinned": false
            }
        """;

        mockMvc.perform(post("/api/announcements")
                        .principal(teacherPrincipal)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(payload))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.id").value(5L))
                .andExpect(jsonPath("$.title").value("New Announcement"));
    }

    @Test
    void createAnnouncement_validationFailsOnBlankTitle() throws Exception {
        String payload = """
            {
                "title": "",
                "content": "Some content",
                "category": "GENERAL"
            }
        """;

        mockMvc.perform(post("/api/announcements")
                        .principal(teacherPrincipal)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(payload))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.validationErrors.title").exists());
    }

    @Test
    void updateAnnouncement_returnsOk() throws Exception {
        AnnouncementResponse resp = new AnnouncementResponse();
        resp.setId(5L);
        resp.setTitle("Updated Title");
        resp.setContent("Updated content");
        resp.setCategory("ACADEMIC");
        resp.setAudience("STUDENTS");
        resp.setPinned(true);

        when(announcementService.updateAnnouncement(eq(5L), eq("teacher@example.com"), any(UpdateAnnouncementRequest.class)))
                .thenReturn(resp);

        String payload = """
            {
                "title": "Updated Title",
                "content": "Updated content",
                "category": "ACADEMIC",
                "audience": "STUDENTS",
                "pinned": true
            }
        """;

        mockMvc.perform(put("/api/announcements/5")
                        .principal(teacherPrincipal)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(payload))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.title").value("Updated Title"))
                .andExpect(jsonPath("$.pinned").value(true));
    }

    @Test
    void deleteAnnouncement_returnsNoContent() throws Exception {
        doNothing().when(announcementService).deleteAnnouncement(5L, "teacher@example.com");

        mockMvc.perform(delete("/api/announcements/5").principal(teacherPrincipal))
                .andExpect(status().isNoContent());
    }
}
