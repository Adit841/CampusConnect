package com.campusconnect.controller;

import com.campusconnect.dto.*;
import com.campusconnect.service.CommunityService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.security.Principal;
import java.util.List;

@RestController
@RequestMapping("/api/community")
public class CommunityController {

    private final CommunityService communityService;

    public CommunityController(CommunityService communityService) {
        this.communityService = communityService;
    }

    /**
     * GET /api/community/posts?category={category}&sort={sort}&search={search}
     */
    @GetMapping("/posts")
    public ResponseEntity<List<CommunityPostDto>> listPosts(
            @RequestParam(required = false, defaultValue = "all") String category,
            @RequestParam(required = false, defaultValue = "trending") String sort,
            @RequestParam(required = false) String search,
            Principal principal) {
        String email = principal != null ? principal.getName() : null;
        List<CommunityPostDto> posts = communityService.getPosts(category, sort, search, email);
        return ResponseEntity.ok(posts);
    }

    /**
     * GET /api/community/posts/{id}
     */
    @GetMapping("/posts/{id}")
    public ResponseEntity<CommunityPostDto> getPost(
            @PathVariable Long id,
            Principal principal) {
        String email = principal != null ? principal.getName() : null;
        CommunityPostDto post = communityService.getPostById(id, email);
        return ResponseEntity.ok(post);
    }

    /**
     * POST /api/community/posts
     */
    @PostMapping("/posts")
    public ResponseEntity<CommunityPostDto> createPost(
            @Valid @RequestBody CreatePostRequest request,
            Principal principal) {
        if (principal == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }
        CommunityPostDto created = communityService.createPost(request, principal.getName());
        return ResponseEntity.status(HttpStatus.CREATED).body(created);
    }

    /**
     * POST /api/community/posts/{id}/upvote
     */
    @PostMapping("/posts/{id}/upvote")
    public ResponseEntity<CommunityPostDto> toggleUpvote(
            @PathVariable Long id,
            Principal principal) {
        if (principal == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }
        CommunityPostDto updated = communityService.toggleUpvote(id, principal.getName());
        return ResponseEntity.ok(updated);
    }

    /**
     * POST /api/community/posts/{id}/comments
     */
    @PostMapping("/posts/{id}/comments")
    public ResponseEntity<CommunityCommentDto> addComment(
            @PathVariable Long id,
            @Valid @RequestBody CreateCommentRequest request,
            Principal principal) {
        if (principal == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }
        CommunityCommentDto comment = communityService.addComment(id, request, principal.getName());
        return ResponseEntity.status(HttpStatus.CREATED).body(comment);
    }

    /**
     * PATCH /api/community/posts/{id}/status
     */
    @PatchMapping("/posts/{id}/status")
    public ResponseEntity<CommunityPostDto> updateStatus(
            @PathVariable Long id,
            @Valid @RequestBody UpdateStatusRequest request,
            Principal principal) {
        if (principal == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }
        CommunityPostDto updated = communityService.updateStatus(id, request, principal.getName());
        return ResponseEntity.ok(updated);
    }

    /**
     * POST /api/community/posts/{id}/report
     */
    @PostMapping("/posts/{id}/report")
    public ResponseEntity<CommunityPostDto> reportPost(
            @PathVariable Long id,
            Principal principal) {
        if (principal == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }
        CommunityPostDto updated = communityService.reportPost(id, principal.getName());
        return ResponseEntity.ok(updated);
    }

    /**
     * DELETE /api/community/posts/{id}
     * Author or ADMIN can delete post.
     */
    @DeleteMapping("/posts/{id}")
    public ResponseEntity<Void> deletePost(
            @PathVariable Long id,
            Principal principal) {
        if (principal == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }
        communityService.deletePost(id, principal.getName());
        return ResponseEntity.noContent().build();
    }

    /**
     * DELETE /api/community/posts/{postId}/comments/{commentId}
     * Author or ADMIN can delete comment.
     */
    @DeleteMapping("/posts/{postId}/comments/{commentId}")
    public ResponseEntity<Void> deleteComment(
            @PathVariable Long postId,
            @PathVariable Long commentId,
            Principal principal) {
        if (principal == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }
        communityService.deleteComment(postId, commentId, principal.getName());
        return ResponseEntity.noContent().build();
    }

    /**
     * POST /api/community/posts/{id}/resolve-reports
     * ADMIN only. Dismisses reports on post.
     */
    @PostMapping("/posts/{id}/resolve-reports")
    public ResponseEntity<CommunityPostDto> resolveReports(
            @PathVariable Long id,
            Principal principal) {
        if (principal == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }
        CommunityPostDto updated = communityService.resolveReports(id, principal.getName());
        return ResponseEntity.ok(updated);
    }

    /**
     * GET /api/community/reported
     * ADMIN only. Returns list of reported posts.
     */
    @GetMapping("/reported")
    public ResponseEntity<List<CommunityPostDto>> getReportedPosts(Principal principal) {
        if (principal == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }
        List<CommunityPostDto> reported = communityService.getReportedPosts(principal.getName());
        return ResponseEntity.ok(reported);
    }

    /**
     * GET /api/community/moderation-logs
     * ADMIN only. Returns moderation audit trail.
     */
    @GetMapping("/moderation-logs")
    public ResponseEntity<List<com.campusconnect.entity.ModerationAuditLog>> getModerationLogs(Principal principal) {
        if (principal == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }
        List<com.campusconnect.entity.ModerationAuditLog> logs = communityService.getModerationAuditLogs(principal.getName());
        return ResponseEntity.ok(logs);
    }
}
