package com.campusconnect.dto;

import java.time.LocalDateTime;

import com.campusconnect.entity.RegistrationStatus;
import com.campusconnect.entity.Role;

public record EventAttendeeDto(
    Long registrationId,
    Long userId,
    String userName,
    String userEmail,
    Role userRole,
    RegistrationStatus status,
    LocalDateTime registeredAt
) {}
