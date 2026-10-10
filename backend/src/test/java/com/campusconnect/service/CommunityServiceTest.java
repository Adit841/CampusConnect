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
import java.time.Instant;
import java.util.ArrayList;
import java.util.Collections;
import java.util.List;
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

    @InjectMocks
    private CommunityService communityService;

    private User student1;
    private User student2;
    private User faculty;

    @BeforeEach
    void setUp() throws Exception {
        student1 = new User("Alice Smith", "alice@campus.edu", "pass", Role.STUDENT);
        setId(student1, 1L);

        student2 = new User("Bob Jones", "bob@campus.edu", "pass", Role.STUDENT);
        setId(student2, 2L);

        faculty = new User("Dr. Clark", "clark@campus.edu", "pass", Role.TEACHER);
        setId(faculty, 3L);
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
}
