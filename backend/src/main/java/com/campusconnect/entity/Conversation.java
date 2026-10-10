package com.campusconnect.entity;

import jakarta.persistence.*;

import java.time.Instant;
import java.util.ArrayList;
import java.util.List;

/**
 * Represents a private one-to-one conversation between two CampusConnect users.
 *
 * <p>A conversation is identified by its {@code id}. Participant membership is
 * stored in {@link ConversationParticipant}.  Messages are stored in {@link Message}.</p>
 *
 * <p>Uniqueness of a one-to-one conversation is enforced at the service layer
 * ({@link com.campusconnect.service.ConversationService#findOrCreate}) rather than
 * via a DB constraint, because the "pair" constraint requires ordered IDs and is
 * cleaner to express in Java.</p>
 */
@Entity
@Table(name = "conversations")
public class Conversation {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "created_at", nullable = false, updatable = false)
    private Instant createdAt;

    @Column(name = "last_activity_at")
    private Instant lastActivityAt;

    @OneToMany(mappedBy = "conversation", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<ConversationParticipant> participants = new ArrayList<>();

    @OneToMany(mappedBy = "conversation", cascade = CascadeType.ALL, orphanRemoval = true)
    @OrderBy("sentAt ASC, id ASC")
    private List<Message> messages = new ArrayList<>();

    @PrePersist
    private void prePersist() {
        this.createdAt = Instant.now();
        if (this.lastActivityAt == null) {
            this.lastActivityAt = this.createdAt;
        }
    }

    // ── Constructors ──────────────────────────────────────────────────────────

    public Conversation() {}

    // ── Getters & Setters ─────────────────────────────────────────────────────

    public Long getId() { return id; }

    public Instant getCreatedAt() { return createdAt; }

    public Instant getLastActivityAt() {
        return lastActivityAt != null ? lastActivityAt : createdAt;
    }

    public void setLastActivityAt(Instant lastActivityAt) {
        this.lastActivityAt = lastActivityAt;
    }

    public List<ConversationParticipant> getParticipants() { return participants; }

    public List<Message> getMessages() { return messages; }
}
