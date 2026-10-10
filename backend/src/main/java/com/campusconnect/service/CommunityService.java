package com.campusconnect.service;

import com.campusconnect.dto.*;
import com.campusconnect.entity.*;
import com.campusconnect.exception.BadRequestException;
import com.campusconnect.exception.ResourceNotFoundException;
import com.campusconnect.repository.*;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Arrays;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
@Transactional
public class CommunityService {

    private final CommunityPostRepository postRepo;
    private final CommunityCommentRepository commentRepo;
    private final CommunityVoteRepository voteRepo;
    private final CommunityReportRepository reportRepo;
    private final UserRepository userRepo;
    private final StudentProfileRepository studentProfileRepo;

    public CommunityService(
            CommunityPostRepository postRepo,
            CommunityCommentRepository commentRepo,
            CommunityVoteRepository voteRepo,
            CommunityReportRepository reportRepo,
            UserRepository userRepo,
            StudentProfileRepository studentProfileRepo) {
        this.postRepo = postRepo;
        this.commentRepo = commentRepo;
        this.voteRepo = voteRepo;
        this.reportRepo = reportRepo;
        this.userRepo = userRepo;
        this.studentProfileRepo = studentProfileRepo;
    }

    @Transactional(readOnly = true)
    public List<CommunityPostDto> getPosts(String category, String sort, String search, String currentUserEmail) {
        Long currentUserId = resolveUserId(currentUserEmail);
        String cat = (category == null || category.equalsIgnoreCase("all")) ? null : category;
        String query = (search == null || search.isBlank()) ? null : search.trim();

        List<CommunityPost> posts;
        if ("recent".equalsIgnoreCase(sort)) {
            posts = postRepo.findFilteredRecent(cat, query);
        } else {
            posts = postRepo.findFilteredTrending(cat, query);
        }

        return posts.stream()
                .map(p -> toPostDto(p, currentUserId))
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public CommunityPostDto getPostById(Long id, String currentUserEmail) {
        Long currentUserId = resolveUserId(currentUserEmail);
        CommunityPost post = postRepo.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Community post not found with id: " + id));
        return toPostDto(post, currentUserId);
    }

    public CommunityPostDto createPost(CreatePostRequest req, String currentUserEmail) {
        User author = requireUser(currentUserEmail);
        boolean isSuggestion = Boolean.TRUE.equals(req.isSuggestion()) || "facilities".equalsIgnoreCase(req.category());
        String status = isSuggestion ? "SUBMITTED" : null;
        String categoryLabel = getCategoryLabel(req.category());

        CommunityPost post = new CommunityPost(
                req.title().trim(),
                req.content().trim(),
                req.category().trim(),
                categoryLabel,
                isSuggestion,
                status,
                author
        );

        // Author initial vote for immediate engagement
        post.setUpvotesCount(1);
        CommunityPost savedPost = postRepo.save(post);
        voteRepo.save(new CommunityVote(savedPost, author));

        return toPostDto(savedPost, author.getId());
    }

    public CommunityPostDto toggleUpvote(Long postId, String currentUserEmail) {
        User caller = requireUser(currentUserEmail);
        CommunityPost post = postRepo.findById(postId)
                .orElseThrow(() -> new ResourceNotFoundException("Community post not found with id: " + postId));

        Optional<CommunityVote> existingVote = voteRepo.findByPostIdAndUserId(postId, caller.getId());
        if (existingVote.isPresent()) {
            voteRepo.deleteByPostIdAndUserId(postId, caller.getId());
            post.setUpvotesCount(Math.max(0, post.getUpvotesCount() - 1));
        } else {
            voteRepo.save(new CommunityVote(post, caller));
            post.setUpvotesCount(post.getUpvotesCount() + 1);
        }

        CommunityPost updated = postRepo.save(post);
        return toPostDto(updated, caller.getId());
    }

    public CommunityCommentDto addComment(Long postId, CreateCommentRequest req, String currentUserEmail) {
        User author = requireUser(currentUserEmail);
        CommunityPost post = postRepo.findById(postId)
                .orElseThrow(() -> new ResourceNotFoundException("Community post not found with id: " + postId));

        CommunityComment comment = new CommunityComment(post, author, req.text().trim());
        CommunityComment savedComment = commentRepo.save(comment);

        post.setCommentsCount(post.getCommentsCount() + 1);
        postRepo.save(post);

        return toCommentDto(savedComment);
    }

    public CommunityPostDto updateStatus(Long postId, UpdateStatusRequest req, String currentUserEmail) {
        User caller = requireUser(currentUserEmail);
        CommunityPost post = postRepo.findById(postId)
                .orElseThrow(() -> new ResourceNotFoundException("Community post not found with id: " + postId));

        if (!post.isSuggestion()) {
            throw new BadRequestException("Only feedback suggestion posts have a status");
        }

        boolean isAuthor = post.getAuthor().getId().equals(caller.getId());
        boolean isStaff = caller.getRole() == Role.TEACHER || caller.getRole() == Role.ADMIN;
        if (!isAuthor && !isStaff) {
            throw new AccessDeniedException("Only the post author, teachers, or administrators can update the status");
        }

        post.setStatus(req.status());
        CommunityPost updated = postRepo.save(post);
        return toPostDto(updated, caller.getId());
    }

    public CommunityPostDto reportPost(Long postId, String currentUserEmail) {
        User caller = requireUser(currentUserEmail);
        CommunityPost post = postRepo.findById(postId)
                .orElseThrow(() -> new ResourceNotFoundException("Community post not found with id: " + postId));

        if (!reportRepo.existsByPostIdAndUserId(postId, caller.getId())) {
            reportRepo.save(new CommunityReport(post, caller));
            post.setReportsCount(post.getReportsCount() + 1);
            post = postRepo.save(post);
        }

        return toPostDto(post, caller.getId());
    }

    // ── Helper Mappers ────────────────────────────────────────────────────────

    private User requireUser(String email) {
        if (email == null) {
            throw new AccessDeniedException("Authentication required");
        }
        return userRepo.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with email: " + email));
    }

    private Long resolveUserId(String email) {
        if (email == null) return null;
        return userRepo.findByEmail(email).map(User::getId).orElse(null);
    }

    private String getCategoryLabel(String category) {
        if (category == null) return "General";
        return switch (category.toLowerCase()) {
            case "facilities" -> "Facilities & Feedback";
            case "academics" -> "Academics & Study";
            case "clubs-events" -> "Clubs & Events";
            case "campus-life" -> "Campus Life";
            case "qna" -> "Questions & Help";
            default -> "General";
        };
    }

    public CommunityAuthorDto toAuthorDto(User user) {
        String department = "General";
        if (user.getRole() == Role.TEACHER) {
            department = "Faculty";
        } else {
            Optional<StudentProfile> profile = studentProfileRepo.findByUserId(user.getId());
            if (profile.isPresent() && profile.get().getDepartment() != null && !profile.get().getDepartment().isBlank()) {
                department = profile.get().getDepartment();
            }
        }

        String initials = computeInitials(user.getName());
        return new CommunityAuthorDto(
                user.getId(),
                user.getName(),
                user.getRole().name(),
                department,
                initials
        );
    }

    public CommunityCommentDto toCommentDto(CommunityComment comment) {
        return new CommunityCommentDto(
                comment.getId(),
                toAuthorDto(comment.getAuthor()),
                comment.getContent(),
                comment.getCreatedAt()
        );
    }

    public CommunityPostDto toPostDto(CommunityPost post, Long currentUserId) {
        List<String> upvotedBy = voteRepo.findVoterUserIdsByPostId(post.getId());
        boolean hasUpvoted = currentUserId != null && upvotedBy.contains(String.valueOf(currentUserId));
        List<String> reportedBy = reportRepo.findReporterUserIdsByPostId(post.getId());

        List<CommunityCommentDto> comments = commentRepo.findByPostIdOrderByCreatedAtAsc(post.getId())
                .stream()
                .map(this::toCommentDto)
                .collect(Collectors.toList());

        int upvotes = !upvotedBy.isEmpty() ? upvotedBy.size() : post.getUpvotesCount();
        int commentsCount = !comments.isEmpty() ? comments.size() : post.getCommentsCount();
        int reportsCount = !reportedBy.isEmpty() ? reportedBy.size() : post.getReportsCount();

        return new CommunityPostDto(
                post.getId(),
                post.getTitle(),
                post.getContent(),
                post.getCategory(),
                post.getCategoryLabel(),
                post.isSuggestion(),
                post.getStatus(),
                toAuthorDto(post.getAuthor()),
                post.getCreatedAt(),
                post.getUpdatedAt(),
                upvotes,
                upvotedBy,
                hasUpvoted,
                commentsCount,
                comments,
                reportsCount,
                reportedBy
        );
    }

    private String computeInitials(String name) {
        if (name == null || name.isBlank()) return "CC";
        String[] parts = name.trim().split("\\s+");
        if (parts.length == 1) {
            return parts[0].substring(0, Math.min(2, parts[0].length())).toUpperCase();
        }
        return (parts[0].substring(0, 1) + parts[parts.length - 1].substring(0, 1)).toUpperCase();
    }
}
