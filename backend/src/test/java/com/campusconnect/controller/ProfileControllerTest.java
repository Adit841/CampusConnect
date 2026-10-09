package com.campusconnect.controller;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.put;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import java.security.Principal;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.MediaType;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;

import com.campusconnect.dto.ProfileResponse;
import com.campusconnect.dto.StudentProfileResponse;
import com.campusconnect.dto.UpdateProfileRequest;
import com.campusconnect.entity.Role;
import com.campusconnect.exception.GlobalExceptionHandler;
import com.campusconnect.service.ProfileService;

@ExtendWith(MockitoExtension.class)
class ProfileControllerTest {

    private MockMvc mockMvc;

    @Mock
    private ProfileService profileService;

    @InjectMocks
    private ProfileController profileController;

    @BeforeEach
    void setUp() {
        mockMvc = MockMvcBuilders.standaloneSetup(profileController)
                .setControllerAdvice(new GlobalExceptionHandler())
                .build();
    }

    @Test
    void testGetProfileSuccess() throws Exception {
        ProfileResponse response = new ProfileResponse();
        response.setId(1L);
        response.setName("Alice");
        response.setEmail("alice@example.com");
        response.setRole(Role.STUDENT);
        StudentProfileResponse sp = new StudentProfileResponse(1L, "EN001", "101", "B.Tech", "CS", 1, "A");
        response.setStudentProfile(sp);

        when(profileService.getProfile("alice@example.com")).thenReturn(response);

        Principal principal = new UsernamePasswordAuthenticationToken("alice@example.com", "pass");

        mockMvc.perform(get("/api/profile").principal(principal))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.email").value("alice@example.com"))
                .andExpect(jsonPath("$.studentProfile.enrollmentNo").value("EN001"));
    }

    @Test
    void testUpdateProfileSuccess() throws Exception {
        ProfileResponse response = new ProfileResponse();
        response.setId(1L);
        response.setName("Alice Updated");
        response.setEmail("alice@example.com");
        response.setRole(Role.STUDENT);

        when(profileService.updateProfile(eq("alice@example.com"), any(UpdateProfileRequest.class)))
                .thenReturn(response);

        Principal principal = new UsernamePasswordAuthenticationToken("alice@example.com", "pass");

        String payload = """
            {
                "name": "Alice Updated",
                "bio": "New Bio"
            }
        """;

        mockMvc.perform(put("/api/profile")
                        .principal(principal)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(payload))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.name").value("Alice Updated"));
    }
}
