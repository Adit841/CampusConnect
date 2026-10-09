package com.campusconnect.security;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertTrue;

import java.util.Collections;
import java.util.HashMap;
import java.util.Map;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.test.util.ReflectionTestUtils;

import com.campusconnect.entity.Role;
import com.campusconnect.entity.User;

class JwtServiceTest {

    private JwtService jwtService;

    @BeforeEach
    void setUp() {
        jwtService = new JwtService();
        // 64-character secret key for HMAC-SHA256
        ReflectionTestUtils.setField(jwtService, "jwtSecret", "404E635266556A586E3272357538782F413F4428472B4B6250645367566B5970");
        ReflectionTestUtils.setField(jwtService, "jwtExpirationMs", 3600000L);
    }

    @Test
    void testGenerateAndValidateToken() {
        User user = new User("Alice", "alice@example.com", "hashedpass", Role.STUDENT);
        user.setId(1L);
        CustomUserDetails userDetails = new CustomUserDetails(user);

        Map<String, Object> claims = new HashMap<>();
        claims.put("role", user.getRole().name());
        claims.put("userId", user.getId());

        String token = jwtService.generateToken(claims, userDetails);
        assertNotNull(token);

        String username = jwtService.extractUsername(token);
        assertEquals("alice@example.com", username);

        assertTrue(jwtService.isTokenValid(token, userDetails));
    }

    @Test
    void testTokenInvalidForDifferentUser() {
        User user1 = new User("Alice", "alice@example.com", "hashedpass", Role.STUDENT);
        user1.setId(1L);
        CustomUserDetails userDetails1 = new CustomUserDetails(user1);

        User user2 = new User("Bob", "bob@example.com", "hashedpass", Role.STUDENT);
        user2.setId(2L);
        CustomUserDetails userDetails2 = new CustomUserDetails(user2);

        String token = jwtService.generateToken(userDetails1);
        assertFalse(jwtService.isTokenValid(token, userDetails2));
    }
}
