package com.campusconnect.controller;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.verifyNoInteractions;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.put;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import java.security.Principal;
import java.time.Instant;
import java.util.List;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.MediaType;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;

import com.campusconnect.dto.SubjectRequest;
import com.campusconnect.dto.SubjectResponse;
import com.campusconnect.exception.ConflictException;
import com.campusconnect.exception.GlobalExceptionHandler;
import com.campusconnect.exception.ResourceNotFoundException;
import com.campusconnect.service.AssignmentService;
import com.campusconnect.service.SubjectService;

@ExtendWith(MockitoExtension.class)
class SubjectControllerTest {

    private MockMvc mockMvc;

    @Mock
    private SubjectService subjectService;

    @Mock
    private AssignmentService assignmentService;

    @InjectMocks
    private SubjectController subjectController;

    private final Principal teacher = new UsernamePasswordAuthenticationToken("smith@example.com", "pass");

    @BeforeEach
    void setUp() {
        mockMvc = MockMvcBuilders.standaloneSetup(subjectController)
                .setControllerAdvice(new GlobalExceptionHandler())
                .build();
    }

    private static SubjectResponse response(long id) {
        return new SubjectResponse(id, "Advanced Java", "CE-AJ301", "desc", 4, "CE", null, 3, null,
                20L, "Prof. Smith", "smith@example.com", 2L, true, Instant.parse("2026-10-01T00:00:00Z"), Instant.parse("2026-10-01T00:00:00Z"));
    }

    @Test
    void listSubjects_requiresAuthentication() throws Exception {
        mockMvc.perform(get("/api/subjects")).andExpect(status().isUnauthorized());
        verifyNoInteractions(subjectService);
    }

    @Test
    void listSubjects_returnsSubjects() throws Exception {
        when(subjectService.getSubjects("smith@example.com")).thenReturn(List.of(response(1L)));

        mockMvc.perform(get("/api/subjects").principal(teacher))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].code").value("CE-AJ301"))
                .andExpect(jsonPath("$[0].teacherName").value("Prof. Smith"))
                .andExpect(jsonPath("$[0].assignmentCount").value(2));
    }

    @Test
    void getSubject_notFoundMapsTo404() throws Exception {
        when(subjectService.getSubject(9L, "smith@example.com")).thenThrow(new ResourceNotFoundException("Subject not found"));

        mockMvc.perform(get("/api/subjects/9").principal(teacher))
                .andExpect(status().isNotFound())
                .andExpect(jsonPath("$.message").value("Subject not found"));
    }

    @Test
    void createSubject_returnsCreated() throws Exception {
        when(subjectService.createSubject(eq("smith@example.com"), any(SubjectRequest.class))).thenReturn(response(5L));

        mockMvc.perform(post("/api/subjects").principal(teacher)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {"name":"Advanced Java","code":"CE-AJ301","department":"CE","credits":4,"year":3}
                                """))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.id").value(5));
    }

    @Test
    void createSubject_validationErrors() throws Exception {
        mockMvc.perform(post("/api/subjects").principal(teacher)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {"name":"","code":"bad/code","department":"","year":42}
                                """))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.validationErrors.name").exists())
                .andExpect(jsonPath("$.validationErrors.code").exists())
                .andExpect(jsonPath("$.validationErrors.department").exists())
                .andExpect(jsonPath("$.validationErrors.year").exists());
        verifyNoInteractions(subjectService);
    }

    @Test
    void createSubject_duplicateCodeMapsTo409() throws Exception {
        when(subjectService.createSubject(eq("smith@example.com"), any(SubjectRequest.class)))
                .thenThrow(new ConflictException("A subject with code CE-AJ301 already exists"));

        mockMvc.perform(post("/api/subjects").principal(teacher)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {"name":"Advanced Java","code":"CE-AJ301","department":"CE"}
                                """))
                .andExpect(status().isConflict());
    }

    @Test
    void updateSubject_forbiddenMapsTo403() throws Exception {
        when(subjectService.updateSubject(eq(1L), eq("smith@example.com"), any(SubjectRequest.class)))
                .thenThrow(new AccessDeniedException("nope"));

        mockMvc.perform(put("/api/subjects/1").principal(teacher)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {"name":"Advanced Java","code":"CE-AJ301","department":"CE"}
                                """))
                .andExpect(status().isForbidden())
                .andExpect(jsonPath("$.message").value("Access is denied"));
    }

    @Test
    void listSubjectAssignments_delegatesToAssignmentService() throws Exception {
        when(assignmentService.getAssignmentsForSubject(1L, "smith@example.com")).thenReturn(List.of());

        mockMvc.perform(get("/api/subjects/1/assignments").principal(teacher))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$").isArray());
    }

    @Test
    void invalidPathVariable_mapsTo400() throws Exception {
        mockMvc.perform(get("/api/subjects/abc").principal(teacher))
                .andExpect(status().isBadRequest());
    }
}
