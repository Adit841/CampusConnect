package com.campusconnect.entity;

import jakarta.persistence.*;

import java.time.Instant;

/**
 * Join entity between {@link Conversation} and {@link User}.
 *
 * <p>A unique constraint on {@code (conversation_id, user_id)} prevents the same
 * user from being added to a conversation more than once.</p>
 */
@Entity
@Table(
        name = "conversation_participants",
        uniqueConstraints = @UniqueConstraint(
                name = "uk_cp_conversation_user",
                columnNames = {"conversation_id", "user_id"}
        )
)
public class ConversationParticipant {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "conversation_id", nullable = false)
    private Conversation conversation;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @Column(name = "joined_at", nullable = false, updatable = false)
    private Instant joinedAt;

    @PrePersist
    private void prePersist() {
        this.joinedAt = Instant.now();
    }

    // ── Constructors ──────────────────────────────────────────────────────────

    public ConversationParticipant() {}

    public ConversationParticipant(Conversation conversation, User user) {
        this.conversation = conversation;
        this.user = user;
    }

    // ── Getters ───────────────────────────────────────────────────────────────

    public Long getId() { return id; }

    public Conversation getConversation() { return conversation; }

    public User getUser() { return user; }

    public Instant getJoinedAt() { return joinedAt; }
}
