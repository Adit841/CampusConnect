package com.campusconnect.controller;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.ArgumentMatchers.isNull;
import static org.mockito.Mockito.verifyNoInteractions;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.multipart;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import java.math.BigDecimal;
import java.security.Principal;
import java.time.Instant;
import java.util.List;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.HttpMethod;
import org.springframework.http.MediaType;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;

import com.campusconnect.dto.GradeSubmissionRequest;
import com.campusconnect.dto.SubmissionResponse;
import com.campusconnect.exception.BadRequestException;
import com.campusconnect.exception.GlobalExceptionHandler;
import com.campusconnect.exception.ResourceNotFoundException;
import com.campusconnect.service.SubmissionService;

@ExtendWith(MockitoExtension.class)
class SubmissionControllerTest {

    private static final Instant T = Instant.parse("2026-10-10T10:00:00Z");

    private MockMvc mockMvc;

    @Mock
    private SubmissionService submissionService;

    @InjectMocks
    private SubmissionController submissionController;

    private final Principal teacher = new UsernamePasswordAuthenticationToken("smith@example.com", "pass");
    private final Principal student = new UsernamePasswordAuthenticationToken("sam@example.com", "pass");

    @BeforeEach
    void setUp() {
        mockMvc = MockMvcBuilders.standaloneSetup(submissionController)
                .setControllerAdvice(new GlobalExceptionHandler())
                .build();
    }

    private static SubmissionResponse response(String status, BigDecimal marks) {
        return new SubmissionResponse(1L, 5L, "Lab 1", "Advanced Java", "CE-AJ301", T, 50, 10L, "Sam", "sam@example.com",
                "answer", null, status, false, 2, T, marks, marks == null ? null : "Nice", marks == null ? null : T, null, true);
    }

    @Test
    void mySubmissions_requiresAuthentication() throws Exception {
        mockMvc.perform(get("/api/submissions/mine")).andExpect(status().isUnauthorized());
        verifyNoInteractions(submissionService);
    }

    @Test
    void mySubmissions_returnsList() throws Exception {
        when(submissionService.getMySubmissions("sam@example.com")).thenReturn(List.of(response("SUBMITTED", null)));

        mockMvc.perform(get("/api/submissions/mine").principal(student))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].assignmentTitle").value("Lab 1"))
                .andExpect(jsonPath("$[0].marksAwarded").doesNotExist());
    }

    @Test
    void getSubmission_otherStudentGets404() throws Exception {
        when(submissionService.getSubmission(1L, "sam@example.com")).thenThrow(new ResourceNotFoundException("Submission not found"));

        mockMvc.perform(get("/api/submissions/1").principal(student)).andExpect(status().isNotFound());
    }

    @Test
    void resubmit_usesMultipartPut() throws Exception {
        when(submissionService.resubmit(eq(1L), eq("sam@example.com"), eq("revised"), isNull(), eq(true)))
                .thenReturn(response("SUBMITTED", null));

        mockMvc.perform(multipart(HttpMethod.PUT, "/api/submissions/1")
                        .param("textResponse", "revised")
                        .param("removeFile", "true")
                        .principal(student))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.attemptNumber").value(2));
    }

    @Test
    void grade_returnsGradedSubmission() throws Exception {
        when(submissionService.grade(eq(1L), eq("smith@example.com"), any(GradeSubmissionRequest.class)))
                .thenReturn(response("GRADED", new BigDecimal("42.5")));

        mockMvc.perform(post("/api/submissions/1/grade").principal(teacher).contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {"marks":42.5,"feedback":"Nice","returnToStudent":false}
                                """))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.status").value("GRADED"))
                .andExpect(jsonPath("$.marksAwarded").value(42.5));
    }

    @Test
    void grade_negativeOrMissingMarks_failValidation() throws Exception {
        mockMvc.perform(post("/api/submissions/1/grade").principal(teacher).contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {"marks":-1}
                                """))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.validationErrors.marks").exists());

        mockMvc.perform(post("/api/submissions/1/grade").principal(teacher).contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {"marks":12.345}
                                """))
                .andExpect(status().isBadRequest());

        mockMvc.perform(post("/api/submissions/1/grade").principal(teacher).contentType(MediaType.APPLICATION_JSON)
                        .content("{}"))
                .andExpect(status().isBadRequest());
        verifyNoInteractions(submissionService);
    }

    @Test
    void grade_aboveMaximumMapsTo400() throws Exception {
        when(submissionService.grade(eq(1L), eq("smith@example.com"), any(GradeSubmissionRequest.class)))
                .thenThrow(new BadRequestException("Marks cannot exceed the maximum of 50"));

        mockMvc.perform(post("/api/submissions/1/grade").principal(teacher).contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {"marks":51}
                                """))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.message").value("Marks cannot exceed the maximum of 50"));
    }

    @Test
    void grade_byStudentMapsTo403() throws Exception {
        when(submissionService.grade(eq(1L), eq("sam@example.com"), any(GradeSubmissionRequest.class)))
                .thenThrow(new AccessDeniedException("no"));

        mockMvc.perform(post("/api/submissions/1/grade").principal(student).contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {"marks":10}
                                """))
                .andExpect(status().isForbidden());
    }
}
