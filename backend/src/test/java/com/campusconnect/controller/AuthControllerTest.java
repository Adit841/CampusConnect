package com.campusconnect.controller;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;

import com.campusconnect.dto.AuthResponse;
import com.campusconnect.dto.UserResponse;
import com.campusconnect.entity.Role;
import com.campusconnect.exception.BadRequestException;
import com.campusconnect.exception.GlobalExceptionHandler;
import com.campusconnect.service.AuthService;
import com.fasterxml.jackson.databind.ObjectMapper;

@ExtendWith(MockitoExtension.class)
class AuthControllerTest {

    private MockMvc mockMvc;

    @Mock
    private AuthService authService;

    @InjectMocks
    private AuthController authController;

    private ObjectMapper objectMapper;

    @BeforeEach
    void setUp() {
        mockMvc = MockMvcBuilders.standaloneSetup(authController)
                .setControllerAdvice(new GlobalExceptionHandler())
                .build();
        objectMapper = new ObjectMapper();
    }

    @Test
    void testRegisterSuccess() throws Exception {
        UserResponse user = new UserResponse();
        user.setId(1L);
        user.setEmail("student@test.com");
        user.setName("Student");
        user.setRole(Role.STUDENT);

        AuthResponse authResponse = new AuthResponse("sample.jwt.token", user);
        when(authService.register(any())).thenReturn(authResponse);

        String payload = """
            {
                "name": "Student",
                "email": "student@test.com",
                "password": "password123",
                "role": "STUDENT",
                "enrollmentNo": "EN001"
            }
        """;

        mockMvc.perform(post("/api/auth/register")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(payload))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.token").value("sample.jwt.token"))
                .andExpect(jsonPath("$.user.email").value("student@test.com"))
                .andExpect(jsonPath("$.user.role").value("STUDENT"));
    }

    @Test
    void testRegisterValidationFailure() throws Exception {
        String invalidPayload = """
            {
                "name": "",
                "email": "invalid-email",
                "password": "123"
            }
        """;

        mockMvc.perform(post("/api/auth/register")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(invalidPayload))
                .andExpect(status().isBadRequest());
    }

    @Test
    void testLoginSuccess() throws Exception {
        UserResponse user = new UserResponse();
        user.setId(1L);
        user.setEmail("student@test.com");
        user.setRole(Role.STUDENT);

        AuthResponse authResponse = new AuthResponse("sample.jwt.token", user);
        when(authService.login(any())).thenReturn(authResponse);

        String payload = """
            {
                "email": "student@test.com",
                "password": "password123"
            }
        """;

        mockMvc.perform(post("/api/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(payload))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.token").value("sample.jwt.token"))
                .andExpect(jsonPath("$.user.email").value("student@test.com"));
    }

    @Test
    void testDuplicateEmailReturnsBadRequest() throws Exception {
        when(authService.register(any())).thenThrow(new BadRequestException("Email is already registered: student@test.com"));

        String payload = """
            {
                "name": "Student",
                "email": "student@test.com",
                "password": "password123",
                "role": "STUDENT",
                "enrollmentNo": "EN001"
            }
        """;

        mockMvc.perform(post("/api/auth/register")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(payload))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.message").value("Email is already registered: student@test.com"));
    }
}
