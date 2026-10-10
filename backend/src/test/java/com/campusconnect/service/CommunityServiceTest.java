package com.campusconnect.service;

import com.campusconnect.dto.*;
import com.campusconnect.entity.*;
import com.campusconnect.exception.BadRequestException;
import com.campusconnect.repository.*;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.access.AccessDeniedException;

import java.lang.reflect.Field;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class CommunityServiceTest {

    @Mock
    private CommunityPostRepository postRepo;

    @Mock
    private CommunityCommentRepository commentRepo;

    @Mock
    private CommunityVoteRepository voteRepo;

    @Mock
    private CommunityReportRepository reportRepo;

    @Mock
    private UserRepository userRepo;

    @Mock
    private StudentProfileRepository studentProfileRepo;

    @Mock
    private ModerationAuditLogRepository moderationAuditLogRepo;

    @InjectMocks
    private CommunityService communityService;

    private User student1;
    private User student2;
    private User faculty;
    private User admin;

    @BeforeEach
    void setUp() throws Exception {
        student1 = new User("Alice Smith", "alice@campus.edu", "pass", Role.STUDENT);
        setId(student1, 1L);

        student2 = new User("Bob Jones", "bob@campus.edu", "pass", Role.STUDENT);
        setId(student2, 2L);

        faculty = new User("Dr. Clark", "clark@campus.edu", "pass", Role.TEACHER);
        setId(faculty, 3L);

        admin = new User("Admin Ayushman", "pathakaayushman57@gmail.com", "pass", Role.ADMIN);
        setId(admin, 4L);
    }

    private void setId(Object entity, Long id) throws Exception {
        Field idField = entity.getClass().getDeclaredField("id");
        idField.setAccessible(true);
        idField.set(entity, id);
    }

    @Test
    @DisplayName("createPost creates post and gives author initial upvote")
    void testCreatePost() throws Exception {
        when(userRepo.findByEmail("alice@campus.edu")).thenReturn(Optional.of(student1));
        when(postRepo.save(any(CommunityPost.class))).thenAnswer(inv -> {
            CommunityPost p = inv.getArgument(0);
            setId(p, 100L);
            return p;
        });

        CreatePostRequest req = new CreatePostRequest("Library AC", "AC on 2nd floor broken", "facilities", true);
        CommunityPostDto dto = communityService.createPost(req, "alice@campus.edu");

        assertThat(dto.id()).isEqualTo(100L);
        assertThat(dto.title()).isEqualTo("Library AC");
        assertThat(dto.category()).isEqualTo("facilities");
        assertThat(dto.isSuggestion()).isTrue();
        assertThat(dto.status()).isEqualTo("SUBMITTED");
        assertThat(dto.author().name()).isEqualTo("Alice Smith");
        verify(voteRepo, times(1)).save(any(CommunityVote.class));
    }

    @Test
    @DisplayName("toggleUpvote adds vote if not present and removes if present")
    void testToggleUpvote() throws Exception {
        CommunityPost post = new CommunityPost("Notice", "Content", "academics", "Academics & Study", false, null, student1);
        setId(post, 101L);
        post.setUpvotesCount(1);

        when(userRepo.findByEmail("bob@campus.edu")).thenReturn(Optional.of(student2));
        when(postRepo.findById(101L)).thenReturn(Optional.of(post));
        when(postRepo.save(any(CommunityPost.class))).thenAnswer(inv -> inv.getArgument(0));

        // First toggle: vote does not exist -> adds vote
        when(voteRepo.findByPostIdAndUserId(101L, 2L)).thenReturn(Optional.empty());
        CommunityPostDto afterUpvote = communityService.toggleUpvote(101L, "bob@campus.edu");
        assertThat(afterUpvote.upvotes()).isEqualTo(2);
        verify(voteRepo, times(1)).save(any(CommunityVote.class));

        // Second toggle: vote exists -> removes vote
        CommunityVote existingVote = new CommunityVote(post, student2);
        when(voteRepo.findByPostIdAndUserId(101L, 2L)).thenReturn(Optional.of(existingVote));
        CommunityPostDto afterRemove = communityService.toggleUpvote(101L, "bob@campus.edu");
        assertThat(afterRemove.upvotes()).isEqualTo(1);
        verify(voteRepo, times(1)).deleteByPostIdAndUserId(101L, 2L);
    }

    @Test
    @DisplayName("addComment persists comment and increments post comments count")
    void testAddComment() throws Exception {
        CommunityPost post = new CommunityPost("Discussion", "Topic", "qna", "Questions & Help", false, null, student1);
        setId(post, 102L);

        when(userRepo.findByEmail("bob@campus.edu")).thenReturn(Optional.of(student2));
        when(postRepo.findById(102L)).thenReturn(Optional.of(post));
        when(commentRepo.save(any(CommunityComment.class))).thenAnswer(inv -> {
            CommunityComment c = inv.getArgument(0);
            setId(c, 201L);
            return c;
        });

        CreateCommentRequest req = new CreateCommentRequest("Great point!");
        CommunityCommentDto commentDto = communityService.addComment(102L, req, "bob@campus.edu");

        assertThat(commentDto.text()).isEqualTo("Great point!");
        assertThat(commentDto.author().name()).isEqualTo("Bob Jones");
        assertThat(post.getCommentsCount()).isEqualTo(1);
        verify(postRepo, times(1)).save(post);
    }

    @Test
    @DisplayName("updateStatus succeeds for author and staff, fails for unauthorized user")
    void testUpdateStatusPermissions() throws Exception {
        CommunityPost post = new CommunityPost("Mess food", "Improve menu", "facilities", "Facilities & Feedback", true, "SUBMITTED", student1);
        setId(post, 103L);

        when(postRepo.findById(103L)).thenReturn(Optional.of(post));
        when(postRepo.save(any(CommunityPost.class))).thenAnswer(inv -> inv.getArgument(0));

        // Author updates status -> OK
        when(userRepo.findByEmail("alice@campus.edu")).thenReturn(Optional.of(student1));
        CommunityPostDto resAuthor = communityService.updateStatus(103L, new UpdateStatusRequest("UNDER_REVIEW"), "alice@campus.edu");
        assertThat(resAuthor.status()).isEqualTo("UNDER_REVIEW");

        // Faculty updates status -> OK
        when(userRepo.findByEmail("clark@campus.edu")).thenReturn(Optional.of(faculty));
        CommunityPostDto resFaculty = communityService.updateStatus(103L, new UpdateStatusRequest("RESOLVED"), "clark@campus.edu");
        assertThat(resFaculty.status()).isEqualTo("RESOLVED");

        // Another student updates status -> AccessDeniedException
        when(userRepo.findByEmail("bob@campus.edu")).thenReturn(Optional.of(student2));
        assertThatThrownBy(() -> communityService.updateStatus(103L, new UpdateStatusRequest("RESOLVED"), "bob@campus.edu"))
                .isInstanceOf(AccessDeniedException.class);
    }

    @Test
    @DisplayName("updateStatus throws BadRequestException when post is not a suggestion")
    void testUpdateStatusNonSuggestion() throws Exception {
        CommunityPost post = new CommunityPost("Exam prep", "Notes", "academics", "Academics & Study", false, null, student1);
        setId(post, 104L);

        when(postRepo.findById(104L)).thenReturn(Optional.of(post));
        when(userRepo.findByEmail("alice@campus.edu")).thenReturn(Optional.of(student1));

        assertThatThrownBy(() -> communityService.updateStatus(104L, new UpdateStatusRequest("RESOLVED"), "alice@campus.edu"))
                .isInstanceOf(BadRequestException.class);
    }

    @Test
    @DisplayName("deletePost allows author to delete own post")
    void testDeletePostAsAuthor() throws Exception {
        CommunityPost post = new CommunityPost("My post", "Content", "general", "General", false, null, student1);
        setId(post, 105L);

        when(postRepo.findById(105L)).thenReturn(Optional.of(post));
        when(userRepo.findByEmail("alice@campus.edu")).thenReturn(Optional.of(student1));

        communityService.deletePost(105L, "alice@campus.edu");
        verify(postRepo).delete(post);
        verify(moderationAuditLogRepo, never()).save(any());
    }

    @Test
    @DisplayName("deletePost allows ADMIN to delete any post and records audit log")
    void testDeletePostAsAdmin() throws Exception {
        CommunityPost post = new CommunityPost("Inappropriate post", "Content", "general", "General", false, null, student1);
        setId(post, 106L);

        when(postRepo.findById(106L)).thenReturn(Optional.of(post));
        when(userRepo.findByEmail("pathakaayushman57@gmail.com")).thenReturn(Optional.of(admin));

        communityService.deletePost(106L, "pathakaayushman57@gmail.com");
        verify(postRepo).delete(post);
        verify(moderationAuditLogRepo).save(any());
    }

    @Test
    @DisplayName("deletePost denies unauthorized students from deleting others' posts")
    void testDeletePostUnauthorized() throws Exception {
        CommunityPost post = new CommunityPost("Alice post", "Content", "general", "General", false, null, student1);
        setId(post, 107L);

        when(postRepo.findById(107L)).thenReturn(Optional.of(post));
        when(userRepo.findByEmail("bob@campus.edu")).thenReturn(Optional.of(student2));

        assertThatThrownBy(() -> communityService.deletePost(107L, "bob@campus.edu"))
                .isInstanceOf(AccessDeniedException.class);
        verify(postRepo, never()).delete(any());
    }

    @Test
    @DisplayName("resolveReports allows ADMIN to clear reports and records audit log")
    void testResolveReportsAsAdmin() throws Exception {
        CommunityPost post = new CommunityPost("Flagged post", "Content", "general", "General", false, null, student1);
        setId(post, 108L);
        post.setReportsCount(5);

        when(postRepo.findById(108L)).thenReturn(Optional.of(post));
        when(userRepo.findByEmail("pathakaayushman57@gmail.com")).thenReturn(Optional.of(admin));
        when(postRepo.save(any(CommunityPost.class))).thenAnswer(inv -> inv.getArgument(0));

        CommunityPostDto dto = communityService.resolveReports(108L, "pathakaayushman57@gmail.com");
        assertThat(dto.reportsCount()).isEqualTo(0);
        verify(reportRepo).deleteByPostId(108L);
        verify(moderationAuditLogRepo).save(any());
    }

    @Test
    @DisplayName("resolveReports denies non-admin users")
    void testResolveReportsUnauthorized() throws Exception {
        when(userRepo.findByEmail("bob@campus.edu")).thenReturn(Optional.of(student2));

        assertThatThrownBy(() -> communityService.resolveReports(109L, "bob@campus.edu"))
                .isInstanceOf(AccessDeniedException.class);
        verify(reportRepo, never()).deleteByPostId(any());
    }

    @Test
    @DisplayName("getPosts with recent sort preserves newest post first (24 mins ago vs 1 hour ago)")
    void testGetPostsChronologicalRecent() throws Exception {
        java.time.Instant now = java.time.Instant.now();
        CommunityPost post24MinAgo = new CommunityPost("Recent Post", "Content", "general", "General", false, null, student1);
        setId(post24MinAgo, 201L);
        java.lang.reflect.Field createdField = CommunityPost.class.getDeclaredField("createdAt");
        createdField.setAccessible(true);
        createdField.set(post24MinAgo, now.minusSeconds(24 * 60));

        CommunityPost post1HourAgo = new CommunityPost("Older Post", "Content", "general", "General", false, null, student2);
        setId(post1HourAgo, 202L);
        createdField.set(post1HourAgo, now.minusSeconds(3600));

        when(postRepo.findFilteredRecent(null, null)).thenReturn(java.util.List.of(post24MinAgo, post1HourAgo));
        when(userRepo.findByEmail("alice@campus.edu")).thenReturn(Optional.of(student1));

        java.util.List<CommunityPostDto> dtos = communityService.getPosts("all", "recent", null, "alice@campus.edu");

        assertThat(dtos).hasSize(2);
        assertThat(dtos.get(0).id()).isEqualTo(201L);
        assertThat(dtos.get(1).id()).isEqualTo(202L);
        assertThat(dtos.get(0).createdAt()).isAfter(dtos.get(1).createdAt());
    }
}
