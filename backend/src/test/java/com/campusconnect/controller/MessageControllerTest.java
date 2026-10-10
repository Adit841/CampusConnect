package com.campusconnect.controller;

import com.campusconnect.dto.MessageDto;
import com.campusconnect.dto.SendMessageRequest;
import com.campusconnect.entity.Conversation;
import com.campusconnect.entity.Role;
import com.campusconnect.entity.User;
import com.campusconnect.exception.GlobalExceptionHandler;
import com.campusconnect.service.ConversationService;
import com.campusconnect.service.MessageService;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;

import java.security.Principal;
import java.time.Instant;
import java.util.List;
import java.util.UUID;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@ExtendWith(MockitoExtension.class)
class MessageControllerTest {

    private MockMvc mockMvc;

    @Mock
    private ConversationService conversationService;

    @Mock
    private MessageService messageService;

    @Mock
    private org.springframework.messaging.simp.SimpMessagingTemplate messagingTemplate;

    @InjectMocks
    private MessageController messageController;

    private ObjectMapper objectMapper;

    @BeforeEach
    void setUp() {
        mockMvc = MockMvcBuilders.standaloneSetup(messageController)
                .setControllerAdvice(new GlobalExceptionHandler())
                .build();
        objectMapper = new ObjectMapper();
    }

    @Test
    void list_returnsUnauthorizedWhenPrincipalNull() throws Exception {
        mockMvc.perform(get("/api/conversations/1/messages"))
                .andExpect(status().isUnauthorized());
    }

    @Test
    void list_returnsMessagesWhenAuthenticated() throws Exception {
        Principal principal = () -> "alice@test.com";
        Conversation conv = new Conversation();
        MessageDto msg = new MessageDto(100L, 1L, 1L, "alice@test.com", "Alice", "Hello", Instant.now(), UUID.randomUUID().toString());
        Page<MessageDto> page = new PageImpl<>(List.of(msg), org.springframework.data.domain.PageRequest.of(0, 50), 1);

        when(conversationService.requireMembership(1L, "alice@test.com")).thenReturn(conv);
        when(messageService.getHistory(conv, 0)).thenReturn(page);

        mockMvc.perform(get("/api/conversations/1/messages").principal(principal))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.content[0].id").value(100L))
                .andExpect(jsonPath("$.content[0].content").value("Hello"));
    }

    @Test
    void send_returnsUnauthorizedWhenPrincipalNull() throws Exception {
        SendMessageRequest request = new SendMessageRequest("Hello", UUID.randomUUID().toString());
        mockMvc.perform(post("/api/conversations/1/messages")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isUnauthorized());
    }

    @Test
    void send_returnsBadRequestWhenContentBlank() throws Exception {
        Principal principal = () -> "alice@test.com";
        SendMessageRequest request = new SendMessageRequest("   ", UUID.randomUUID().toString());

        mockMvc.perform(post("/api/conversations/1/messages")
                        .principal(principal)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isBadRequest());
    }

    @Test
    void send_returnsBadRequestWhenClientMsgIdMissing() throws Exception {
        Principal principal = () -> "alice@test.com";
        String payload = "{\"content\": \"Hello\"}";

        mockMvc.perform(post("/api/conversations/1/messages")
                        .principal(principal)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(payload))
                .andExpect(status().isBadRequest());
    }

    @Test
    void send_persistsAndReturnsMessageWhenValid() throws Exception {
        Principal principal = () -> "alice@test.com";
        String uuid = UUID.randomUUID().toString();
        SendMessageRequest request = new SendMessageRequest("Hello Bob", uuid);

        Conversation conv = new Conversation();
        User alice = new User("Alice", "alice@test.com", "pass", Role.STUDENT);
        MessageDto saved = new MessageDto(101L, 1L, 1L, "alice@test.com", "Alice", "Hello Bob", Instant.now(), uuid);

        when(conversationService.requireMembership(1L, "alice@test.com")).thenReturn(conv);
        when(conversationService.requireUser("alice@test.com")).thenReturn(alice);
        when(messageService.send(eq(conv), eq(alice), any(SendMessageRequest.class))).thenReturn(saved);

        mockMvc.perform(post("/api/conversations/1/messages")
                        .principal(principal)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id").value(101L))
                .andExpect(jsonPath("$.content").value("Hello Bob"))
                .andExpect(jsonPath("$.clientMsgId").value(uuid));
    }
}
