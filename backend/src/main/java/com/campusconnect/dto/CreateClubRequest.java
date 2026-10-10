package com.campusconnect.dto;

import com.campusconnect.entity.ClubCategory;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

public record CreateClubRequest(
    @NotBlank(message = "Club name is required")
    @Size(min = 2, max = 255, message = "Club name must be between 2 and 255 characters")
    String name,

    @NotNull(message = "Category is required")
    ClubCategory category,

    @Size(max = 500, message = "Tagline must not exceed 500 characters")
    String tagline,

    @NotBlank(message = "Description is required")
    String description,

    String activities,
    String logoUrl,
    String bannerUrl,
    String contactEmail,
    Long leadCoordinatorId
) {}
