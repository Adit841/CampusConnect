package com.campusconnect.entity;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

import java.time.Instant;

/**
 * A single chat message sent within a {@link Conversation}.
 *
 * <h3>Deduplication</h3>
 * <p>The {@code clientMsgId} column stores a client-generated UUID that the frontend
 * supplies with every send request.  The service layer checks this UUID before
 * persisting a new message, preventing duplicate rows caused by retries or
 * reconnections.  The unique constraint is enforced at the database level.</p>
 */
@Entity
@Table(
        name = "messages",
        indexes = {
                @Index(name = "idx_messages_conversation_sent", columnList = "conversation_id, sent_at")
        },
        uniqueConstraints = @UniqueConstraint(
                name = "uk_messages_client_msg_id",
                columnNames = "client_msg_id"
        )
)
public class Message {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "conversation_id", nullable = false)
    private Conversation conversation;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "sender_id", nullable = false)
    private User sender;

    @NotBlank
    @Size(max = 4000)
    @Column(nullable = false, length = 4000)
    private String content;

    @Column(name = "sent_at", nullable = false, updatable = false)
    private Instant sentAt;

    /**
     * Client-generated UUID used to deduplicate retried sends.
     * Must be unique across all messages in the database.
     */
    @Column(name = "client_msg_id", nullable = false, updatable = false, length = 36)
    private String clientMsgId;

    @PrePersist
    private void prePersist() {
        this.sentAt = Instant.now();
    }

    // ── Constructors ──────────────────────────────────────────────────────────

    public Message() {}

    public Message(Conversation conversation, User sender, String content, String clientMsgId) {
        this.conversation = conversation;
        this.sender = sender;
        this.content = content;
        this.clientMsgId = clientMsgId;
    }

    // ── Getters ───────────────────────────────────────────────────────────────

    public Long getId() { return id; }

    public Conversation getConversation() { return conversation; }

    public User getSender() { return sender; }

    public String getContent() { return content; }

    public Instant getSentAt() { return sentAt; }

    public String getClientMsgId() { return clientMsgId; }
}
