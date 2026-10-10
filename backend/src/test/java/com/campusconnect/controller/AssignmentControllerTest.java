package com.campusconnect.controller;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.ArgumentMatchers.isNull;
import static org.mockito.Mockito.doThrow;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.verifyNoInteractions;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.delete;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.multipart;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.put;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.content;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.header;
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
import org.springframework.core.io.ByteArrayResource;
import org.springframework.http.MediaType;
import org.springframework.mock.web.MockMultipartFile;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;
import org.springframework.web.multipart.MultipartFile;

import com.campusconnect.dto.AssignmentRequest;
import com.campusconnect.dto.AssignmentResponse;
import com.campusconnect.dto.AssignmentStatsResponse;
import com.campusconnect.dto.AssignmentSubmissionsResponse;
import com.campusconnect.dto.SubmissionResponse;
import com.campusconnect.entity.StoredFile;
import com.campusconnect.exception.BadRequestException;
import com.campusconnect.exception.ConflictException;
import com.campusconnect.exception.GlobalExceptionHandler;
import com.campusconnect.exception.ResourceNotFoundException;
import com.campusconnect.service.AssignmentService;
import com.campusconnect.service.AssignmentService.FileDownload;
import com.campusconnect.service.SubmissionService;

@ExtendWith(MockitoExtension.class)
class AssignmentControllerTest {

    private static final Instant DUE = Instant.parse("2026-10-20T18:29:00Z");

    private MockMvc mockMvc;

    @Mock
    private AssignmentService assignmentService;

    @Mock
    private SubmissionService submissionService;

    @InjectMocks
    private AssignmentController assignmentController;

    private final Principal teacher = new UsernamePasswordAuthenticationToken("smith@example.com", "pass");
    private final Principal student = new UsernamePasswordAuthenticationToken("sam@example.com", "pass");

    @BeforeEach
    void setUp() {
        mockMvc = MockMvcBuilders.standaloneSetup(assignmentController)
                .setControllerAdvice(new GlobalExceptionHandler())
                .build();
    }

    static AssignmentResponse response(long id, String status) {
        return new AssignmentResponse(id, 1L, "Advanced Java", "CE-AJ301", "Prof. Smith", "Lab 1", "desc", "steps", 50,
                status, null, DUE, false, false, null, true, DUE, DUE, null, null,
                new AssignmentStatsResponse(10, 3, 1, 2, 7, 0));
    }

    private static final String VALID_BODY = """
            {"subjectId":1,"title":"Lab 1","maxMarks":50,"dueAt":"2026-10-20T18:29:00Z"}
            """;

    @Test
    void listAssignments_requiresAuthentication() throws Exception {
        mockMvc.perform(get("/api/assignments")).andExpect(status().isUnauthorized());
        verifyNoInteractions(assignmentService);
    }

    @Test
    void listAssignments_passesFilters() throws Exception {
        when(assignmentService.getAssignments("smith@example.com", 1L, "OPEN", "lab", "newest"))
                .thenReturn(List.of(response(5L, "PUBLISHED")));

        mockMvc.perform(get("/api/assignments").principal(teacher)
                        .param("subjectId", "1").param("status", "OPEN").param("search", "lab").param("sort", "newest"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].id").value(5))
                .andExpect(jsonPath("$[0].dueAt").value("2026-10-20T18:29:00Z"))
                .andExpect(jsonPath("$[0].stats.pending").value(7))
                .andExpect(jsonPath("$[0].myStatus").doesNotExist());
    }

    @Test
    void createAssignment_returnsCreated() throws Exception {
        when(assignmentService.createAssignment(eq("smith@example.com"), any(AssignmentRequest.class)))
                .thenReturn(response(9L, "DRAFT"));

        mockMvc.perform(post("/api/assignments").principal(teacher).contentType(MediaType.APPLICATION_JSON).content(VALID_BODY))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.status").value("DRAFT"));
    }

    @Test
    void createAssignment_validationErrors() throws Exception {
        mockMvc.perform(post("/api/assignments").principal(teacher).contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {"title":"  ","maxMarks":0}
                                """))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.validationErrors.title").exists())
                .andExpect(jsonPath("$.validationErrors.maxMarks").exists())
                .andExpect(jsonPath("$.validationErrors.subjectId").exists())
                .andExpect(jsonPath("$.validationErrors.dueAt").exists());
        verifyNoInteractions(assignmentService);
    }

    @Test
    void createAssignment_malformedDateMapsTo400() throws Exception {
        mockMvc.perform(post("/api/assignments").principal(teacher).contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {"subjectId":1,"title":"Lab","maxMarks":10,"dueAt":"next friday"}
                                """))
                .andExpect(status().isBadRequest());
    }

    @Test
    void createAssignment_studentForbidden() throws Exception {
        when(assignmentService.createAssignment(eq("sam@example.com"), any(AssignmentRequest.class)))
                .thenThrow(new AccessDeniedException("Only teachers can create assignments"));

        mockMvc.perform(post("/api/assignments").principal(student).contentType(MediaType.APPLICATION_JSON).content(VALID_BODY))
                .andExpect(status().isForbidden());
    }

    @Test
    void updateAssignment_returnsOk() throws Exception {
        when(assignmentService.updateAssignment(eq(5L), eq("smith@example.com"), any(AssignmentRequest.class)))
                .thenReturn(response(5L, "PUBLISHED"));

        mockMvc.perform(put("/api/assignments/5").principal(teacher).contentType(MediaType.APPLICATION_JSON).content(VALID_BODY))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id").value(5));
    }

    @Test
    void publishAssignment_conflictWhenAlreadyPublished() throws Exception {
        when(assignmentService.publishAssignment(5L, "smith@example.com")).thenThrow(new ConflictException("Assignment is already published"));

        mockMvc.perform(post("/api/assignments/5/publish").principal(teacher))
                .andExpect(status().isConflict())
                .andExpect(jsonPath("$.message").value("Assignment is already published"));
    }

    @Test
    void deleteAssignment_returnsNoContent() throws Exception {
        mockMvc.perform(delete("/api/assignments/5").principal(teacher)).andExpect(status().isNoContent());
        verify(assignmentService).deleteAssignment(5L, "smith@example.com");
    }

    @Test
    void deleteAssignment_missingMapsTo404() throws Exception {
        doThrow(new ResourceNotFoundException("Assignment not found")).when(assignmentService).deleteAssignment(5L, "smith@example.com");
        mockMvc.perform(delete("/api/assignments/5").principal(teacher)).andExpect(status().isNotFound());
    }

    @Test
    void submit_acceptsMultipartTextAndFile() throws Exception {
        SubmissionResponse created = new SubmissionResponse(500L, 5L, "Lab 1", "Advanced Java", "CE-AJ301", DUE, 50, 10L, "Sam",
                "sam@example.com", "answer", null, "SUBMITTED", false, 1, DUE, null, null, null, null, true);
        when(submissionService.submit(eq(5L), eq("sam@example.com"), eq("answer"), any(MultipartFile.class))).thenReturn(created);

        mockMvc.perform(multipart("/api/assignments/5/submissions")
                        .file(new MockMultipartFile("file", "a.pdf", "application/pdf", "x".getBytes()))
                        .param("textResponse", "answer")
                        .principal(student))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.id").value(500))
                .andExpect(jsonPath("$.status").value("SUBMITTED"));
    }

    @Test
    void submit_textOnly_andDeadlineErrorMapsTo400() throws Exception {
        when(submissionService.submit(eq(5L), eq("sam@example.com"), eq("answer"), isNull()))
                .thenThrow(new BadRequestException("The deadline for this assignment has passed"));

        mockMvc.perform(multipart("/api/assignments/5/submissions").param("textResponse", "answer").principal(student))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.message").value("The deadline for this assignment has passed"));
    }

    @Test
    void listSubmissions_returnsRoster() throws Exception {
        when(submissionService.getAssignmentSubmissions(5L, "smith@example.com", "PENDING"))
                .thenReturn(new AssignmentSubmissionsResponse(response(5L, "PUBLISHED"), List.of()));

        mockMvc.perform(get("/api/assignments/5/submissions").param("status", "PENDING").principal(teacher))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.assignment.id").value(5))
                .andExpect(jsonPath("$.entries").isArray());
    }

    @Test
    void downloadAttachment_setsSafeHeaders() throws Exception {
        StoredFile file = new StoredFile("brief notes.pdf", "k.pdf", "application/pdf", 3L);
        when(assignmentService.downloadAttachment(5L, "sam@example.com"))
                .thenReturn(new FileDownload(new ByteArrayResource("abc".getBytes()), file));

        mockMvc.perform(get("/api/assignments/5/attachment").principal(student))
                .andExpect(status().isOk())
                .andExpect(header().string("Content-Type", "application/pdf"))
                .andExpect(header().string("X-Content-Type-Options", "nosniff"))
                .andExpect(header().string("Content-Disposition", org.hamcrest.Matchers.startsWith("attachment;")))
                .andExpect(content().bytes("abc".getBytes()));
    }

    @Test
    void uploadAttachment_requiresFilePart() throws Exception {
        mockMvc.perform(multipart("/api/assignments/5/attachment").principal(teacher))
                .andExpect(status().isBadRequest());
        verifyNoInteractions(assignmentService);
    }
}
