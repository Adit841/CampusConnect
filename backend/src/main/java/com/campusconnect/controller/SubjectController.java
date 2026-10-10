package com.campusconnect.controller;

import java.util.List;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.campusconnect.dto.AssignmentResponse;
import com.campusconnect.dto.SubjectRequest;
import com.campusconnect.dto.SubjectResponse;
import com.campusconnect.dto.TeacherOptionResponse;
import com.campusconnect.service.AssignmentService;
import com.campusconnect.service.SubjectService;

import jakarta.validation.Valid;

@RestController
@RequestMapping("/api/subjects")
public class SubjectController {

    private final SubjectService subjectService;
    private final AssignmentService assignmentService;

    public SubjectController(SubjectService subjectService, AssignmentService assignmentService) {
        this.subjectService = subjectService;
        this.assignmentService = assignmentService;
    }

    @GetMapping
    public ResponseEntity<List<SubjectResponse>> listSubjects(Authentication authentication) {
        if (authentication == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }
        return ResponseEntity.ok(subjectService.getSubjects(authentication.getName()));
    }

    @GetMapping("/teachers")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<List<TeacherOptionResponse>> listTeachers(Authentication authentication) {
        if (authentication == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }
        return ResponseEntity.ok(subjectService.getTeacherOptions(authentication.getName()));
    }

    @GetMapping("/{subjectId}")
    public ResponseEntity<SubjectResponse> getSubject(@PathVariable Long subjectId, Authentication authentication) {
        if (authentication == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }
        return ResponseEntity.ok(subjectService.getSubject(subjectId, authentication.getName()));
    }

    @GetMapping("/{subjectId}/assignments")
    public ResponseEntity<List<AssignmentResponse>> listSubjectAssignments(@PathVariable Long subjectId, Authentication authentication) {
        if (authentication == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }
        return ResponseEntity.ok(assignmentService.getAssignmentsForSubject(subjectId, authentication.getName()));
    }

    @PostMapping
    @PreAuthorize("hasAnyRole('TEACHER', 'ADMIN')")
    public ResponseEntity<SubjectResponse> createSubject(Authentication authentication, @Valid @RequestBody SubjectRequest request) {
        if (authentication == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }
        return ResponseEntity.status(HttpStatus.CREATED).body(subjectService.createSubject(authentication.getName(), request));
    }

    @PutMapping("/{subjectId}")
    @PreAuthorize("hasAnyRole('TEACHER', 'ADMIN')")
    public ResponseEntity<SubjectResponse> updateSubject(
            @PathVariable Long subjectId,
            Authentication authentication,
            @Valid @RequestBody SubjectRequest request
    ) {
        if (authentication == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }
        return ResponseEntity.ok(subjectService.updateSubject(subjectId, authentication.getName(), request));
    }
}
