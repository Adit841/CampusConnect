package com.campusconnect.dto;

import com.campusconnect.entity.User;

/**
 * Lightweight DTO used by the "New Conversation" user picker in the chat module.
 *
 * <p>Deliberately exposes only the fields the frontend needs to render a user
 * row in the search results — no password, phone, bio, or timestamps.</p>
 *
 * @param id           User ID (used in {@link CreateConversationRequest}).
 * @param name         Display name.
 * @param email        Email / username.
 * @param role         Role string (STUDENT, TEACHER, ADMIN).
 * @param profileImage URL to the profile image, or {@code null}.
 */
public record ChatUserDto(
        Long id,
        String name,
        String email,
        String role,
        String profileImage
) {
    public static ChatUserDto from(User user) {
        return new ChatUserDto(
                user.getId(),
                user.getName(),
                user.getEmail(),
                user.getRole() != null ? user.getRole().name() : null,
                user.getProfileImage()
        );
    }
}
