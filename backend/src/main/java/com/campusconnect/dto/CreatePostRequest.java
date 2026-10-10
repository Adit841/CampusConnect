package com.campusconnect.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record CreatePostRequest(
        @NotBlank(message = "Title must not be blank")
        @Size(max = 255, message = "Title must not exceed 255 characters")
        String title,

        @NotBlank(message = "Content must not be blank")
        @Size(max = 10000, message = "Content must not exceed 10000 characters")
        String content,

        @NotBlank(message = "Category must not be blank")
        @Size(max = 64, message = "Category must not exceed 64 characters")
        String category,

        Boolean isSuggestion
) {}
