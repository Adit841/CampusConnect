package com.campusconnect.entity;

import jakarta.persistence.*;
import java.time.Instant;

@Entity
@Table(
        name = "moderation_audit_logs",
        indexes = {
                @Index(name = "idx_mod_logs_created_at", columnList = "created_at"),
                @Index(name = "idx_mod_logs_moderator", columnList = "moderator_email")
        }
)
public class ModerationAuditLog {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, length = 64)
    private String action;

    @Column(name = "target_type", nullable = false, length = 32)
    private String targetType;

    @Column(name = "target_id", nullable = false)
    private Long targetId;

    @Column(columnDefinition = "TEXT")
    private String details;

    @Column(name = "moderator_email", nullable = false, length = 128)
    private String moderatorEmail;

    @Column(name = "created_at", nullable = false, updatable = false)
    private Instant createdAt;

    public ModerationAuditLog() {}

    public ModerationAuditLog(String action, String targetType, Long targetId, String details, String moderatorEmail) {
        this.action = action;
        this.targetType = targetType;
        this.targetId = targetId;
        this.details = details;
        this.moderatorEmail = moderatorEmail;
    }

    @PrePersist
    protected void onCreate() {
        this.createdAt = Instant.now();
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getAction() {
        return action;
    }

    public void setAction(String action) {
        this.action = action;
    }

    public String getTargetType() {
        return targetType;
    }

    public void setTargetType(String targetType) {
        this.targetType = targetType;
    }

    public Long getTargetId() {
        return targetId;
    }

    public void setTargetId(Long targetId) {
        this.targetId = targetId;
    }

    public String getDetails() {
        return details;
    }

    public void setDetails(String details) {
        this.details = details;
    }

    public String getModeratorEmail() {
        return moderatorEmail;
    }

    public void setModeratorEmail(String moderatorEmail) {
        this.moderatorEmail = moderatorEmail;
    }

    public Instant getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(Instant createdAt) {
        this.createdAt = createdAt;
    }
}
