package com.campusconnect.controller;

import com.campusconnect.dto.*;
import com.campusconnect.exception.GlobalExceptionHandler;
import com.campusconnect.service.CommunityService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;

import java.security.Principal;
import java.time.Instant;
import java.util.Collections;
import java.util.List;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@ExtendWith(MockitoExtension.class)
class CommunityControllerTest {

    private MockMvc mockMvc;

    @Mock
    private CommunityService communityService;

    @InjectMocks
    private CommunityController communityController;

    private Principal principal;

    @BeforeEach
    void setUp() {
        mockMvc = MockMvcBuilders.standaloneSetup(communityController)
                .setControllerAdvice(new GlobalExceptionHandler())
                .build();
        principal = () -> "alice@campus.edu";
    }

    @Test
    @DisplayName("GET /api/community/posts returns list of posts")
    void testListPosts() throws Exception {
        CommunityAuthorDto author = new CommunityAuthorDto(1L, "Alice Smith", "STUDENT", "Computer Engineering", "AS");
        CommunityPostDto post = new CommunityPostDto(
                10L, "Study Group", "Java Revision", "academics", "Academics & Study",
                false, null, author, Instant.now(), Instant.now(), 5, List.of("1"), true, 0, Collections.emptyList(), 0, Collections.emptyList()
        );

        when(communityService.getPosts("all", "trending", null, "alice@campus.edu"))
                .thenReturn(List.of(post));

        mockMvc.perform(get("/api/community/posts").principal(principal))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].id").value(10))
                .andExpect(jsonPath("$[0].title").value("Study Group"))
                .andExpect(jsonPath("$[0].category").value("academics"))
                .andExpect(jsonPath("$[0].upvotes").value(5));
    }

    @Test
    @DisplayName("POST /api/community/posts returns 201 Created")
    void testCreatePost() throws Exception {
        CommunityAuthorDto author = new CommunityAuthorDto(1L, "Alice Smith", "STUDENT", "Computer Engineering", "AS");
        CommunityPostDto post = new CommunityPostDto(
                11L, "New Suggestion", "Detail description", "facilities", "Facilities & Feedback",
                true, "SUBMITTED", author, Instant.now(), Instant.now(), 1, List.of("1"), true, 0, Collections.emptyList(), 0, Collections.emptyList()
        );

        when(communityService.createPost(any(CreatePostRequest.class), eq("alice@campus.edu")))
                .thenReturn(post);

        String json = """
            {
                "title": "New Suggestion",
                "content": "Detail description",
                "category": "facilities",
                "isSuggestion": true
            }
        """;

        mockMvc.perform(post("/api/community/posts")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(json)
                        .principal(principal))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.id").value(11))
                .andExpect(jsonPath("$.status").value("SUBMITTED"));
    }

    @Test
    @DisplayName("POST /api/community/posts returns 401 when principal is null")
    void testCreatePostUnauthenticated() throws Exception {
        String json = """
            {
                "title": "New Suggestion",
                "content": "Detail description",
                "category": "facilities",
                "isSuggestion": true
            }
        """;

        mockMvc.perform(post("/api/community/posts")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(json))
                .andExpect(status().isUnauthorized());
    }

    @Test
    @DisplayName("POST /api/community/posts/{id}/upvote toggles vote")
    void testToggleUpvote() throws Exception {
        CommunityAuthorDto author = new CommunityAuthorDto(1L, "Alice Smith", "STUDENT", "Computer Engineering", "AS");
        CommunityPostDto post = new CommunityPostDto(
                10L, "Study Group", "Java Revision", "academics", "Academics & Study",
                false, null, author, Instant.now(), Instant.now(), 6, List.of("1", "2"), true, 0, Collections.emptyList(), 0, Collections.emptyList()
        );

        when(communityService.toggleUpvote(10L, "alice@campus.edu")).thenReturn(post);

        mockMvc.perform(post("/api/community/posts/10/upvote").principal(principal))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.upvotes").value(6))
                .andExpect(jsonPath("$.hasUpvoted").value(true));
    }

    @Test
    @DisplayName("POST /api/community/posts/{id}/comments adds comment")
    void testAddComment() throws Exception {
        CommunityAuthorDto author = new CommunityAuthorDto(1L, "Alice Smith", "STUDENT", "Computer Engineering", "AS");
        CommunityCommentDto comment = new CommunityCommentDto(100L, author, "Looking forward to it!", Instant.now());

        when(communityService.addComment(eq(10L), any(CreateCommentRequest.class), eq("alice@campus.edu")))
                .thenReturn(comment);

        String json = """
            {
                "text": "Looking forward to it!"
            }
        """;

        mockMvc.perform(post("/api/community/posts/10/comments")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(json)
                        .principal(principal))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.id").value(100))
                .andExpect(jsonPath("$.text").value("Looking forward to it!"));
    }

    @Test
    @DisplayName("PATCH /api/community/posts/{id}/status validates input")
    void testUpdateStatusValidation() throws Exception {
        String invalidJson = """
            {
                "status": "INVALID_STATUS"
            }
        """;

        mockMvc.perform(patch("/api/community/posts/10/status")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(invalidJson)
                        .principal(principal))
                .andExpect(status().isBadRequest());
    }
}
