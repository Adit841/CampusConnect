package com.campusconnect.controller;

import com.campusconnect.dto.ChatUserDto;
import com.campusconnect.dto.ConversationSummaryDto;
import com.campusconnect.dto.CreateConversationRequest;
import com.campusconnect.entity.Role;
import com.campusconnect.exception.GlobalExceptionHandler;
import com.campusconnect.service.ConversationService;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.BeforeEach;
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
import java.util.List;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@ExtendWith(MockitoExtension.class)
class ConversationControllerTest {

    private MockMvc mockMvc;

    @Mock
    private ConversationService conversationService;

    @InjectMocks
    private ConversationController conversationController;

    private ObjectMapper objectMapper;

    @BeforeEach
    void setUp() {
        mockMvc = MockMvcBuilders.standaloneSetup(conversationController)
                .setControllerAdvice(new GlobalExceptionHandler())
                .build();
        objectMapper = new ObjectMapper();
    }

    @Test
    void list_returnsUnauthorizedWhenPrincipalNull() throws Exception {
        mockMvc.perform(get("/api/conversations"))
                .andExpect(status().isUnauthorized());
    }

    @Test
    void list_returnsConversationsWhenAuthenticated() throws Exception {
        ConversationSummaryDto summary = new ConversationSummaryDto(
                1L, 2L, "bob@test.com", "Bob Jones", "Hello", Instant.now(), 0);
        when(conversationService.listForUser("alice@test.com")).thenReturn(List.of(summary));

        Principal principal = () -> "alice@test.com";

        mockMvc.perform(get("/api/conversations").principal(principal))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].id").value(1L))
                .andExpect(jsonPath("$[0].otherParticipantDisplayName").value("Bob Jones"));
    }

    @Test
    void create_returnsUnauthorizedWhenPrincipalNull() throws Exception {
        CreateConversationRequest request = new CreateConversationRequest(2L);
        mockMvc.perform(post("/api/conversations")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isUnauthorized());
    }

    @Test
    void create_returnsBadRequestWhenTargetUserIdMissing() throws Exception {
        Principal principal = () -> "alice@test.com";

        mockMvc.perform(post("/api/conversations")
                        .principal(principal)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{}"))
                .andExpect(status().isBadRequest());
    }

    @Test
    void create_returnsConversationWhenValid() throws Exception {
        Principal principal = () -> "alice@test.com";
        CreateConversationRequest request = new CreateConversationRequest(2L);
        ConversationSummaryDto summary = new ConversationSummaryDto(
                10L, 2L, "bob@test.com", "Bob Jones", null, Instant.now(), 0);

        when(conversationService.findOrCreate(eq("alice@test.com"), any(CreateConversationRequest.class)))
                .thenReturn(summary);

        mockMvc.perform(post("/api/conversations")
                        .principal(principal)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id").value(10L))
                .andExpect(jsonPath("$.otherParticipantId").value(2L));
    }

    @Test
    void searchUsers_returnsUnauthorizedWhenPrincipalNull() throws Exception {
        mockMvc.perform(get("/api/conversations/users/search").param("q", "bob"))
                .andExpect(status().isUnauthorized());
    }

    @Test
    void searchUsers_returnsResultsWhenAuthenticated() throws Exception {
        Principal principal = () -> "alice@test.com";
        ChatUserDto user = new ChatUserDto(2L, "Bob Jones", "bob@test.com", "STUDENT", null);

        when(conversationService.searchUsers("alice@test.com", "bob")).thenReturn(List.of(user));

        mockMvc.perform(get("/api/conversations/users/search")
                        .principal(principal)
                        .param("q", "bob"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].id").value(2L))
                .andExpect(jsonPath("$[0].name").value("Bob Jones"));
    }
}
