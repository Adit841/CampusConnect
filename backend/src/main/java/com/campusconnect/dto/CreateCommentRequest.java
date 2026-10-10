package com.campusconnect.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record CreateCommentRequest(
        @NotBlank(message = "Comment text must not be blank")
        @Size(max = 4000, message = "Comment must not exceed 4000 characters")
        String text
) {}
