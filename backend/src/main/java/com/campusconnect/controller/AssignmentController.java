package com.campusconnect.controller;

import java.util.List;

import org.springframework.core.io.Resource;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RequestPart;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

import com.campusconnect.dto.AssignmentRequest;
import com.campusconnect.dto.AssignmentResponse;
import com.campusconnect.dto.AssignmentSubmissionsResponse;
import com.campusconnect.dto.SubmissionResponse;
import com.campusconnect.service.AssignmentService;
import com.campusconnect.service.AssignmentService.FileDownload;
import com.campusconnect.service.SubmissionService;
import com.campusconnect.util.FileDownloadResponses;

import jakarta.validation.Valid;

@RestController
@RequestMapping("/api/assignments")
public class AssignmentController {

    private final AssignmentService assignmentService;
    private final SubmissionService submissionService;

    public AssignmentController(AssignmentService assignmentService, SubmissionService submissionService) {
        this.assignmentService = assignmentService;
        this.submissionService = submissionService;
    }

    @GetMapping
    public ResponseEntity<List<AssignmentResponse>> listAssignments(
            Authentication authentication,
            @RequestParam(required = false) Long subjectId,
            @RequestParam(required = false) String status,
            @RequestParam(required = false) String search,
            @RequestParam(required = false) String sort
    ) {
        if (authentication == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }
        return ResponseEntity.ok(assignmentService.getAssignments(authentication.getName(), subjectId, status, search, sort));
    }

    @GetMapping("/{assignmentId}")
    public ResponseEntity<AssignmentResponse> getAssignment(@PathVariable Long assignmentId, Authentication authentication) {
        if (authentication == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }
        return ResponseEntity.ok(assignmentService.getAssignment(assignmentId, authentication.getName()));
    }

    @PostMapping
    @PreAuthorize("hasRole('TEACHER')")
    public ResponseEntity<AssignmentResponse> createAssignment(Authentication authentication, @Valid @RequestBody AssignmentRequest request) {
        if (authentication == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }
        return ResponseEntity.status(HttpStatus.CREATED).body(assignmentService.createAssignment(authentication.getName(), request));
    }

    @PutMapping("/{assignmentId}")
    @PreAuthorize("hasRole('TEACHER')")
    public ResponseEntity<AssignmentResponse> updateAssignment(
            @PathVariable Long assignmentId,
            Authentication authentication,
            @Valid @RequestBody AssignmentRequest request
    ) {
        if (authentication == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }
        return ResponseEntity.ok(assignmentService.updateAssignment(assignmentId, authentication.getName(), request));
    }

    @DeleteMapping("/{assignmentId}")
    @PreAuthorize("hasRole('TEACHER')")
    public ResponseEntity<Void> deleteAssignment(@PathVariable Long assignmentId, Authentication authentication) {
        if (authentication == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }
        assignmentService.deleteAssignment(assignmentId, authentication.getName());
        return ResponseEntity.noContent().build();
    }

    @PostMapping("/{assignmentId}/publish")
    @PreAuthorize("hasRole('TEACHER')")
    public ResponseEntity<AssignmentResponse> publishAssignment(@PathVariable Long assignmentId, Authentication authentication) {
        if (authentication == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }
        return ResponseEntity.ok(assignmentService.publishAssignment(assignmentId, authentication.getName()));
    }

    @PostMapping(value = "/{assignmentId}/attachment", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    @PreAuthorize("hasRole('TEACHER')")
    public ResponseEntity<AssignmentResponse> uploadAttachment(
            @PathVariable Long assignmentId,
            Authentication authentication,
            @RequestPart("file") MultipartFile file
    ) {
        if (authentication == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }
        return ResponseEntity.ok(assignmentService.uploadAttachment(assignmentId, authentication.getName(), file));
    }

    @DeleteMapping("/{assignmentId}/attachment")
    @PreAuthorize("hasRole('TEACHER')")
    public ResponseEntity<AssignmentResponse> removeAttachment(@PathVariable Long assignmentId, Authentication authentication) {
        if (authentication == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }
        return ResponseEntity.ok(assignmentService.removeAttachment(assignmentId, authentication.getName()));
    }

    @GetMapping("/{assignmentId}/attachment")
    public ResponseEntity<Resource> downloadAttachment(@PathVariable Long assignmentId, Authentication authentication) {
        if (authentication == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }
        FileDownload download = assignmentService.downloadAttachment(assignmentId, authentication.getName());
        return FileDownloadResponses.attachment(download.resource(), download.file());
    }

    @PostMapping(value = "/{assignmentId}/submissions", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    @PreAuthorize("hasRole('STUDENT')")
    public ResponseEntity<SubmissionResponse> submit(
            @PathVariable Long assignmentId,
            Authentication authentication,
            @RequestParam(value = "textResponse", required = false) String textResponse,
            @RequestPart(value = "file", required = false) MultipartFile file
    ) {
        if (authentication == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(submissionService.submit(assignmentId, authentication.getName(), textResponse, file));
    }

    @GetMapping("/{assignmentId}/submissions")
    @PreAuthorize("hasAnyRole('TEACHER', 'ADMIN')")
    public ResponseEntity<AssignmentSubmissionsResponse> listSubmissions(
            @PathVariable Long assignmentId,
            Authentication authentication,
            @RequestParam(required = false) String status
    ) {
        if (authentication == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }
        return ResponseEntity.ok(submissionService.getAssignmentSubmissions(assignmentId, authentication.getName(), status));
    }
}
