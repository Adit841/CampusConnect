package com.campusconnect.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.campusconnect.dto.ProfileResponse;
import com.campusconnect.dto.UpdateProfileRequest;
import com.campusconnect.service.ProfileService;

@RestController
@RequestMapping("/api/profile")
public class ProfileController {

    private final ProfileService profileService;

    public ProfileController(ProfileService profileService) {
        this.profileService = profileService;
    }

    @GetMapping
    public ResponseEntity<ProfileResponse> getProfile(Authentication authentication) {
        String email = authentication.getName();
        ProfileResponse response = profileService.getProfile(email);
        return ResponseEntity.ok(response);
    }

    @PutMapping
    public ResponseEntity<ProfileResponse> updateProfile(
            Authentication authentication,
            @RequestBody UpdateProfileRequest request
    ) {
        String email = authentication.getName();
        ProfileResponse response = profileService.updateProfile(email, request);
        return ResponseEntity.ok(response);
    }
}
