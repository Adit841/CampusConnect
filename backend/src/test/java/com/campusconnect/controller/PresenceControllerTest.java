package com.campusconnect.controller;

import com.campusconnect.exception.GlobalExceptionHandler;
import com.campusconnect.service.PresenceService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;

import java.security.Principal;
import java.util.List;
import java.util.Map;

import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@ExtendWith(MockitoExtension.class)
class PresenceControllerTest {

    private MockMvc mockMvc;

    @Mock
    private PresenceService presenceService;

    @InjectMocks
    private PresenceController presenceController;

    @BeforeEach
    void setUp() {
        mockMvc = MockMvcBuilders.standaloneSetup(presenceController)
                .setControllerAdvice(new GlobalExceptionHandler())
                .build();
    }

    @Test
    void getPresence_returnsUnauthorizedWhenPrincipalNull() throws Exception {
        mockMvc.perform(get("/api/presence/1"))
                .andExpect(status().isUnauthorized());
    }

    @Test
    void getPresence_returnsStatusWhenAuthenticated() throws Exception {
        Principal principal = () -> "alice@test.com";
        when(presenceService.getStatus(2L)).thenReturn("ONLINE");

        mockMvc.perform(get("/api/presence/2").principal(principal))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.userId").value(2))
                .andExpect(jsonPath("$.status").value("ONLINE"));
    }

    @Test
    void getBatchPresence_returnsStatuses() throws Exception {
        Principal principal = () -> "alice@test.com";
        when(presenceService.getBatchStatus(List.of(1L, 2L))).thenReturn(Map.of(1L, "ONLINE", 2L, "OFFLINE"));

        mockMvc.perform(get("/api/presence/batch").param("userIds", "1,2").principal(principal))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.1").value("ONLINE"))
                .andExpect(jsonPath("$.2").value("OFFLINE"));
    }
}
